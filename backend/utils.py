import hashlib
import jwt
from datetime import datetime, timedelta
import uuid
from passlib.context import CryptContext
import os
import qrcode
from PIL import Image, ImageDraw, ImageFont
import io
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    password = password[:72]  # bcrypt limit
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def gen_report_no():
    prefix = f"{str(uuid.uuid4().int)[:2]}"
    middle = "J"
    rest = f"{str(uuid.uuid4().int)[:9]}"[:9]
    return (prefix + middle + rest)[:12]

def create_qr(url: str) -> Image.Image:
    qr = qrcode.QRCode(box_size=4, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGBA")

@lru_cache(maxsize=1)
def _fonts():
    try:
        font_bold = ImageFont.truetype("arialbd.ttf", 24)
        font_regular = ImageFont.truetype("arial.ttf", 18)
    except:
        font_bold = ImageFont.load_default()
        font_regular = ImageFont.load_default()
    return font_bold, font_regular

def compose_card_image(report, thumbnail_path: str = None) -> bytes:
    import os
    W, H = 1000, 600
    img = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    font_bold, font_regular = _fonts()

    draw.text((30, 20), "INTERNATIONAL GEMOLOGICAL INSTITUTE", font=font_bold, fill=(0,0,0))
    draw.text((30, 58), "JEWELRY REPORT", font=font_bold, fill=(0,0,0))
    cur_y = 120

    def draw_field(label, value):
        nonlocal cur_y
        draw.text((30, cur_y), f"{label} :", font=font_bold, fill=(0,0,0))
        draw.text((250, cur_y), str(value or ""), font=font_regular, fill=(0,0,0))
        cur_y += 30

    draw_field("Report No", report.report_no)
    draw_field("Description", report.description)
    draw_field("Shape and Cut", report.shape_and_cut)
    draw_field("Tot. Est. Weight", report.tot_est_weight)
    draw_field("Color", report.color)
    draw_field("Clarity", report.clarity)
    draw_field("Style Number", report.style_number)

    if thumbnail_path and os.path.exists(thumbnail_path):
        try:
            thumb = Image.open(thumbnail_path).convert("RGBA")
            thumb.thumbnail((240, 240))
            img.paste(thumb, (700, 120), thumb)
        except Exception:
            pass

    qr = create_qr(report.qr_url or f"https://igi.org.pe/?r={report.report_no}")
    qr = qr.resize((160, 160))
    img.paste(qr, (700, 380), qr)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf.read()
