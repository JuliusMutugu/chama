from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import (
    User, Group, GroupMember, Contribution, Cycle, 
    AuditLog, Notification, SystemSettings,
    UserRole, UserStatus, GroupStatus
)
from app.permissions import require_admin
from app.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get admin dashboard data"""
    
    # Basic statistics
    total_users = db.query(User).count()
    active_groups = db.query(Group).filter(Group.status == GroupStatus.ACTIVE).count()
    total_contributions = db.query(func.sum(Contribution.amount)).scalar() or 0
    pending_verifications = db.query(User).filter(User.status == UserStatus.PENDING_VERIFICATION).count()
    
    # Monthly growth
    current_month = datetime.now().replace(day=1)
    last_month = (current_month - timedelta(days=1)).replace(day=1)
    
    current_month_users = db.query(User).filter(User.created_at >= current_month).count()
    last_month_users = db.query(User).filter(
        User.created_at >= last_month,
        User.created_at < current_month
    ).count()
    
    user_growth = ((current_month_users - last_month_users) / max(last_month_users, 1)) * 100
    
    # Recent activity
    recent_activity = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(10).all()
    
    return {
        "stats": {
            "total_users": total_users,
            "active_groups": active_groups,
            "total_revenue": total_contributions * 0.1,  # 10% platform fee
            "pending_verifications": pending_verifications,
            "user_growth": round(user_growth, 1)
        },
        "recent_activity": [
            {
                "id": activity.id,
                "action": activity.action,
                "user": activity.user.full_name if activity.user else "System",
                "entity_type": activity.entity_type,
                "created_at": activity.created_at.isoformat()
            }
            for activity in recent_activity
        ]
    }

@router.get("/analytics")
async def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed analytics for admin"""
    
    # User analytics
    user_registration_by_month = db.query(
        func.date_trunc('month', User.created_at).label('month'),
        func.count(User.id).label('count')
    ).group_by(func.date_trunc('month', User.created_at)).all()
    
    # Group analytics
    group_creation_by_month = db.query(
        func.date_trunc('month', Group.created_at).label('month'),
        func.count(Group.id).label('count')
    ).group_by(func.date_trunc('month', Group.created_at)).all()
    
    # Revenue analytics
    revenue_by_month = db.query(
        func.date_trunc('month', Contribution.contribution_date).label('month'),
        func.sum(Contribution.amount * 0.1).label('revenue')  # 10% platform fee
    ).group_by(func.date_trunc('month', Contribution.contribution_date)).all()
    
    return {
        "user_registration_trends": [
            {"month": item.month.strftime('%Y-%m'), "count": item.count}
            for item in user_registration_by_month
        ],
        "group_creation_trends": [
            {"month": item.month.strftime('%Y-%m'), "count": item.count}
            for item in group_creation_by_month
        ],
        "revenue_trends": [
            {"month": item.month.strftime('%Y-%m'), "revenue": float(item.revenue or 0)}
            for item in revenue_by_month
        ]
    }

@router.get("/audit-logs")
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get audit logs with filtering"""
    
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action.contains(action))
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    logs = query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "logs": [
            {
                "id": log.id,
                "user": log.user.full_name if log.user else "System",
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "old_values": log.old_values,
                "new_values": log.new_values,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/system-health")
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get system health metrics"""
    
    # Calculate various health metrics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    total_groups = db.query(Group).count()
    active_groups = db.query(Group).filter(Group.status == GroupStatus.ACTIVE).count()
    
    # Failed transactions (mock data)
    failed_transactions = 0
    
    # Calculate health score
    user_activity_score = (active_users / max(total_users, 1)) * 100
    group_activity_score = (active_groups / max(total_groups, 1)) * 100
    transaction_success_score = 100 - failed_transactions  # Mock calculation
    
    overall_health = (user_activity_score + group_activity_score + transaction_success_score) / 3
    
    return {
        "overall_health": round(overall_health, 1),
        "metrics": {
            "user_activity": round(user_activity_score, 1),
            "group_activity": round(group_activity_score, 1),
            "transaction_success": round(transaction_success_score, 1)
        },
        "services": {
            "api": "operational",
            "database": "operational",
            "blockchain": "operational",
            "notifications": "operational"
        }
    }

@router.get("/settings")
async def get_system_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get system settings"""
    settings = db.query(SystemSettings).all()
    
    return {
        setting.key: {
            "value": setting.value,
            "description": setting.description,
            "is_public": setting.is_public
        }
        for setting in settings
    }

@router.put("/settings/{key}")
async def update_system_setting(
    key: str,
    value: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update system setting"""
    setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
    
    if not setting:
        # Create new setting
        setting = SystemSettings(
            key=key,
            value=value["value"],
            description=value.get("description", ""),
            is_public=value.get("is_public", False)
        )
        db.add(setting)
    else:
        # Update existing setting
        old_value = setting.value
        setting.value = value["value"]
        setting.description = value.get("description", setting.description)
        setting.is_public = value.get("is_public", setting.is_public)
        setting.updated_at = datetime.utcnow()
        
        # Log the change
        audit_log = AuditLog(
            user_id=current_user.id,
            action="update_system_setting",
            entity_type="system_setting",
            entity_id=setting.id,
            old_values=old_value,
            new_values=value["value"]
        )
        db.add(audit_log)
    
    db.commit()
    return {"message": "Setting updated successfully"}

@router.post("/notifications/broadcast")
async def broadcast_notification(
    notification_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Broadcast notification to all users or specific groups"""
    
    target_users = []
    
    if notification_data.get("target") == "all":
        target_users = db.query(User).filter(User.status == UserStatus.ACTIVE).all()
    elif notification_data.get("target") == "role":
        target_role = UserRole(notification_data["role"])
        target_users = db.query(User).filter(
            User.role == target_role,
            User.status == UserStatus.ACTIVE
        ).all()
    
    notifications = []
    for user in target_users:
        notification = Notification(
            user_id=user.id,
            title=notification_data["title"],
            message=notification_data["message"],
            type="system_alert"
        )
        notifications.append(notification)
    
    db.add_all(notifications)
    db.commit()
    
    return {
        "message": f"Notification sent to {len(notifications)} users",
        "count": len(notifications)
    }
