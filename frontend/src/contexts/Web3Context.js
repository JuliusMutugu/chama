import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
      toast.success('Wallet disconnected');
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  }, []);

  const handleChainChanged = useCallback((chainId) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload(); // Reload the page on chain change
  }, []);

  const initializeWeb3 = useCallback(async () => {
    try {
      // First try to detect MetaMask
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
        
        console.log('Connected to MetaMask');
      } else {
        // Fallback to Ganache if MetaMask is not available
        console.log('MetaMask not found, trying to connect to Ganache...');
        const ganacheProvider = 'http://127.0.0.1:7545';
        const web3Instance = new Web3(ganacheProvider);
        
        try {
          // Test the connection
          const accounts = await web3Instance.eth.getAccounts();
          setWeb3(web3Instance);
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            const chainId = await web3Instance.eth.getChainId();
            setChainId(chainId);
            toast.success('Connected to Ganache!');
            console.log('Connected to Ganache with account:', accounts[0]);
          }
        } catch (ganacheError) {
          console.error('Ganache connection failed:', ganacheError);
          toast.error('Please start Ganache on port 7545 or install MetaMask!');
        }
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      toast.error('Failed to initialize Web3');
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Initialize Web3
  useEffect(() => {
    initializeWeb3();
  }, [initializeWeb3]);

  const connectWallet = async () => {
    if (!web3) {
      toast.error('Web3 not initialized');
      return;
    }

    setIsLoading(true);
    try {
      if (window.ethereum) {
        // MetaMask connection
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        setAccount(accounts[0]);
        setIsConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
        // Ganache connection - just use the first account
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          toast.success('Connected to Ganache account!');
        }
      }
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

  const switchToGanache = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x539', // 1337 in hex (Ganache default)
            chainName: 'Ganache Local',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['http://127.0.0.1:7545'],
            blockExplorerUrls: null
          }]
        });
        toast.success('Switched to Ganache network!');
      } catch (error) {
        console.error('Error switching to Ganache:', error);
        toast.error('Failed to switch to Ganache network');
      }
    }
  };

  const getBalance = async (address) => {
    if (!web3 || !address) return '0';
    try {
      const balance = await web3.eth.getBalance(address);
      return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  const sendTransaction = async (transaction) => {
    if (!web3 || !account) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      const result = await web3.eth.sendTransaction({
        from: account,
        ...transaction
      });
      toast.success('Transaction sent successfully!');
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed');
      throw error;
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const value = {
    web3,
    account,
    isConnected,
    isLoading,
    chainId,
    connectWallet,
    disconnectWallet,
    switchToGanache,
    getBalance,
    sendTransaction,
    formatAddress,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
