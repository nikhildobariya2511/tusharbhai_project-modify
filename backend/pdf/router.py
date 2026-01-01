from fastapi import APIRouter, File, Depends, UploadFile
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
import re
import json
import os
import shutil
import qrcode
import barcode
from barcode.writer import ImageWriter
import random
from PIL import Image
import numpy as np
from auth.dependencies import get_current_user
from typing import Optional, List, Tuple

router = APIRouter(prefix="/pdf", tags=["PDF Processing"], dependencies=[Depends(get_current_user)])

BASE_OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")
os.makedirs(BASE_OUTPUT_DIR, exist_ok=True)

RE_DATE = re.compile(r"\b([A-Z][a-z]+ \d{2}, \d{4})\b")
RE_FIND = {
    "report_no": re.compile(r"GIA Report Number[\s\.]*([0-9 ]+)"),
    "shape": re.compile(r"Shape and Cutting Style[\s\.]*([^\n]+)"),
    "measurements": re.compile(r"Measurements[\s\.]*([^\n]+)"),
    "carat": re.compile(r"Carat Weight[\s\.]*([^\n]+)"),
    "color": re.compile(r"Color Grade[\s\.]*([A-Za-z0-9 \+-/]+)"),
    "polish": re.compile(r"Polish[\s\.]*([^\n]+)"),
    "symmetry": re.compile(r"Symmetry[\s\.]*([^\n]+)"),
    "fluor": re.compile(r"Fluorescence[\s\.]*([^\n]+)"),
    "inscr": re.compile(r"Inscription\(s\)[\s\.]*([^\n]+)"),
}

def job_dir(report_no: str) -> str:
    if os.path.exists(BASE_OUTPUT_DIR):
        shutil.rmtree(BASE_OUTPUT_DIR)
    os.makedirs(BASE_OUTPUT_DIR, exist_ok=True)
    return BASE_OUTPUT_DIR

def remove_white_background_fast(image_path: str):
    im = Image.open(image_path).convert("RGBA")
    arr = np.array(im)
    rgb = arr[..., :3]
    alpha = arr[..., 3]
    mask = (rgb[..., 0] > 240) & (rgb[..., 1] > 240) & (rgb[..., 2] > 240)
    arr[..., 3] = np.where(mask, 0, alpha)
    Image.fromarray(arr, mode="RGBA").save(image_path)

def create_and_save_qr_code(report_number: str, folder_path: str) -> str:
    url = f"https://www.gia.edu/report-check?reportno={report_number.strip().replace(' ', '')}"
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    arr = np.array(qr_img)
    rgb = arr[..., :3]
    alpha = arr[..., 3]
    mask = (rgb[..., 0] > 240) & (rgb[..., 1] > 240) & (rgb[..., 2] > 240)
    arr[..., 3] = np.where(mask, 0, alpha)
    qr_img = Image.fromarray(arr, mode="RGBA")
    qr_path = os.path.join(folder_path, 'qrcode.png')
    qr_img.save(qr_path, format="PNG")
    return qr_path

def generate_unique_barcode(number_of_digits: int, start_digit: int, save_path_no_ext: str):
    number = str(start_digit) + ''.join(str(random.randint(0, 9)) for _ in range(number_of_digits - 1))
    number_with_spaces = f"{' ' * 4}{number}{' ' * 4}"
    code = barcode.get('code128', number_with_spaces, writer=ImageWriter())
    module_width = 3.0 if number_of_digits == 10 else 3.8
    module_height = 50.0 if number_of_digits == 10 else 75.0
    writer_options = {
        'write_text': False,
        'module_width': module_width,
        'module_height': module_height,
        'quiet_zone': 15.0,
        'font_size': 0,
    }
    filename = code.save(save_path_no_ext, options=writer_options)
    remove_white_background_fast(filename)
    return number_with_spaces, filename

def extract_report_date(text: str) -> Optional[str]:
    m = RE_DATE.search(text)
    return m.group(1) if m else None

