from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, UserStatus, GroupRole, GroupStatus

# Base configuration for ORM models
class ORMModel(BaseModel):
    class Config:
        orm_mode = True

# User Schemas
class UserBase(ORMModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    wallet_address: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.MEMBER

class UserLogin(ORMModel):
    email: EmailStr
    password: str

class UserUpdate(ORMModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class UserRoleUpdate(ORMModel):
    role: UserRole

class UserResponse(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    is_active: bool
    kyc_verified: bool
    two_factor_enabled: bool
    profile_image: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Group Schemas
class GroupBase(ORMModel):
    name: str
    description: Optional[str] = None
    contribution_amount: float
    contribution_frequency: str
    max_members: int
    rules: Optional[str] = None
    late_fee_percentage: Optional[float] = 5.0
    grace_period_days: Optional[int] = 3
    minimum_credit_score: Optional[int] = 0

class GroupCreate(GroupBase):
    pass

class GroupUpdate(ORMModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    late_fee_percentage: Optional[float] = None
    grace_period_days: Optional[int] = None

class GroupResponse(GroupBase):
    id: int
    creator_id: int
    status: GroupStatus
    contract_address: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    member_count: Optional[int] = 0

class GroupMemberResponse(ORMModel):
    id: int
    user_id: int
    group_id: int
    role: GroupRole
    join_date: datetime
    is_active: bool
    rotation_order: Optional[int] = None
    performance_score: float
    user: UserResponse

class GroupSettingsBase(ORMModel):
    auto_rotate: bool = True
    send_reminders: bool = True
    reminder_days_before: int = 3
    allow_early_contributions: bool = True
    require_kyc: bool = False
    max_missed_payments: int = 2

class GroupSettingsResponse(GroupSettingsBase):
    id: int
    group_id: int

# Cycle Schemas
class CycleBase(BaseModel):
    cycle_number: int
    start_date: datetime
    end_date: datetime

class CycleCreate(CycleBase):
    group_id: int
    recipient_id: int

class CycleResponse(CycleBase):
    id: int
    group_id: int
    recipient_id: int
    total_amount: Optional[float] = None
    payout_amount: Optional[float] = None
    status: str
    transaction_hash: Optional[str] = None
    
    class Config:
        orm_mode = True

# Contribution Schemas
class ContributionBase(BaseModel):
    amount: float

class ContributionCreate(ContributionBase):
    cycle_id: int

class ContributionResponse(ContributionBase):
    id: int
    cycle_id: int
    user_id: int
    transaction_hash: Optional[str] = None
    contribution_date: datetime
    status: str
    
    class Config:
        orm_mode = True

# Group Member Schemas
class GroupMemberResponse(BaseModel):
    id: int
    user_id: int
    group_id: int
    join_date: datetime
    is_active: bool
    rotation_order: Optional[int] = None
    user: UserResponse
    
    class Config:
        orm_mode = True

# Blockchain Schemas
class ContractDeployRequest(ORMModel):
    group_id: int

class ContractDeployResponse(ORMModel):
    group_id: int
    contract_address: str
    transaction_hash: str

class TransactionRequest(ORMModel):
    group_id: int
    amount: float
    recipient_address: str

class TransactionResponse(ORMModel):
    transaction_hash: str
    status: str
    amount: float
    sender_address: str
    recipient_address: str
