import os,io
import re
import fitz
import qrcode
import random
import barcode
from barcode.writer import ImageWriter
from PIL import Image
import numpy as np

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from auth.dependencies import get_current_user

router = APIRouter(
    prefix="/pdf", tags=["PDF Processing"], dependencies=[Depends(get_current_user)]
)

OUTPUT_DIR = "mini-reports-output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# =====================================================
# HELPER: Convert file paths to URLs
# =====================================================
def path_to_url(file_path: str) -> str:
    """Convert Windows/Unix file paths to URL paths"""
    if not file_path:
        return ""
    # Convert backslashes to forward slashes
    url_path = file_path.replace("\\", "/")
    # Extract the relative path from mini-reports-output
    if "mini-reports-output" in url_path:
        return f"/mini-reports/{url_path.split('mini-reports-output/')[-1]}"
    return f"/{url_path}"


# =====================================================
# SINGLE + MULTI PDF UPLOAD (🔥 ONE ENDPOINT)
# =====================================================
@router.post("/small-reports")
async def upload_pdf(files: list[UploadFile] = File(...)):
    if not (1 <= len(files) <= 2):
        raise HTTPException(
            status_code=400, detail="You can upload minimum 1 and maximum 2 PDF files"
        )

    results = []

    for pdf in files:
        if pdf.content_type != "application/pdf":
            raise HTTPException(
                status_code=400, detail=f"{pdf.filename} is not a valid PDF"
            )

        pdf_bytes = await pdf.read()
        result = parse_gia_report_from_bytes(pdf_bytes, pdf.filename)
        results.append(result)

    return {"count": len(results), "reports": results}


# =====================================================
# SINGLE PDF PARSER (UNCHANGED CORE LOGIC)
# =====================================================
def parse_gia_report_from_bytes(pdf_bytes: bytes, filename: str):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    text = ""
    for page in doc:
        text += page.get_text()

    parsed_data = _parse_text_to_json(text)
    report_number = parsed_data.get("ReportNumber") or os.path.splitext(filename)[0]

    report_folder = os.path.join(OUTPUT_DIR, report_number)
    os.makedirs(report_folder, exist_ok=True)

    proportions_path = _extract_diamond_image_advanced(doc, report_folder)
    qr_path = _extract_qr_from_pdf(doc, report_folder)

    if not qr_path:
        qr_path = _create_and_save_qr_code(report_number, report_folder)

    barcode10_number, barcode10_path = _generate_unique_barcode(
        digits=10, save_path_no_ext=os.path.join(report_folder, "barcode10")
    )

    barcode12_number, barcode12_path = _generate_unique_barcode(
        digits=12, save_path_no_ext=os.path.join(report_folder, "barcode12")
    )

    parsed_data["Images"] = {
        "Proportions": path_to_url(proportions_path),
        "QRCode": path_to_url(qr_path),
        "Barcode10": {"number": barcode10_number, "image": path_to_url(barcode10_path)},
        "Barcode12": {"number": barcode12_number, "image": path_to_url(barcode12_path)},
    }

    doc.close()
    return parsed_data


# =====================================================
# TEXT PARSER
# =====================================================


