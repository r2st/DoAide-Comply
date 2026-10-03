from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(120), default="")
    plan: Mapped[str] = mapped_column(String(20), default="free")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    businesses: Mapped[list["Business"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Business(Base):
    __tablename__ = "businesses"
    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    business_type: Mapped[str] = mapped_column(String(30))
    state: Mapped[str] = mapped_column(String(60))
    has_gst: Mapped[bool] = mapped_column(Boolean, default=True)
    has_employees: Mapped[bool] = mapped_column(Boolean, default=True)
    has_tds: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    owner: Mapped[User] = relationship(back_populates="businesses")
    members: Mapped[list["TeamMember"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    tasks: Mapped[list["TaskState"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    reminders: Mapped[list["Reminder"]] = relationship(back_populates="business", cascade="all, delete-orphan")


class TeamMember(Base):
    """Team members and invited CAs; role is 'member' or 'ca'."""
    __tablename__ = "team_members"
    __table_args__ = (UniqueConstraint("business_id", "email"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), index=True)
    email: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(120), default="")
    role: Mapped[str] = mapped_column(String(20), default="member")
    business: Mapped[Business] = relationship(back_populates="members")


class TaskState(Base):
    """Per-obligation status and assignment for a business."""
    __tablename__ = "task_states"
    __table_args__ = (UniqueConstraint("business_id", "obligation_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), index=True)
    obligation_id: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("team_members.id"), nullable=True)
    note: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    business: Mapped[Business] = relationship(back_populates="tasks")


class Reminder(Base):
    __tablename__ = "reminders"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), index=True)
    channel: Mapped[str] = mapped_column(String(20))  # email | whatsapp
    destination: Mapped[str] = mapped_column(String(255))
    days_before: Mapped[int] = mapped_column(Integer, default=3)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    business: Mapped[Business] = relationship(back_populates="reminders")


class Lead(Base):
    """Captured from the free tool (optional email to receive the calendar)."""
    __tablename__ = "leads"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    business_type: Mapped[str] = mapped_column(String(30))
    state: Mapped[str] = mapped_column(String(60))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
