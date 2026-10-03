from typing import Literal

from pydantic import BaseModel, EmailStr, Field

BusinessType = Literal["pvt_ltd", "llp", "proprietorship"]


class HealthCheckIn(BaseModel):
    business_type: BusinessType
    state: str
    has_gst: bool = True
    has_employees: bool = True
    has_tds: bool = True
    email: EmailStr | None = None


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = ""


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class BusinessIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    business_type: BusinessType
    state: str
    has_gst: bool = True
    has_employees: bool = True
    has_tds: bool = True


class MemberIn(BaseModel):
    email: EmailStr
    name: str = ""
    role: Literal["member", "ca"] = "member"


class TaskUpdate(BaseModel):
    status: Literal["pending", "in_progress", "done"] | None = None
    assignee_id: int | None = None
    note: str | None = None


class ReminderIn(BaseModel):
    channel: Literal["email", "whatsapp"]
    destination: str = Field(min_length=3, max_length=255)
    days_before: int = Field(default=3, ge=0, le=30)


class PlanIn(BaseModel):
    plan: Literal["free", "pro", "enterprise"]


class AskIn(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    form: str | None = None