def _parse_text_to_json(text: str):
    # Same as before - unchanged
    def search(pattern, default=""):
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else default

    clarity_char = search(r"Clarity\s+Characteristics\s*[.:\s]*([A-Za-z\s,]+?)(?=\n|$)")
    report_date = search(r"(\w+\s+\d{1,2},\s+\d{4})")
    report_number = search(r"GIA\s+Report\s+Number\s*[.:\s]*(\d{7,})")
    shape = search(
        r"Shape\s+and\s+Cutting\s+Style\s*[.:\s]*([A-Za-z\s]+?)(?=\n|$)"
    ) or search(r"([A-Za-z\s]+?Brilliant)")
    measurements = search(r"Measurements\s*[.:\s]*([\d\.\s\-]+x\s*[\d\.\s]+mm)")
    carat_weight = search(r"Carat\s+Weight\s*[.:\s]*([\d\.]+\s*carat)")
    color_grade = search(r"Color\s+Grade\s*[.:\s]*([A-Z])")
    clarity_grade = search(
        r"Clarity\s+Grade\s*[.:\s]*"
        r"(Flawless|Internally\s+Flawless|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3)"
    )
    cut_grade = search(r"Cut\s+Grade\s*[.:\s]*(Excellent|Very Good|Good|Fair|Poor)")
    polish = search(r"Polish\s*[.:\s]*([A-Za-z\s]+?)(?=\n|$)")
    symmetry = search(r"Symmetry\s*[.:\s]*([A-Za-z\s]+?)(?=\n|$)")
    fluorescence = search(r"Fluorescence\s*[.:\s]*([A-Za-z\s]+?)(?=\n|$)")

    return {
        "ReportNumber": report_number,
        "ReportDate": report_date,
        "GIANATURALDIAMONDGRADINGREPORT": {
            "GIAReportNumber": report_number,
            "ShapeandCuttingStyle": shape,
            "Measurements": measurements,
        },
        "GRADINGRESULTS": {
            "CaratWeight": carat_weight,
            "ColorGrade": color_grade,
            "ClarityGrade": clarity_grade,
            "CutGrade": cut_grade,
        },
        "ADDITIONALGRADINGINFORMATION": {
            "Polish": polish,
            "Symmetry": symmetry,
            "Fluorescence": fluorescence,
            "ClarityCharacteristics": clarity_char,
        },
        "Images": {},
    }


# =====================================================
# PROPORTIONS IMAGE
# =====================================================
def _extract_diamond_image_advanced(doc, save_folder):
    save_path = os.path.join(save_folder, "proportions.png")

    for page in doc:
        boxes = page.search_for("PROPORTIONS")
        if not boxes:
            continue

        rect = boxes[0]
        crop = fitz.Rect(rect.x0 - 8, rect.y1 + 2, rect.x0 + 108, rect.y1 + 80)
        pix = page.get_pixmap(clip=crop, dpi=300)
        pix.save(save_path)
        remove_white_background_fast(save_path)
        return save_path

    return ""


# =====================================================
# QR CODE
# =====================================================
def _create_and_save_qr_code(report_number, folder):
    url = f"https://www.gia.edu/report-check?reportno={report_number}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )

    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    arr = np.array(img)

    mask = (arr[..., 0] > 240) & (arr[..., 1] > 240) & (arr[..., 2] > 240)
    arr[..., 3] = np.where(mask, 0, 255)

    img = Image.fromarray(arr, "RGBA")
    path = os.path.join(folder, "qrcode.png")
    img.save(path)

    return path


# =====================================================
# BARCODE (🔥 ALWAYS STARTS WITH 1)
# =====================================================
def _generate_unique_barcode(digits: int, save_path_no_ext: str):
    barcode_number = "1" + "".join(str(random.randint(0, 9)) for _ in range(digits - 1))
    padded = f"    {barcode_number}    "

    code = barcode.get("code128", padded, writer=ImageWriter())

    options = {
        "write_text": False,
        "module_width": 3.0 if digits == 10 else 3.8,
        "module_height": 50.0 if digits == 10 else 75.0,
        "quiet_zone": 15.0,
        "font_size": 0,
    }

    filename = code.save(save_path_no_ext, options=options)
    remove_white_background_fast(filename)

    return barcode_number, filename


# =====================================================
# REMOVE WHITE BACKGROUND
# =====================================================
def remove_white_background_fast(image_path):
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)

    # Split channels correctly (H, W)
    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]

    # Detect near-white pixels
    white_mask = (r > 245) & (g > 245) & (b > 245)

    # Make only those pixels transparent
    data[white_mask, 3] = 0

    img = Image.fromarray(data, "RGBA")
    img.save(image_path)


def _extract_qr_from_pdf(doc, save_folder):
    for page in doc:
        images = page.get_images(full=True)
        for img in images:
            xref = img[0]
            base = doc.extract_image(xref)
            image_bytes = base["image"]

            img_pil = Image.open(io.BytesIO(image_bytes))
            w, h = img_pil.size

            # QR codes are usually square + medium size
            if abs(w - h) < 10 and w >= 150:
                path = os.path.join(save_folder, "qrcode.png")
                img_pil.convert("RGB").save(path, "PNG", quality=95)
                return path
    return ""
