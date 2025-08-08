import React, { createContext, useContext, useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Initialize Web3
  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    try {
      const provider = await detectEthereumProvider();
      
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        
        // Check if already connected
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
        
        // Get chain ID
        const chainId = await web3Instance.eth.getChainId();
        setChainId(chainId);
        
        // Listen for account changes
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);
      } else {
        toast.error('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      toast.error('Failed to initialize Web3');
    }
  };

  const connectWallet = async () => {
    if (!web3) {
      toast.error('Web3 not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      setAccount(accounts[0]);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload(); // Reload the page on chain change
  };

  const getBalance = async (address = account) => {
    if (!web3 || !address) return '0';
    
    try {
      const balance = await web3.eth.getBalance(address);
      return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  const sendTransaction = async (to, amount, data = '') => {
    if (!web3 || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const gasPrice = await web3.eth.getGasPrice();
      const gasEstimate = await web3.eth.estimateGas({
        from: account,
        to,
        value: web3.utils.toWei(amount, 'ether'),
        data
      });

      const transaction = {
        from: account,
        to,
        value: web3.utils.toWei(amount, 'ether'),
        gas: gasEstimate,
        gasPrice,
        data
      };

      const txHash = await web3.eth.sendTransaction(transaction);
      return txHash;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  const getContract = (abi, address) => {
    if (!web3) return null;
    return new web3.eth.Contract(abi, address);
  };

  const switchToCorrectNetwork = async (targetChainId = 1337) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3.utils.toHex(targetChainId) }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        if (targetChainId === 1337) {
          // Add localhost network
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: web3.utils.toHex(1337),
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://localhost:8545'],
              blockExplorerUrls: null,
            }],
          });
        }
      }
      throw error;
    }
  };

  const value = {
    web3,
    account,
    isConnected,
    isLoading,
    chainId,
    connectWallet,
    disconnectWallet,
    getBalance,
    sendTransaction,
    getContract,
    switchToCorrectNetwork
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