def darken_reds_and_greens(image_path, sat_boost=2.0, val_mul=0.5,
                           red_center=0.0, green_center=120.0, hue_tol=20):
    im = Image.open(image_path).convert("RGBA")
    arr = np.array(im)

    r, g, b, a = arr[..., 0].astype(np.float32), arr[..., 1].astype(np.float32), arr[..., 2].astype(np.float32), arr[..., 3]
    r1, g1, b1 = r/255.0, g/255.0, b/255.0
    maxc = np.maximum(np.maximum(r1, g1), b1)
    minc = np.minimum(np.minimum(r1, g1), b1)
    v = maxc
    c = maxc - minc
    s = np.where(maxc == 0, 0, c / np.where(maxc == 0, 1, maxc))
    h = np.zeros_like(v)
    mask_r = (maxc == r1) & (c != 0)
    mask_g = (maxc == g1) & (c != 0)
    mask_b = (maxc == b1) & (c != 0)
    h[mask_r] = (60 * ((g1 - b1) / c) % 360)[mask_r]
    h[mask_g] = (60 * ((b1 - r1) / c) + 120)[mask_g]
    h[mask_b] = (60 * ((r1 - g1) / c) + 240)[mask_b]

    def hue_close(hue_center):
        d1 = np.abs(h - hue_center)
        d2 = np.abs(h - (hue_center + 360))
        return np.minimum(d1, d2) <= hue_tol

    mask_red = hue_close(red_center)
    mask_green = hue_close(green_center)
    mask = (mask_red | mask_green) & (s > 0.35) & (v > 0.35)
    s = np.where(mask, np.clip(s * sat_boost, 0, 1), s)
    v = np.where(mask, np.clip(v * val_mul, 0, 1), v)

    h6 = h / 60.0
    i = np.floor(h6).astype(int) % 6
    f = h6 - np.floor(h6)
    p = v * (1 - s)
    q = v * (1 - s * f)
    t = v * (1 - s * (1 - f))
    r2 = np.choose(i, [v, q, p, p, t, v])
    g2 = np.choose(i, [t, v, v, q, p, p])
    b2 = np.choose(i, [p, p, t, v, v, q])

    gray = (s == 0)
    r2 = np.where(gray, v, r2)
    g2 = np.where(gray, v, g2)
    b2 = np.where(gray, v, b2)

    out = np.stack([
        np.clip(r2*255, 0, 255).astype(np.uint8),
        np.clip(g2*255, 0, 255).astype(np.uint8),
        np.clip(b2*255, 0, 255).astype(np.uint8),
        a.astype(np.uint8)
    ], axis=-1)
    Image.fromarray(out, mode="RGBA").save(image_path)

def find_value(pattern_key: str, text_block: str):
    m = RE_FIND[pattern_key].search(text_block)
    return m.group(1).strip() if m else None

def _save_pix_as_jpg(pix: fitz.Pixmap, out_jpg_path: str):
    if pix.n in (4, 5):
        pil = Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)
        bg = Image.new("RGB", pil.size, (255, 255, 255))
        bg.paste(pil, mask=pil.split()[-1])
        bg.save(out_jpg_path, format="JPEG", quality=95)
    else:
        pil = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        pil.save(out_jpg_path, format="JPEG", quality=95)

# ---- helper to be version-agnostic across PyMuPDF Rect APIs ----
def rect_area(r: fitz.Rect) -> float:
    # Prefer width/height to avoid AttributeError; abs(r) is also supported by Rect
    try:
        return r.width * r.height
    except Exception:
        try:
            return abs(r)  # falls back to built-in area for Rect
        except Exception:
            return (r.x1 - r.x0) * (r.y1 - r.y0)

def extract_diagram_image_by_heading(page, doc, heading_text, save_path, fallback_size=(400, 400)):
    heading_boxes = page.search_for(heading_text)
    if not heading_boxes:
        return None

    heading_rect = heading_boxes[0]
    # Special handling for PROPORTIONS region crop
    if heading_text.upper().startswith("PROPORTIONS"):
        x0 = heading_rect.x0
        y0 = heading_rect.y1 + 20
        x1 = heading_rect.x0 + 250
        y1 = heading_rect.y1 + 150
        crop_rect = fitz.Rect(x0, y0, x1, y1)
        pix = page.get_pixmap(clip=crop_rect, dpi=300)
        pix.save(save_path)
        remove_white_background_fast(save_path)
        return save_path

    # Find images with sufficiently large area near the heading
    images = page.get_images(full=True)
    candidate_imgs = []
    for img in images:
        try:
            bbox = page.get_image_bbox(img)
            if rect_area(bbox) > 10000:  # replaced .get_area() with width*height/abs(rect)
                candidate_imgs.append((img, bbox))
        except Exception:
            continue

    # Choose the image whose top is closest to the heading's top
    min_dist, chosen_img = float('inf'), None
    for img, bbox in candidate_imgs:
        dist = abs(bbox.y0 - heading_rect.y0)
        if dist < min_dist:
            min_dist, chosen_img = dist, img

    if chosen_img:
        xref = chosen_img[0]
        try:
            extracted = doc.extract_image(xref)
            ext = extracted.get("ext", "png")
            out_path = os.path.splitext(save_path)[0] + f".{ext}"
            with open(out_path, "wb") as f:
                f.write(extracted["image"])
            if ext.lower() == "png":
                remove_white_background_fast(out_path)
            return out_path
        except Exception:
            pass

        pix = fitz.Pixmap(doc, xref)
        if heading_text.upper().startswith("CLARITY CHARACTERISTICS"):
            jpg_path = os.path.splitext(save_path)[0] + ".jpg"
            _save_pix_as_jpg(pix, jpg_path)
            return jpg_path
        else:
            pix.save(save_path)
            remove_white_background_fast(save_path)
            return save_path

    # Fallback crop under the heading if no image candidate
    crop_rect = fitz.Rect(
        heading_rect.x0,
        heading_rect.y1 + 5,
        heading_rect.x0 + fallback_size[0],
        heading_rect.y1 + fallback_size[1]
    )
    pix = page.get_pixmap(clip=crop_rect, dpi=300)
    if heading_text.upper().startswith("CLARITY CHARACTERISTICS"):
        jpg_path = os.path.splitext(save_path)[0] + ".jpg"
        _save_pix_as_jpg(pix, jpg_path)
        return jpg_path
    else:
        pix.save(save_path)
        remove_white_background_fast(save_path)
        return save_path

