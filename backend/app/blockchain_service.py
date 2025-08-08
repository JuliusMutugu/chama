from web3 import Web3
from typing import Dict, List, Optional
import json
import os
from pathlib import Path

class BlockchainService:
    def __init__(self, provider_url: str, private_key: Optional[str] = None):
        self.w3 = Web3(Web3.HTTPProvider(provider_url))
        self.private_key = private_key
        
        # Load contract ABI and bytecode
        self.contract_path = Path(__file__).parent.parent / 'contracts' / 'ChamaContract.sol'
        self.chama_abi = self._load_chama_abi()
        self.chama_bytecode = self._load_chama_bytecode()
    
    def _load_chama_abi(self) -> List:
        """Load the Chama contract ABI"""
        # In production, this would load from a compiled contract
        # For now, we'll use a simplified ABI
        return [
            {
                "inputs": [
                    {"internalType": "uint256", "name": "_contributionAmount", "type": "uint256"},
                    {"internalType": "address[]", "name": "_initialMembers", "type": "address[]"}
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [],
                "name": "contribute",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ]
    
    def _load_chama_bytecode(self) -> str:
        """Load the Chama contract bytecode"""
        # In production, this would load from a compiled contract
        # For now, we'll use a placeholder
        return "0x608060405234801561001057600080fd5b506040516103..."
    
    async def deploy_chama_contract(
        self, 
        contribution_amount: float,
        member_addresses: List[str]
    ) -> Dict:
        """Deploy a new Chama smart contract"""
        if not self.private_key:
            raise ValueError("Private key required for contract deployment")
        
        account = self.w3.eth.account.from_key(self.private_key)
        
        # Convert contribution amount to Wei
        contribution_wei = self.w3.to_wei(contribution_amount, 'ether')
        
        # Create contract instance
        contract = self.w3.eth.contract(
            abi=self.chama_abi,
            bytecode=self.chama_bytecode
        )
        
        # Build constructor transaction
        constructor_txn = contract.constructor(
            contribution_wei,
            member_addresses
        ).build_transaction({
            'from': account.address,
            'nonce': self.w3.eth.get_transaction_count(account.address),
            'gas': 2000000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        # Sign transaction
        signed_txn = self.w3.eth.account.sign_transaction(
            constructor_txn, 
            private_key=self.private_key
        )
        
        # Send transaction
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for transaction receipt
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            'contract_address': tx_receipt.contractAddress,
            'transaction_hash': tx_receipt.transactionHash.hex(),
            'gas_used': tx_receipt.gasUsed
        }
    
    async def contribute_to_group(
        self,
        contract_address: str,
        amount: float,
        member_address: str
    ) -> Dict:
        """Make a contribution to a group"""
        if not self.private_key:
            raise ValueError("Private key required for contribution")
        
        # Convert amount to Wei
        amount_wei = self.w3.to_wei(amount, 'ether')
        
        # Get contract instance
        contract = self.w3.eth.contract(
            address=contract_address,
            abi=self.chama_abi
        )
        
        # Build contribution transaction
        txn = contract.functions.contribute().build_transaction({
            'from': member_address,
            'value': amount_wei,
            'nonce': self.w3.eth.get_transaction_count(member_address),
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        # Sign and send transaction
        signed_txn = self.w3.eth.account.sign_transaction(
            txn,
            private_key=self.private_key
        )
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            'transaction_hash': receipt.transactionHash.hex(),
            'status': 'success' if receipt.status == 1 else 'failed',
            'gas_used': receipt.gasUsed
        }
    
    def get_contract_balance(self, contract_address: str) -> float:
        """Get the balance of a contract in Ether"""
        balance_wei = self.w3.eth.get_balance(contract_address)
        return self.w3.from_wei(balance_wei, 'ether')
