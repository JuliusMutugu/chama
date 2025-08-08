from functools import wraps
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.database import get_db
from app.models import User, UserRole, GroupRole, GroupMember
from typing import List, Optional

class PermissionDenied(HTTPException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            raise PermissionDenied(
                f"Access denied. Required roles: {[role.value for role in self.allowed_roles]}"
            )
        return current_user

# Role-based decorators
def require_roles(allowed_roles: List[UserRole]):
    """Decorator to check if user has required system roles"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator

def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise PermissionDenied("Admin access required")
    return current_user

def require_group_manager_or_admin(current_user: User = Depends(get_current_user)):
    """Require group manager or admin role"""
    if current_user.role not in [UserRole.ADMIN, UserRole.GROUP_MANAGER]:
        raise PermissionDenied("Group manager or admin access required")
    return current_user

def require_treasurer_or_admin(current_user: User = Depends(get_current_user)):
    """Require treasurer or admin role"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TREASURER]:
        raise PermissionDenied("Treasurer or admin access required")
    return current_user

class GroupPermissionChecker:
    """Check permissions within a specific group"""
    
    @staticmethod
    def can_manage_group(user: User, group_id: int, db: Session) -> bool:
        """Check if user can manage a specific group"""
        if user.role == UserRole.ADMIN:
            return True
        
        # Check if user is group admin or treasurer
        membership = db.query(GroupMember).filter(
            GroupMember.user_id == user.id,
            GroupMember.group_id == group_id,
            GroupMember.is_active == True
        ).first()
        
        if membership and membership.role in [GroupRole.ADMIN, GroupRole.TREASURER]:
            return True
        
        return False
    
    @staticmethod
    def can_view_group(user: User, group_id: int, db: Session) -> bool:
        """Check if user can view a specific group"""
        if user.role in [UserRole.ADMIN, UserRole.AUDITOR]:
            return True
        
        # Check if user is a member of the group
        membership = db.query(GroupMember).filter(
            GroupMember.user_id == user.id,
            GroupMember.group_id == group_id,
            GroupMember.is_active == True
        ).first()
        
        return membership is not None
    
    @staticmethod
    def can_manage_finances(user: User, group_id: int, db: Session) -> bool:
        """Check if user can manage group finances"""
        if user.role in [UserRole.ADMIN, UserRole.TREASURER]:
            return True
        
        # Check if user is group admin or treasurer
        membership = db.query(GroupMember).filter(
            GroupMember.user_id == user.id,
            GroupMember.group_id == group_id,
            GroupMember.is_active == True
        ).first()
        
        if membership and membership.role in [GroupRole.ADMIN, GroupRole.TREASURER]:
            return True
        
        return False

def check_group_permission(group_id: int, permission_type: str = "view"):
    """Dependency to check group-specific permissions"""
    def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if permission_type == "manage":
            if not GroupPermissionChecker.can_manage_group(current_user, group_id, db):
                raise PermissionDenied("You don't have permission to manage this group")
        elif permission_type == "view":
            if not GroupPermissionChecker.can_view_group(current_user, group_id, db):
                raise PermissionDenied("You don't have permission to view this group")
        elif permission_type == "finance":
            if not GroupPermissionChecker.can_manage_finances(current_user, group_id, db):
                raise PermissionDenied("You don't have permission to manage group finances")
        else:
            raise ValueError(f"Unknown permission type: {permission_type}")
        
        return current_user
    
    return permission_checker

# Dashboard permissions
class DashboardPermissions:
    """Define what each role can see on their dashboard"""
    
    @staticmethod
    def get_user_permissions(role: UserRole) -> dict:
        base_permissions = {
            "can_view_own_profile": True,
            "can_edit_own_profile": True,
            "can_view_own_groups": True,
            "can_make_contributions": True,
            "can_view_own_transactions": True,
        }
        
        if role == UserRole.ADMIN:
            return {
                **base_permissions,
                "can_view_all_users": True,
                "can_manage_users": True,
                "can_view_all_groups": True,
                "can_manage_all_groups": True,
                "can_view_system_analytics": True,
                "can_manage_system_settings": True,
                "can_view_audit_logs": True,
                "can_export_data": True,
                "dashboard_type": "admin"
            }
        
        elif role == UserRole.GROUP_MANAGER:
            return {
                **base_permissions,
                "can_create_groups": True,
                "can_manage_own_groups": True,
                "can_view_group_analytics": True,
                "can_invite_members": True,
                "dashboard_type": "group_manager"
            }
        
        elif role == UserRole.TREASURER:
            return {
                **base_permissions,
                "can_view_financial_reports": True,
                "can_manage_group_finances": True,
                "can_view_all_transactions": True,
                "can_generate_reports": True,
                "dashboard_type": "treasurer"
            }
        
        elif role == UserRole.AUDITOR:
            return {
                **base_permissions,
                "can_view_all_groups": True,
                "can_view_all_transactions": True,
                "can_view_audit_logs": True,
                "can_generate_reports": True,
                "dashboard_type": "auditor"
            }
        
        else:  # MEMBER
            return {
                **base_permissions,
                "dashboard_type": "member"
            }

def get_user_dashboard_config(user: User) -> dict:
    """Get dashboard configuration for a user based on their role"""
    permissions = DashboardPermissions.get_user_permissions(user.role)
    
    return {
        "user_info": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "status": user.status.value,
            "kyc_verified": user.kyc_verified,
        },
        "permissions": permissions,
        "navigation": get_navigation_menu(user.role),
        "widgets": get_dashboard_widgets(user.role)
    }

