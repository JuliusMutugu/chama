from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.database import get_db
from app.models import User, GroupMember, UserRole, UserStatus, AuditLog
from app.schemas import UserCreate, UserResponse, UserLogin, UserUpdate, UserRoleUpdate
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.permissions import require_admin, require_roles, get_user_dashboard_config
import json
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Handle wallet address
    wallet_address = user.wallet_address if user.wallet_address and user.wallet_address.strip() else None
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        wallet_address=wallet_address,
        hashed_password=hashed_password
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while registering the user"
        )

@router.post("/login")
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    # Update last login
    current_user.last_login = datetime.utcnow()
    return current_user

@router.get("/me/dashboard")
async def get_user_dashboard(current_user: User = Depends(get_current_user)):
    """Get user dashboard configuration based on role"""
    return get_user_dashboard_config(current_user)

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user

# Admin-only endpoints
@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get list of users (Admin only)"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
        
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/stats")
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get user statistics (Admin only)"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    pending_verification = db.query(User).filter(User.status == UserStatus.PENDING_VERIFICATION).count()
    kyc_verified = db.query(User).filter(User.kyc_verified == True).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "pending_verification": pending_verification,
        "kyc_verified": kyc_verified,
        "role_distribution": {
            "admin": db.query(User).filter(User.role == UserRole.ADMIN).count(),
            "group_manager": db.query(User).filter(User.role == UserRole.GROUP_MANAGER).count(),
            "treasurer": db.query(User).filter(User.role == UserRole.TREASURER).count(),
            "auditor": db.query(User).filter(User.role == UserRole.AUDITOR).count(),
            "member": db.query(User).filter(User.role == UserRole.MEMBER).count(),
        }
    }

@router.put("/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update user role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log the change
    audit_log = AuditLog(
        user_id=current_user.id,
        action="update_user_role",
        entity_type="user",
        entity_id=user_id,
        old_values=json.dumps({"role": user.role.value}),
        new_values=json.dumps({"role": role_update.role.value})
    )
    
    user.role = role_update.role
    user.updated_at = datetime.utcnow()
    
    db.add(audit_log)
    db.commit()
    db.refresh(user)
    
    return {"message": "User role updated successfully", "user": user}

@router.put("/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update user status (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    new_status = UserStatus(status_update["status"])
    
    # Log the change
    audit_log = AuditLog(
        user_id=current_user.id,
        action="update_user_status",
        entity_type="user",
        entity_id=user_id,
        old_values=json.dumps({"status": user.status.value}),
        new_values=json.dumps({"status": new_status.value})
    )
    
    user.status = new_status
    user.updated_at = datetime.utcnow()
    
    db.add(audit_log)
    db.commit()
    db.refresh(user)
    
    return {"message": "User status updated successfully", "user": user}

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.from_orm(user)

@router.put("/{user_id}/wallet")
async def update_wallet_address(
    user_id: int, 
    wallet_address: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's wallet address"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own wallet address"
        )
    
    current_user.wallet_address = wallet_address
    db.commit()
    
    return {"message": "Wallet address updated successfully"}
