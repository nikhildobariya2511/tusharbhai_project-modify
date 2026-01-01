from typing import Optional, List, Annotated
from pydantic import BaseModel, ConfigDict, EmailStr, SecretStr, Field, StringConstraints
from datetime import datetime

BaseConfig = ConfigDict(
    from_attributes=True,
    serialize_by_alias=True,
    populate_by_name=True
)

class UserCreate(BaseModel):
    model_config = BaseConfig
    email: EmailStr
    password: SecretStr

class Token(BaseModel):
    model_config = BaseConfig
    access_token: str
    token_type: str

ReportNo = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=32)]
ShortStr = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]
LongStr = Annotated[str, StringConstraints(strip_whitespace=True, max_length=4000)]

class ReportOut(BaseModel):
    report_no: str
    description: Optional[str]
    shape_and_cut: Optional[str]
    tot_est_weight: Optional[str]
    color: Optional[str]
    clarity: Optional[str]
    style_number: Optional[str]
    image_filename: Optional[str]
    comment: Optional[str]
    company_logo: Optional[str] = None
    notice_image: bool = False 
    isecopy: bool = False
    igi_logo: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportListItem(BaseModel):
    report_no: str
    style_number: Optional[str]

    class Config:
        from_attributes = True