def get_shape_and_style(text_block: str) -> Optional[str]:
    
    label = r"Shape and Cutting Style[ .]*"
    
    # Find the label first
    m = re.search(label + r"([^\n]*)", text_block)
    if not m:
        return None

    first_line_value = m.group(1).strip().rstrip(".")
    # Remove dotted leaders
    first_line_value = re.sub(r"\.+$", "", first_line_value).strip()

    # Start scanning next lines
    idx = m.end()
    lines_after = text_block[idx:].split("\n")

    collected = [first_line_value] if first_line_value else []

    # Field labels to stop on
    stop_labels = re.compile(
        r"^(Measurements|Carat Weight|Color Grade|Clarity Grade|Cut Grade|Polish|Symmetry|Fluorescence|Inscription|Comments?)\b",
        re.I
    )

    # Collect continuation lines until another label appears
    for line in lines_after:
        clean = line.strip()
        if not clean:
            continue
        if stop_labels.match(clean):
            break
        # Remove dot leaders
        clean = re.sub(r"\.+$", "", clean).strip()
        collected.append(clean)

        # Usually only 1 continuation line exists, break if next is blank
        # but keep flexible for rare 3-line styles
        if len(collected) > 3:
            break

    # Join and clean spacing
    result = " ".join(collected).strip()
    result = re.sub(r"\s{2,}", " ", result)

    return result or None


def extract_key_to_symbols_image(doc, page_index, save_path):
    page = doc[page_index]
    text_instances = page.search_for("KEY TO SYMBOLS*")
    if not text_instances:
        return None
    rect = text_instances[0]
    rect.y1 += 60
    rect.x0 -= 10
    rect.x1 += 90
    pix = page.get_pixmap(clip=rect, dpi=300)
    pix.save(save_path)
    remove_white_background_fast(save_path)
    darken_reds_and_greens(save_path, sat_boost=2.5, val_mul=0.5)
    return save_path

def extract_notes_image(doc, page_index, save_path):
    page = doc[page_index]
    text_instances = page.search_for("* Red symbols denote internal characteristics (inclusions). Green or black symbols denote external characteristics")
    if not text_instances:
        return None
    rect = text_instances[0]
    rect.y1 += 25
    rect.x0 -= 5
    rect.x1 += 5
    pix = page.get_pixmap(clip=rect, dpi=300)
    pix.save(save_path)
    remove_white_background_fast(save_path)
    return save_path

def extract_comments(text: str):
    lines = text.splitlines()
    comments_lines = []
    capture = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("Comments:") or stripped.startswith("Comment:"):
            after_colon = stripped.split(":", 1)[1].strip()
            if after_colon:
                comments_lines.append(after_colon)
            capture = True
            continue
        if capture:
            if re.fullmatch(r"\d{6,}", stripped):
                break
            if "KEY TO SYMBOLS" in stripped.upper():
                break
            if stripped.isupper() and len(stripped) > 3:
                break
            if stripped == "":
                break
            comments_lines.append(stripped)
    return " ".join(comments_lines).strip() if comments_lines else None

