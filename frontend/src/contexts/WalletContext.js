import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [network, setNetwork] = useState(null);
    const [balance, setBalance] = useState('0');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    const updateBalance = useCallback(async (accountAddress) => {
        try {
            if (provider && accountAddress) {
                const balance = await provider.getBalance(accountAddress);
                setBalance(ethers.utils.formatEther(balance));
            }
        } catch (err) {
            console.error('Error updating balance:', err);
        }
    }, [provider]);

    const disconnectWallet = useCallback(() => {
        setAccount('');
        setProvider(null);
        setSigner(null);
        setNetwork(null);
        setBalance('0');
        setError('');
        console.log('Wallet disconnected');
    }, []);

    const connectWallet = useCallback(async () => {
        try {
            setIsConnecting(true);
            setError('');

            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const web3Signer = web3Provider.getSigner();
            const userAccount = await web3Signer.getAddress();
            const userNetwork = await web3Provider.getNetwork();

            // Update state
            setProvider(web3Provider);
            setSigner(web3Signer);
            setAccount(userAccount);
            setNetwork(userNetwork);

            // Get balance
            const balance = await web3Provider.getBalance(userAccount);
            setBalance(ethers.utils.formatEther(balance));

            console.log('Wallet connected:', userAccount);
            console.log('Network:', userNetwork.name, userNetwork.chainId);

        } catch (err) {
            console.error('Error connecting wallet:', err);
            setError(err.message);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // Check if wallet is already connected on page load
    useEffect(() => {
        const checkConnection = async () => {
            try {
                if (typeof window.ethereum !== 'undefined') {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const accounts = await provider.listAccounts();
                    
                    if (accounts.length > 0) {
                        await connectWallet();
                    }
                }
            } catch (err) {
                console.error('Error checking connection:', err);
            }
        };

        const setupEventListeners = () => {
            if (typeof window.ethereum !== 'undefined') {
                // Account change handler
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        disconnectWallet();
                    } else {
                        setAccount(accounts[0]);
                        updateBalance(accounts[0]);
                    }
                });

                // Chain change handler
                window.ethereum.on('chainChanged', () => {
                    window.location.reload(); // Reload to avoid any state issues
                });

                // Disconnect handler
                window.ethereum.on('disconnect', () => {
                    disconnectWallet();
                });
            }
        };

        const initializeWallet = async () => {
            await checkConnection();
            setupEventListeners();
        };
        
        initializeWallet();
    }, [connectWallet, disconnectWallet, updateBalance]);

    const switchNetwork = async (chainId) => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ethers.utils.hexValue(chainId) }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await addNetwork(chainId);
                } catch (addError) {
                    throw new Error('Failed to add network to MetaMask');
                }
            } else {
                throw new Error('Failed to switch network');
            }
        }
    };

    const addNetwork = async (chainId) => {
        const networks = {
            1337: {
                chainId: '0x539',
                chainName: 'Localhost 8545',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                },
            },
            11155111: {
                chainId: '0xAA36A7',
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
            137: {
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                rpcUrls: ['https://polygon-rpc.com/'],
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18,
                },
                blockExplorerUrls: ['https://polygonscan.com/'],
            },
        };

        const networkConfig = networks[chainId];
        if (!networkConfig) {
            throw new Error('Network configuration not found');
        }

        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
        });
    };

    const sendTransaction = async (transaction) => {
        try {
            if (!signer) {
                throw new Error('Wallet not connected');
            }

            const tx = await signer.sendTransaction(transaction);
            console.log('Transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
            
            // Update balance after transaction
            await updateBalance(account);
            
            return receipt;
        } catch (err) {
            console.error('Transaction failed:', err);
            throw err;
        }
    };

    const signMessage = async (message) => {
        try {
            if (!signer) {
                throw new Error('Wallet not connected');
            }

            const signature = await signer.signMessage(message);
            console.log('Message signed:', signature);
            
            return signature;
        } catch (err) {
            console.error('Message signing failed:', err);
            throw err;
        }
    };

    const getNetworkInfo = () => {
        const networkNames = {
            1: 'Ethereum Mainnet',
            3: 'Ropsten Testnet',
            4: 'Rinkeby Testnet',
            5: 'Goerli Testnet',
            11155111: 'Sepolia Testnet',
            137: 'Polygon Mainnet',
            80001: 'Polygon Mumbai Testnet',
            1337: 'Localhost'
        };

        if (!network) return null;

        return {
            chainId: network.chainId,
            name: networkNames[network.chainId] || `Unknown (${network.chainId})`,
            isTestnet: [3, 4, 5, 11155111, 80001, 1337].includes(network.chainId),
            isSupported: [1, 5, 11155111, 137, 80001, 1337].includes(network.chainId)
        };
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatBalance = (balance, decimals = 4) => {
        const num = parseFloat(balance);
        return num.toFixed(decimals);
    };

    const isWalletInstalled = () => {
        return typeof window.ethereum !== 'undefined';
    };

    const value = {
        // State
        account,
        provider,
        signer,
        network,
        balance,
        isConnecting,
        error,

        // Actions
        connectWallet,
        disconnectWallet,
        switchNetwork,
        sendTransaction,
        signMessage,
        updateBalance,

        // Utils
        getNetworkInfo,
        formatAddress,
        formatBalance,
        isWalletInstalled,

        // Computed
        isConnected: !!account,
        networkInfo: getNetworkInfo()
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
