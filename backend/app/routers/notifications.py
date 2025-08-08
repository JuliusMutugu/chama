from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, Notification
from app.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user notifications"""
    
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
    total = query.count()
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {
        "notifications": [
            {
                "id": notif.id,
                "title": notif.title,
                "message": notif.message,
                "type": notif.type,
                "is_read": notif.is_read,
                "created_at": notif.created_at.isoformat()
            }
            for notif in notifications
        ],
        "total": total,
        "unread_count": unread_count,
        "skip": skip,
        "limit": limit
    }

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark notification as read"""
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.put("/mark-all-read")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete notification"""
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted"}

@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}

# Helper function to create notifications
async def create_notification(
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    db: Session
):
    """Helper function to create notifications"""
    
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type
    )
    
    db.add(notification)
    db.commit()
    
    return notification

# Notification templates
NOTIFICATION_TEMPLATES = {
    "payment_reminder": {
        "title": "Payment Reminder",
        "message": "Your contribution for {group_name} is due on {due_date}. Amount: ${amount}"
    },
    "payment_received": {
        "title": "Payment Received",
        "message": "Your contribution of ${amount} for {group_name} has been received."
    },
    "payout_ready": {
        "title": "Payout Ready",
        "message": "Your payout of ${amount} from {group_name} is ready for collection."
    },
    "group_invitation": {
        "title": "Group Invitation",
        "message": "You've been invited to join {group_name}. Click to accept or decline."
    },
    "cycle_completed": {
        "title": "Cycle Completed",
        "message": "Cycle {cycle_number} for {group_name} has been completed successfully."
    },
    "new_member_joined": {
        "title": "New Member Joined",
        "message": "{member_name} has joined {group_name}."
    },
    "late_payment_warning": {
        "title": "Late Payment Warning",
        "message": "Your payment for {group_name} is overdue. Late fees may apply."
    }
}
