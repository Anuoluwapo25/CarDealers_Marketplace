import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NFT_MARKETPLACE_ABI from '../abi/NFT.json';

const NFT_MARKETPLACE_ADDRESS = "0x91926E1f55B16Bb2171BA9b3649603275934d282";

// Hardcoded admin addresses for testing
const ADMIN_ADDRESSES = [
  "0x91926E1f55B16Bb2171BA9b3649603275934d282", // Contract address as admin
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Add your test wallet here
  "0x123f681646d4a755815f9cb19e1acc8565a0c2ac"  // Add another test wallet
];

export const useContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced checkAdmin function with hardcoded addresses
  const checkAdmin = async (contract, accountAddress) => {
    if (!accountAddress) return false;
    
    // First check if the address is in our hardcoded list (for testing/development)
    if (ADMIN_ADDRESSES.map(addr => addr.toLowerCase()).includes(accountAddress.toLowerCase())) {
      console.log("Admin found in hardcoded list");
      return true;
    }
    
    // If not in hardcoded list, try the contract check
    if (contract) {
      try {
        const adminAddress = await contract.owner(); // Using the owner() function from the contract
        const isContractAdmin = accountAddress.toLowerCase() === adminAddress.toLowerCase();
        console.log("Contract admin check:", isContractAdmin);
        return isContractAdmin;
      } catch (error) {
        console.error("Error checking admin status via contract:", error);
        // Fall back to hardcoded check only in case of error
        return ADMIN_ADDRESSES.map(addr => addr.toLowerCase()).includes(accountAddress.toLowerCase());
      }
    }
    
    return false;
  };

  // Initialize contract and wallet connection
  useEffect(() => {
    const initialize = async () => {
      // Check if MetaMask is installed
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Create ethers provider and signer
          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          const ethersSigner = ethersProvider.getSigner();
          const marketplaceContract = new ethers.Contract(
            NFT_MARKETPLACE_ADDRESS,
            NFT_MARKETPLACE_ABI,
            ethersSigner
          );
          
          setProvider(ethersProvider);
          setSigner(ethersSigner);
          setContract(marketplaceContract);
          setAccount(accounts[0]);
          
          // Check if the connected account is an admin
          const adminStatus = await checkAdmin(marketplaceContract, accounts[0]);
          console.log("Admin status:", adminStatus, "for account:", accounts[0]);
          setIsAdmin(adminStatus);
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', async (newAccounts) => {
            if (newAccounts.length > 0) {
              setAccount(newAccounts[0]);
              const adminStatus = await checkAdmin(marketplaceContract, newAccounts[0]);
              console.log("Admin status changed:", adminStatus, "for account:", newAccounts[0]);
              setIsAdmin(adminStatus);
            } else {
              // Handle case where user disconnected all accounts
              setAccount('');
              setIsAdmin(false);
            }
          });
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("Please install MetaMask!");
        setIsLoading(false);
      }
    };
    
    initialize();
    
    // Cleanup listener on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          // Check admin status when wallet is connected
          if (contract) {
            const adminStatus = await checkAdmin(contract, accounts[0]);
            console.log("Admin status after connect:", adminStatus, "for account:", accounts[0]);
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to use this feature.");
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return {
    provider,
    signer,
    contract,
    account,
    isAdmin,
    isLoading,
    connectWallet,
    formatAddress,
    // Add a function to toggle admin for testing
    toggleAdminForTesting: () => setIsAdmin(prev => !prev)
  };
};