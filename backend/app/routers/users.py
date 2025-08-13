from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db
from app.models import User, GroupMember
from app.schemas import UserCreate, UserResponse, UserLogin
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

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
    return current_user

@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.from_orm(user) for user in users]

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