def process_gia_pdf(pdf_bytes: bytes):
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        return {"error": f"Error opening PDF: {e}"}

    page = doc[0]
    text = page.get_text("text")

    def get_clarity_grade(text_block):
        pattern = re.compile(r"Clarity Grade\s*[:\.]*\s*([A-Za-z0-9 \+-/]+)")
        match = pattern.search(text_block)
        if match:
            return match.group(1).strip()
        for line in text_block.split('\n'):
            if "Clarity Grade" in line:
                found = re.split(r"Clarity Grade[\s\.\:]*", line, maxsplit=1)
                if len(found) > 1 and found[1].strip():
                    val = re.sub(r'[^A-Za-z0-9 \+-/]', '', found[1].strip())
                    if val:
                        return val
        return None

    def get_cut_grade(text_block):
        pattern = re.compile(r"Cut Grade\s*[:\.]*\s*([A-Za-z0-9\+-/ ]+)")
        match = pattern.search(text_block)
        if match:
            return match.group(1).strip()
        for line in text_block.split('\n'):
            if "Cut Grade" in line:
                found = re.split(r"Cut Grade[\s\.\:]*", line, maxsplit=1)
                if len(found) > 1 and found[1].strip():
                    return found[1].strip()
        return None

    gia_report_number = find_value("report_no", text)
    if not gia_report_number:
        doc.close()
        return {"error": "Could not find GIA Report Number in the PDF."}

    out_dir = job_dir(gia_report_number)
    qr_code_path = create_and_save_qr_code(gia_report_number, out_dir)
    barcode12_number, barcode12_path = generate_unique_barcode(12, 1, os.path.join(out_dir, "barcode12"))
    barcode10_number, barcode10_path = generate_unique_barcode(10, 1, os.path.join(out_dir, "barcode10"))

    report_type = "GIANATURALDIAMONDGRADINGREPORT"
    if "DOSSIER" in text.upper():
        report_type = "GIANATURALDIAMONDOSSIER"

    gia_report_data = {
        "GIAReportNumber": gia_report_number,
        "ShapeandCuttingStyle": get_shape_and_style(text) or None,
        "Measurements": find_value("measurements", text) or None,
    }

    grading_results = {
        "CaratWeight": find_value("carat", text) or None,
        "ColorGrade": find_value("color", text) or None,
        "ClarityGrade": get_clarity_grade(text) or None,
        "CutGrade": get_cut_grade(text) or None
    }

    comments_value = extract_comments(text)
    additional_info = {
        "polish": find_value("polish", text) or None,
        "symmetry": find_value("symmetry", text) or None,
        "fluorescence": find_value("fluor", text) or None,
        "inscription": find_value("inscr", text) or None,
        "comments": comments_value if comments_value else None,
    }

    symbols = []
    char_match = re.search(r"Clarity Characteristics\.+ (.+)", text)
    if char_match:
        characteristics = [c.strip() for c in char_match.group(1).split(',')]
        symbols.extend([{"icon": None, "name": char} for char in characteristics])
    elif "KEY TO SYMBOLS" in text:
        # Safe split in case the asterisk is not literal
        parts = re.split(r"KEY TO SYMBOLS\*?", text, maxsplit=1)
        if len(parts) > 1:
            key_to_symbols_text = parts[1]
            block = key_to_symbols_text.split("Red symbols denote")[0]
            characteristics = re.findall(r"\s*([a-zA-Z\s]+)\s*", block)
            symbols.extend([{"icon": None, "name": char.strip()} for char in characteristics if char.strip()])

    proportions_img_path = os.path.join(out_dir, "proportions.png")
    clarity_img_path = os.path.join(out_dir, "clarity_characteristics.jpg")

    proportions_img = extract_diagram_image_by_heading(page, doc, "PROPORTIONS", proportions_img_path)
    clarity_img = extract_diagram_image_by_heading(page, doc, "CLARITY CHARACTERISTICS", clarity_img_path)

    key_to_symbols_img_path = os.path.join(out_dir, "key_to_symbols.png")
    key_to_symbols_img = extract_key_to_symbols_image(doc, 0, key_to_symbols_img_path)

    notes_img_path = os.path.join(out_dir, "notes.png")
    notes_img = extract_notes_image(doc, 0, notes_img_path)

    report_date = extract_report_date(text)

    final_data = {
        "ReportDate": report_date,
        report_type: gia_report_data,
        "GRADINGRESULTS": grading_results,
        "ADDITIONALGRADINGINFORMATION": additional_info,
        "PROPORTIONS": proportions_img.replace("\\", "/") if proportions_img else None,
        "CLARITYCHARACTERISTICS": clarity_img.replace("\\", "/") if clarity_img else None,
        "KEYTOSYMBOLS": key_to_symbols_img.replace("\\", "/") if key_to_symbols_img else None,
        "NOTES": notes_img.replace("\\", "/") if notes_img else None,
        "QRCODE": qr_code_path.replace("\\", "/") if qr_code_path else None,
        "symbols": symbols,
        "BARCODE12": {"number": barcode12_number, "image": barcode12_path.replace("\\", "/")},
        "BARCODE10": {"number": barcode10_number, "image": barcode10_path.replace("\\", "/")}
    }

    json_file_path = os.path.join(out_dir, f"{gia_report_number.strip().replace(' ', '_')}.json")
    with open(json_file_path, 'w') as jf:
        json.dump(final_data, jf, indent=4)
    doc.close()
    return final_data

@router.post("/upload-pdf/")
async def upload_multi_pdf(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        result = process_gia_pdf(pdf_bytes)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
