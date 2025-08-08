from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Group, GroupMember, User
from app.schemas import GroupCreate, GroupResponse, GroupMemberResponse
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=GroupResponse)
async def create_group(
    group: GroupCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new chama group"""
    db_group = Group(
        name=group.name,
        description=group.description,
        contribution_amount=group.contribution_amount,
        contribution_frequency=group.contribution_frequency,
        max_members=group.max_members,
        creator_id=current_user.id
    )
    
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Add creator as first member
    db_member = GroupMember(
        user_id=current_user.id,
        group_id=db_group.id,
        rotation_order=1
    )
    db.add(db_member)
    db.commit()
    
    return GroupResponse.from_orm(db_group)

@router.get("/", response_model=List[GroupResponse])
async def get_groups(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get list of all groups"""
    groups = db.query(Group).filter(Group.is_active == True).offset(skip).limit(limit).all()
    
    # Add member count to each group
    result = []
    for group in groups:
        group_dict = GroupResponse.from_orm(group).dict()
        member_count = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.is_active == True
        ).count()
        group_dict["member_count"] = member_count
        result.append(GroupResponse(**group_dict))
    
    return result

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: int, db: Session = Depends(get_db)):
    """Get group by ID"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Add member count
    group_dict = GroupResponse.from_orm(group).dict()
    member_count = db.query(GroupMember).filter(
        GroupMember.group_id == group.id,
        GroupMember.is_active == True
    ).count()
    group_dict["member_count"] = member_count
    
    return GroupResponse(**group_dict)

@router.post("/{group_id}/join")
async def join_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a group"""
    # Check if group exists
    group = db.query(Group).filter(Group.id == group_id, Group.is_active == True).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if user is already a member
    existing_member = db.query(GroupMember).filter(
        GroupMember.user_id == current_user.id,
        GroupMember.group_id == group_id,
        GroupMember.is_active == True
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this group"
        )
    
    # Check if group is full
    current_members = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.is_active == True
    ).count()
    
    if current_members >= group.max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is full"
        )
    
    # Add user to group
    db_member = GroupMember(
        user_id=current_user.id,
        group_id=group_id,
        rotation_order=current_members + 1
    )
    
    db.add(db_member)
    db.commit()
    
    return {"message": "Successfully joined the group"}

@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
async def get_group_members(group_id: int, db: Session = Depends(get_db)):
    """Get all members of a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    members = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.is_active == True
    ).order_by(GroupMember.rotation_order).all()
    
    return [GroupMemberResponse.from_orm(member) for member in members]

@router.delete("/{group_id}/leave")
async def leave_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Leave a group"""
    member = db.query(GroupMember).filter(
        GroupMember.user_id == current_user.id,
        GroupMember.group_id == group_id,
        GroupMember.is_active == True
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this group"
        )
    
    # Check if user is the creator and there are other members
    group = db.query(Group).filter(Group.id == group_id).first()
    if group.creator_id == current_user.id:
        other_members = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id != current_user.id,
            GroupMember.is_active == True
        ).count()
        
        if other_members > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group creator cannot leave while other members exist"
            )
    
    # Remove user from group
    member.is_active = False
    db.commit()
    
    return {"message": "Successfully left the group"}