def get_navigation_menu(role: UserRole) -> List[dict]:
    """Get navigation menu items based on user role"""
    base_menu = [
        {"name": "Dashboard", "path": "/dashboard", "icon": "Home"},
        {"name": "My Groups", "path": "/groups", "icon": "Users"},
        {"name": "Profile", "path": "/profile", "icon": "User"},
    ]
    
    if role == UserRole.ADMIN:
        return base_menu + [
            {"name": "User Management", "path": "/admin/users", "icon": "UserCog"},
            {"name": "System Analytics", "path": "/admin/analytics", "icon": "BarChart"},
            {"name": "Settings", "path": "/admin/settings", "icon": "Settings"},
            {"name": "Audit Logs", "path": "/admin/audit", "icon": "FileText"},
        ]
    
    elif role == UserRole.GROUP_MANAGER:
        return base_menu + [
            {"name": "Create Group", "path": "/groups/create", "icon": "Plus"},
            {"name": "Group Analytics", "path": "/analytics", "icon": "TrendingUp"},
        ]
    
    elif role == UserRole.TREASURER:
        return base_menu + [
            {"name": "Financial Reports", "path": "/reports", "icon": "DollarSign"},
            {"name": "Transactions", "path": "/transactions", "icon": "CreditCard"},
        ]
    
    elif role == UserRole.AUDITOR:
        return base_menu + [
            {"name": "All Groups", "path": "/audit/groups", "icon": "Eye"},
            {"name": "Reports", "path": "/audit/reports", "icon": "FileText"},
        ]
    
    return base_menu

def get_dashboard_widgets(role: UserRole) -> List[dict]:
    """Get dashboard widgets based on user role"""
    base_widgets = [
        {"name": "My Groups", "type": "groups_overview"},
        {"name": "Recent Activity", "type": "activity_feed"},
        {"name": "Upcoming Payments", "type": "payment_reminders"},
    ]
    
    if role == UserRole.ADMIN:
        return [
            {"name": "System Overview", "type": "system_stats"},
            {"name": "User Growth", "type": "user_metrics"},
            {"name": "Platform Revenue", "type": "revenue_chart"},
            {"name": "Active Groups", "type": "group_stats"},
        ] + base_widgets
    
    elif role == UserRole.TREASURER:
        return [
            {"name": "Financial Summary", "type": "financial_overview"},
            {"name": "Transaction Volume", "type": "transaction_chart"},
            {"name": "Outstanding Payments", "type": "outstanding_payments"},
        ] + base_widgets
    
    elif role == UserRole.GROUP_MANAGER:
        return [
            {"name": "My Groups Performance", "type": "group_performance"},
            {"name": "Member Engagement", "type": "engagement_metrics"},
        ] + base_widgets
    
    return base_widgets
