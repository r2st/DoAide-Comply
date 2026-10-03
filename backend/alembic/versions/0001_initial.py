"""initial schema

Revision ID: 0001
Revises:
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("name", sa.String(120), nullable=False, server_default=""),
        sa.Column("plan", sa.String(20), nullable=False, server_default="free"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "businesses",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("owner_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("business_type", sa.String(30), nullable=False),
        sa.Column("state", sa.String(60), nullable=False),
        sa.Column("has_gst", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("has_employees", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("has_tds", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_businesses_owner_id", "businesses", ["owner_id"])
    op.create_table(
        "team_members",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("business_id", sa.Integer, sa.ForeignKey("businesses.id"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("name", sa.String(120), nullable=False, server_default=""),
        sa.Column("role", sa.String(20), nullable=False, server_default="member"),
        sa.UniqueConstraint("business_id", "email"),
    )
    op.create_index("ix_team_members_business_id", "team_members", ["business_id"])
    op.create_table(
        "task_states",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("business_id", sa.Integer, sa.ForeignKey("businesses.id"), nullable=False),
        sa.Column("obligation_id", sa.String(200), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("assignee_id", sa.Integer, sa.ForeignKey("team_members.id"), nullable=True),
        sa.Column("note", sa.Text, nullable=False, server_default=""),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("business_id", "obligation_id"),
    )
    op.create_index("ix_task_states_business_id", "task_states", ["business_id"])
    op.create_table(
        "reminders",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("business_id", sa.Integer, sa.ForeignKey("businesses.id"), nullable=False),
        sa.Column("channel", sa.String(20), nullable=False),
        sa.Column("destination", sa.String(255), nullable=False),
        sa.Column("days_before", sa.Integer, nullable=False, server_default="3"),
        sa.Column("active", sa.Boolean, nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_reminders_business_id", "reminders", ["business_id"])
    op.create_table(
        "leads",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("business_type", sa.String(30), nullable=False),
        sa.Column("state", sa.String(60), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_leads_email", "leads", ["email"])


def downgrade():
    for t in ("leads", "reminders", "task_states", "team_members", "businesses", "users"):
        op.drop_table(t)
