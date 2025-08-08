from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Group, User, Cycle, Contribution
from app.schemas import ContractDeployRequest, ContractDeployResponse, TransactionRequest, TransactionResponse
from app.auth import get_current_user
from app.blockchain_service import BlockchainService
import os

router = APIRouter()

# Initialize blockchain service
blockchain_service = BlockchainService(
    provider_url=os.getenv("WEB3_PROVIDER_URL", "http://localhost:8545"),
    private_key=os.getenv("DEPLOYER_PRIVATE_KEY")
)

@router.post("/deploy-contract", response_model=ContractDeployResponse)
async def deploy_group_contract(
    deploy_request: ContractDeployRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deploy a smart contract for a group"""
    # Verify user owns the group
    group = db.query(Group).filter(
        Group.id == deploy_request.group_id,
        Group.creator_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or you're not the creator"
        )
    
    if group.contract_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contract already deployed for this group"
        )
    
    try:
        # Deploy contract
        result = await blockchain_service.deploy_chama_contract(
            contribution_amount=deploy_request.contribution_amount,
            member_addresses=deploy_request.member_addresses
        )
        
        # Update group with contract address
        group.contract_address = result["contract_address"]
        db.commit()
        
        return ContractDeployResponse(
            contract_address=result["contract_address"],
            transaction_hash=result["transaction_hash"],
            gas_used=result["gas_used"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contract deployment failed: {str(e)}"
        )

@router.post("/contribute")
async def make_contribution(
    transaction_request: TransactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Make a contribution to the current cycle"""
    try:
        # Send transaction
        result = await blockchain_service.send_transaction(
            from_address=transaction_request.from_address,
            to_address=transaction_request.to_address,
            amount=transaction_request.amount,
            private_key=transaction_request.private_key
        )
        
        return TransactionResponse(
            transaction_hash=result["transaction_hash"],
            status=result["status"],
            gas_used=result.get("gas_used")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed: {str(e)}"
        )

@router.get("/group/{group_id}/contract-info")
async def get_contract_info(group_id: int, db: Session = Depends(get_db)):
    """Get smart contract information for a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    if not group.contract_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No contract deployed for this group"
        )
    
    try:
        contract_info = await blockchain_service.get_contract_info(group.contract_address)
        return contract_info
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contract info: {str(e)}"
        )

@router.post("/group/{group_id}/distribute")
async def distribute_funds(
    group_id: int,
    recipient_address: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Distribute funds to the current cycle recipient"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    if not group.contract_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No contract deployed for this group"
        )
    
    try:
        result = await blockchain_service.distribute_funds(
            contract_address=group.contract_address,
            recipient_address=recipient_address
        )
        
        return {
            "message": "Funds distributed successfully",
            "transaction_hash": result["transaction_hash"],
            "amount_distributed": result["amount"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Distribution failed: {str(e)}"
        )

@router.get("/transaction/{tx_hash}")
async def get_transaction_status(tx_hash: str):
    """Get the status of a blockchain transaction"""
    try:
        status_info = await blockchain_service.get_transaction_status(tx_hash)
        return status_info
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transaction status: {str(e)}"
        )

@router.get("/balance/{address}")
async def get_wallet_balance(address: str):
    """Get the balance of a wallet address"""
    try:
        balance = await blockchain_service.get_balance(address)
        return {"address": address, "balance": balance}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get balance: {str(e)}"
        )
