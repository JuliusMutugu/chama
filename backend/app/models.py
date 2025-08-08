from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"  # System administrator
    GROUP_MANAGER = "group_manager"  # Can create and manage groups
    TREASURER = "treasurer"  # Financial management and reporting
    MEMBER = "member"  # Regular group member
    AUDITOR = "auditor"  # Read-only access for auditing

class UserStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

class GroupRole(enum.Enum):
    ADMIN = "admin"  # Group admin (creator by default)
    TREASURER = "treasurer"  # Manages finances
    SECRETARY = "secretary"  # Manages communications
    MEMBER = "member"  # Regular member

class GroupStatus(enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    wallet_address = Column(String, unique=True, nullable=True, default=None)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone_number = Column(String)
    role = Column(Enum(UserRole), default=UserRole.MEMBER)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION)
    is_active = Column(Boolean, default=True)
    profile_image = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    kyc_verified = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    group_memberships = relationship("GroupMember", back_populates="user")
    created_groups = relationship("Group", back_populates="creator")
    notifications = relationship("Notification", back_populates="user")

class Group(Base):
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    contribution_amount = Column(Float, nullable=False)
    contribution_frequency = Column(String, nullable=False)  # weekly, monthly
    max_members = Column(Integer, nullable=False)
    contract_address = Column(String, unique=True)
    status = Column(Enum(GroupStatus), default=GroupStatus.DRAFT)
    is_active = Column(Boolean, default=True)
    rules = Column(Text, nullable=True)  # Group rules and regulations
    late_fee_percentage = Column(Float, default=5.0)  # Late payment fee
    grace_period_days = Column(Integer, default=3)  # Grace period for payments
    minimum_credit_score = Column(Integer, default=0)  # Minimum credit score to join
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    creator_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    creator = relationship("User", back_populates="created_groups")
    members = relationship("GroupMember", back_populates="group")
    cycles = relationship("Cycle", back_populates="group")
    settings = relationship("GroupSettings", back_populates="group", uselist=False)

class GroupMember(Base):
    __tablename__ = "group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    role = Column(Enum(GroupRole), default=GroupRole.MEMBER)
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    rotation_order = Column(Integer)
    performance_score = Column(Float, default=100.0)  # Performance tracking
    
    # Relationships
    user = relationship("User", back_populates="group_memberships")
    group = relationship("Group", back_populates="members")

class GroupSettings(Base):
    __tablename__ = "group_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), unique=True)
    auto_rotate = Column(Boolean, default=True)
    send_reminders = Column(Boolean, default=True)
    reminder_days_before = Column(Integer, default=3)
    allow_early_contributions = Column(Boolean, default=True)
    require_kyc = Column(Boolean, default=False)
    max_missed_payments = Column(Integer, default=2)
    
    # Relationships
    group = relationship("Group", back_populates="settings")

class Cycle(Base):
    __tablename__ = "cycles"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    cycle_number = Column(Integer, nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    total_amount = Column(Float)
    payout_amount = Column(Float)  # 90% of total
    platform_fee = Column(Float)  # 10% platform fee
    status = Column(String, default="active")  # active, completed, cancelled
    transaction_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    group = relationship("Group", back_populates="cycles")
    recipient = relationship("User")
    contributions = relationship("Contribution", back_populates="cycle")

class Contribution(Base):
    __tablename__ = "contributions"
    
    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("cycles.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    late_fee = Column(Float, default=0.0)
    transaction_hash = Column(String)
    contribution_date = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, failed, late
    
    # Relationships
    cycle = relationship("Cycle", back_populates="contributions")
    user = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # payment_reminder, group_update, system_alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)  # user, group, contribution
    entity_id = Column(Integer, nullable=False)
    old_values = Column(Text, nullable=True)  # JSON string
    new_values = Column(Text, nullable=True)  # JSON string
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)  # Whether setting is visible to non-admins
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
