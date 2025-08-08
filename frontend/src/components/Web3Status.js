import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Card, Badge } from '@tremor/react';
import { Wallet, Server, AlertCircle, CheckCircle } from 'lucide-react';

const Web3Status = () => {
  const { web3, account, isConnected, chainId, connectWallet, getBalance } = useWeb3();
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    if (account && web3) {
      getBalance(account).then(setBalance);
    }
  }, [account, web3, getBalance]);

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1337:
      case 5777:
        return 'Ganache Local';
      case 1:
        return 'Ethereum Mainnet';
      case 3:
        return 'Ropsten Testnet';
      case 4:
        return 'Rinkeby Testnet';
      case 5:
        return 'Goerli Testnet';
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Web3 Connection Status</h3>
        {isConnected ? (
          <Badge color="green" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge color="yellow" className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Disconnected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Network</p>
              <p className="text-sm text-gray-600">
                {chainId ? getNetworkName(chainId) : 'Not connected'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Account</p>
              <p className="text-sm text-gray-600 font-mono">
                {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : 'Not connected'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Balance</p>
            <p className="text-lg font-semibold text-gray-900">{balance} ETH</p>
          </div>

          {!isConnected && (
            <button
              onClick={connectWallet}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>To connect to Ganache:</strong>
          </p>
          <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
            <li>Start Ganache on port 7545</li>
            <li>The app will automatically connect to Ganache</li>
            <li>If you have MetaMask, add Ganache network manually</li>
          </ol>
        </div>
      )}
    </Card>
  );
};

export default Web3Status;
