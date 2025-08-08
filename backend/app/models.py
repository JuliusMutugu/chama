from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    wallet_address = Column(String, unique=True, nullable=True, default=None)  # Allow NULL but unique when not NULL
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone_number = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    group_memberships = relationship("GroupMember", back_populates="user")
    created_groups = relationship("Group", back_populates="creator")

class Group(Base):
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    contribution_amount = Column(Float, nullable=False)
    contribution_frequency = Column(String, nullable=False)  # weekly, monthly
    max_members = Column(Integer, nullable=False)
    contract_address = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    creator_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    creator = relationship("User", back_populates="created_groups")
    members = relationship("GroupMember", back_populates="group")
    cycles = relationship("Cycle", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    rotation_order = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="group_memberships")
    group = relationship("Group", back_populates="members")

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
    status = Column(String, default="active")  # active, completed, cancelled
    transaction_hash = Column(String)
    
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
    transaction_hash = Column(String)
    contribution_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="pending")  # pending, confirmed, failed
    
    # Relationships
    cycle = relationship("Cycle", back_populates="contributions")
    user = relationship("User")
