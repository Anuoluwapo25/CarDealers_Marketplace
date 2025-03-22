import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Car from '../assets/blackcar.jpg';
import NFT_MARKETPLACE_ABI from '../abi/NFT.json';

const NFT_MARKETPLACE_ADDRESS = "0x91926E1f55B16Bb2171BA9b3649603275934d282";

// Hardcoded admin addresses for testing
const ADMIN_ADDRESSES = [
  "0x91926E1f55B16Bb2171BA9b3649603275934d282", // Contract address as admin
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Add your test wallet here
  "0x123f681646d4a755815f9cb19e1acc8565a0c2ac"  // Add another test wallet
];

// Ethereum provider initialization component
const useEthereumProvider = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced checkAdmin function with hardcoded addresses
  const checkAdmin = async (contractInstance, accountAddress) => {
    if (!accountAddress) return false;
    
    // First check if the address is in our hardcoded list (for testing/development)
    if (ADMIN_ADDRESSES.map(addr => addr.toLowerCase()).includes(accountAddress.toLowerCase())) {
      console.log("Admin found in hardcoded list");
      return true;
    }
    
    // If not in hardcoded list, try the contract check
    if (contractInstance) {
      try {
        const adminAddress = await contractInstance.owner(); // Using the owner() function from the contract
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

  // Initialize the provider, signer, and contract
  const initialize = async () => {
    setIsLoading(true);
    setError(null);
    
    // Check if MetaMask is installed
    if (window.ethereum) {
      try {
        console.log("Initializing with window.ethereum");
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected accounts:", accounts);
        
        if (accounts.length === 0) {
          throw new Error("No accounts available");
        }
        
        // Create ethers provider and signer - Fixed for ethers v6
        let ethersProvider;
        let ethersSigner;
        
        // Check ethers version and use appropriate API
        if (ethers.version && ethers.version.startsWith('6')) {
          // ethers v6 approach
          ethersProvider = new ethers.BrowserProvider(window.ethereum);
          ethersSigner = await ethersProvider.getSigner();
        } else {
          // ethers v5 approach
          ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          ethersSigner = ethersProvider.getSigner();
        }
        
        console.log("Provider created");
        
        // Get the network details
        const network = await ethersProvider.getNetwork();
        console.log("Connected to network:", network);
        
        // Verify the address is valid
        if (!ethers.isAddress(NFT_MARKETPLACE_ADDRESS)) {
          throw new Error("Invalid contract address: " + NFT_MARKETPLACE_ADDRESS);
        }
        
        // Create contract instance
        const marketplaceContract = new ethers.Contract(
          NFT_MARKETPLACE_ADDRESS,
          NFT_MARKETPLACE_ABI,
          ethersSigner
        );
        
        console.log("Contract created:", marketplaceContract.address);
        console.log("Available contract functions:", Object.keys(marketplaceContract.functions || {}));
        
        // Test if we can call a simple view function to verify connection
        try {
          const owner = await marketplaceContract.owner();
          console.log("Contract owner:", owner);
        } catch (viewError) {
          console.warn("Could not call view function on contract:", viewError);
        }
        
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
          console.log("Accounts changed:", newAccounts);
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            const newAdminStatus = await checkAdmin(marketplaceContract, newAccounts[0]);
            console.log("Admin status changed:", newAdminStatus, "for account:", newAccounts[0]);
            setIsAdmin(newAdminStatus);
          } else {
            // Handle case where user disconnected all accounts
            setAccount('');
            setIsAdmin(false);
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error in initialization:", error);
        setError(error.message || "Failed to initialize Ethereum connection");
        setIsLoading(false);
      }
    } else {
      console.error("MetaMask not installed");
      setError("Please install MetaMask to use this dApp!");
      setIsLoading(false);
    }
  };
  
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
        setError("Failed to connect wallet: " + error.message);
      }
    } else {
      setError("MetaMask is not installed. Please install MetaMask to use this feature.");
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    initialize();
    
    // Cleanup listener on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);
  
  return {
    provider,
    signer,
    contract,
    account,
    isAdmin,
    isLoading,
    error,
    connectWallet,
    initialize,
    checkAdmin
  };
};

const CarNFTMarketplace = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carNFTs, setCarNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Admin mint form state
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const [mintError, setMintError] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);

  // Use our custom hook for Ethereum provider
  const {
    provider,
    signer,
    contract,
    account,
    isAdmin,
    error: ethError,
    connectWallet
  } = useEthereumProvider();

  // Sample featured cars data (for testing)
  const featuredCars = [
    {
      id: '1',
      make: 'Lamborghini',
      model: 'Aventador',
      year: 2022,
      image: Car,
      price: '75.5',
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      forSale: true
    },
    {
      id: '2',
      make: 'Ferrari',
      model: 'LaFerrari',
      year: 2021,
      image: Car,
      price: '120',
      owner: '0x123f681646d4a755815f9cb19e1acc8565a0c2ac',
      forSale: true
    }
  ];

  // Benefits of car NFTs
  const benefits = [
    { id: 1, title: "Verifiable ownership", description: "Each car NFT has blockchain-verified proof of ownership and authenticity, eliminating fraud and providing complete transparency of vehicle history." },
    { id: 2, title: "Exclusive collector benefits", description: "NFT car owners get access to exclusive events, private viewings, and special discounts on future releases within our ecosystem." },
    { id: 3, title: "Fractional ownership", description: "Our smart contracts allow for multiple investors to own shares of high-value vehicles, democratizing access to luxury car investments." },
    { id: 4, title: "Seamless transfers & sales", description: "Buy, sell, and transfer ownership instantly without paperwork. Smart contracts handle all the details securely and transparently." },
  ];

  // Fetch car NFTs
  const fetchCarNFTs = async (contractInstance) => {
    try {
      setIsLoading(true);
      
      // Using the sample data for now, you would replace this with actual contract calls
      setTimeout(() => {
        setCarNFTs(featuredCars);
        setIsLoading(false);
      }, 1000);

      // Uncomment this section when ready to fetch from blockchain
      /*
      if (!contractInstance) return;
      
      const totalNFTs = await contractInstance.totalSupply();
      const nftArray = [];
      
      for (let i = 0; i < totalNFTs; i++) {
        const tokenId = await contractInstance.tokenByIndex(i);
        const carData = await contractInstance.getCarNFTDetails(tokenId);
        const owner = await contractInstance.ownerOf(tokenId);
        const isForSale = await contractInstance.isForSale(tokenId);
        const price = isForSale ? await contractInstance.getSalePrice(tokenId) : 0;
        
        nftArray.push({
          id: tokenId.toString(),
          make: carData.make,
          model: carData.model,
          year: carData.year,
          image: carData.imageUrl,
          price: ethers.formatEther(price),
          owner: owner,
          forSale: isForSale
        });
      }
      
      setCarNFTs(nftArray);
      */
    } catch (error) {
      console.error("Error fetching car NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load car NFTs when contract is available
  useEffect(() => {
    if (contract) {
      fetchCarNFTs(contract);
    }
  }, [contract]);
  
  // Function to extract token ID from event logs
  const getTokenIdFromLogs = (logs) => {
    if (!logs || !Array.isArray(logs)) {
      console.warn("Invalid logs provided to getTokenIdFromLogs", logs);
      return "Unknown";
    }
    
    try {
      for (const log of logs) {
        try {
          // Check if the contract interface is available
          if (!contract || !contract.interface) {
            console.warn("Contract or contract interface is not available");
            continue;
          }
          
          const parsedLog = contract.interface.parseLog(log);
          console.log("Parsed log:", parsedLog);
          
          // Check various event names and arg patterns that might contain the token ID
          if (parsedLog.name === 'CarNFTMinted' || parsedLog.name === 'Transfer') {
            // Try different argument names that might hold the token ID
            const possibleTokenIdArgs = ['tokenId', '_tokenId', 'id', '_id', 'tokenID'];
            for (const argName of possibleTokenIdArgs) {
              if (parsedLog.args && parsedLog.args[argName] !== undefined) {
                return parsedLog.args[argName].toString();
              }
            }
            
            // If Transfer event with standard ERC721 structure (to, from, tokenId)
            if (parsedLog.name === 'Transfer' && parsedLog.args && parsedLog.args[2]) {
              return parsedLog.args[2].toString();
            }
          }
        } catch (e) {
          console.warn("Error parsing log:", e);
          // Continue to next log
        }
      }
    } catch (e) {
      console.error("Error in getTokenIdFromLogs:", e);
    }
    
    return "Unknown";
  };

  // Admin mint car NFT
  const adminMintCarNFT = async (make, model, year, price, metadataUrl) => {
    if (!contract) return;
    
    try {
      let priceValue;
      if (ethers.version && ethers.version.startsWith('6')) {
        // ethers v6
        priceValue = ethers.parseEther(price.toString());
      } else {
        // ethers v5
        priceValue = ethers.utils.parseEther(price.toString());
      }
      
      const tx = await contract.adminMintCarNFT(
        make,
        model,
        year,
        priceValue,
        metadataUrl
      );
      
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("Error in admin minting:", error);
      throw error;
    }
  };

  // List car for sale
  const listCarForSale = async (tokenId, price) => {
    if (!contract) return;
    
    try {
      let priceValue;
      if (ethers.version && ethers.version.startsWith('6')) {
        // ethers v6
        priceValue = ethers.parseEther(price.toString());
      } else {
        // ethers v5
        priceValue = ethers.utils.parseEther(price.toString());
      }
      
      const tx = await contract.listCarForSale(tokenId, priceValue);
      await tx.wait();
      console.log("Car NFT listed for sale successfully!");
      fetchCarNFTs(contract);
    } catch (error) {
      console.error("Error listing car NFT for sale:", error);
    }
  };

  // Buy car NFT
  const buyCarNFT = async (tokenId, price) => {
    if (!contract) return;
    
    try {
      let priceValue;
      if (ethers.version && ethers.version.startsWith('6')) {
        // ethers v6
        priceValue = ethers.parseEther(price.toString());
      } else {
        // ethers v5
        priceValue = ethers.utils.parseEther(price.toString());
      }
      
      const tx = await contract.buyCarNFT(tokenId, { value: priceValue });
      await tx.wait();
      console.log("Car NFT purchased successfully!");
      fetchCarNFTs(contract);
    } catch (error) {
      console.error("Error buying car NFT:", error);
    }
  };

  // Admin mint form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle admin mint form submission
  const handleAdminMintSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setMintError("Only admin can mint NFTs");
      return;
    }
    
    // Check if contract is available
    if (!contract) {
      setMintError("Contract is not initialized. Please make sure your wallet is connected to the correct network.");
      console.error("Contract is null or undefined when attempting to mint");
      return;
    }
    
    setMintLoading(true);
    setMintError(null);
    setMintResult(null);
  
    try {
      console.log("Contract address:", contract.address);
      console.log("Contract methods:", Object.keys(contract.functions || {}));
      
      // Use your pre-generated IPFS URL directly
      const ipfsUrl = "ipfs://bafybeichly7xz2kzyhs6qldr27g7jj433fvqy2o5hu4wwsnp4cosul2iem";
      
      // Check if the adminMintCarNFT function exists on the contract
      if (typeof contract.adminMintCarNFT !== 'function') {
        throw new Error("The adminMintCarNFT function is not available on this contract. " +
                       "Please check your contract ABI and ensure you're connected to the right contract.");
      }
      
      // Mint the NFT using the contract
      const receipt = await adminMintCarNFT(
        formData.make,
        formData.model,
        parseInt(formData.year),
        formData.price,
        ipfsUrl
      );
      
      console.log("Transaction receipt:", receipt);
      
      // Check if receipt and logs exist before trying to extract token ID
      let tokenId = "Unknown";
      let txHash = receipt && receipt.hash ? receipt.hash : "Unknown";
      
      if (receipt && receipt.logs) {
        tokenId = getTokenIdFromLogs(receipt.logs);
      } else if (receipt && receipt.events) {
        // Handle ethers v6 events format
        const mintEvent = receipt.events.find(e => 
          e.event === 'CarNFTMinted' || e.event === 'Transfer'
        );
        if (mintEvent && mintEvent.args) {
          tokenId = mintEvent.args.tokenId || mintEvent.args._tokenId || "Unknown";
        }
      }
      
      setMintResult({
        tokenId: tokenId,
        txHash: txHash,
        metadataURI: ipfsUrl
      });
      
      // Reset form after successful mint
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        description: ''
      });
      setImage(null);
      
      // Refresh NFT list
      fetchCarNFTs(contract);
    } catch (err) {
      console.error("Minting error:", err);
      setMintError(err.message || "Minting failed. Check console for details.");
    } finally {
      setMintLoading(false);
    }
  };

  // Slider functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredCars.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredCars.length) % featuredCars.length);
  };

  // Format address display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Force admin toggle for testing (remove in production)
  const toggleAdminForTesting = () => {
    setIsAdmin(!isAdmin);
    console.log("Admin status manually toggled to:", !isAdmin);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">+</span>
            </div>
            <span className="ml-2 text-white font-bold uppercase">CARNFT</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-orange-500 font-medium border-b-2 border-orange-500 pb-1">MARKETPLACE</a>
            <a href="#" className="text-white font-medium">COLLECTION</a>
            <a href="#" className="text-white font-medium">MY GARAGE</a>
            <a href="#" className="text-white font-medium">HOW IT WORKS</a>
            {isAdmin && (
              <a href="#" className="text-white font-medium bg-orange-500 px-3 py-1 rounded-md"
                 onClick={() => setShowAdminForm(!showAdminForm)}>
                ADMIN {showAdminForm ? '(HIDE)' : '(SHOW)'}
              </a>
            )}
          </div>
          
          <div className="flex items-center">
            {/* Emergency admin toggle (remove in production) */}
            <button 
              className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium mr-2"
              onClick={toggleAdminForTesting}
            >
              {isAdmin ? "Disable Admin" : "Enable Admin"}
            </button>
            
            <button 
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={connectWallet}
            >
              {account ? formatAddress(account) : "CONNECT WALLET"}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Error display */}
      {ethError && (
        <div className="bg-red-700 text-white py-2 px-4 text-center">
          <p>{ethError}</p>
        </div>
      )}
      
      {/* Admin status indicator */}
      {account && (
        <div className={`text-center py-1 ${isAdmin ? "bg-green-700" : "bg-red-700"}`}>
          <p className="text-white text-sm">
            {isAdmin 
              ? `Connected as Admin: ${formatAddress(account)}` 
              : `Connected as User: ${formatAddress(account)}`}
          </p>
        </div>
      )}
      
      {/* Admin Minting Form (conditionally rendered) */}
      {showAdminForm && isAdmin && (
        <div className="bg-gray-900 text-white py-8">
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Admin NFT Minting</h2>
            
            <form onSubmit={handleAdminMintSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Make:</label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Model:</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Year:</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                    min="1900"
                    max="2100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Price (ETH):</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                    min="0.001"
                    step="0.001"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1">Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  rows="3"
                ></textarea>
              </div>
              
              <div>
                <label className="block mb-1">Car Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  required
                />
                {image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">Selected: {image.name}</p>
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt="Preview" 
                      className="mt-2 h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
                disabled={mintLoading}
              >
                {mintLoading ? 'Processing...' : 'Mint NFT'}
              </button>
            </form>
            
            {mintError && (
              <div className="mt-4 p-3 bg-red-900 border border-red-700 text-white rounded">
                Error: {mintError}
              </div>
            )}
            
            {mintResult && (
              <div className="mt-4 p-3 bg-green-900 border border-green-700 text-white rounded">
                <h3 className="font-bold">NFT Minted Successfully!</h3>
                <p>Token ID: {mintResult.tokenId}</p>
                <p>Transaction: {mintResult.txHash.slice(0, 10)}...{mintResult.txHash.slice(-8)}</p>
                <p>
                  <a 
                    href={mintResult.metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View Metadata
                  </a>
                </p>
                
                <div className="mt-3">
                  <button
                    onClick={() => listCarForSale(mintResult.tokenId, formData.price)}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    List For Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hero Section / Featured NFT */}
      <div className="relative bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-64 md:h-80 lg:h-96 bg-gray-800 rounded-lg overflow-hidden">
            {/* Car Image */}
            <img
              src={featuredCars[currentSlide]?.image || Car}
              alt="Luxury car NFT"
              className="w-full h-full object-cover"
            />
            
            {/* NFT Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 p-6 md:p-8 md:flex md:justify-between md:items-center">
              <div className="mb-4 md:mb-0 md:w-1/2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">EXCLUSIVE CAR NFTs</h2>
                <h3 className="text-xl md:text-2xl font-bold text-orange-500">OWN THE FUTURE OF AUTOMOTIVE</h3>
              </div>
              
              <div className="md:w-1/2">
                <p className="text-sm text-gray-300 mb-4">
                  Own verified digital assets of the world's most exclusive vehicles. Each NFT comes with unique benefits, ownership verification, and future resale value.
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Current Price</p>
                    <p className="text-lg font-bold text-white">{featuredCars[currentSlide]?.price || "0"} ETH</p>
                  </div>
                  <button 
                    className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-medium"
                    onClick={() => buyCarNFT(featuredCars[currentSlide]?.id, featuredCars[currentSlide]?.price)}
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            </div>
            
            {/* Slider Buttons */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center"
            >
              &lt;
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center"
            >
              &gt;
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {featuredCars.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide ? "bg-white" : "bg-gray-500"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            
            {/* NFT Badge */}
            <div className="absolute top-8 right-8 bg-gray-800 text-white rounded-full px-4 py-1 text-sm font-medium flex items-center">
              <span className="w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
              VERIFIED NFT
            </div>
          </div>
        </div>
      </div>
      
      {/* Blockchain Info Bar */}
      <div className="bg-gray-800 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">Network: <span className="text-green-400">Ethereum</span></div>
            <div className="text-sm">Gas: <span className="text-green-400">32 Gwei</span></div>
            <div className="text-sm">Total NFTs: <span className="text-green-400">358</span></div>
            <div className="text-sm">Floor Price: <span className="text-green-400">1.2 ETH</span></div>
            <div className="text-sm">Volume: <span className="text-green-400">452 ETH</span></div>
          </div>
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="bg-orange-500 p-8 rounded-lg">
                <h3 className="text-white text-3xl font-bold tracking-wider">NFT</h3>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4 text-white">WHY OWN CAR NFTs WITH US</h2>
              <p className="text-gray-300 mb-4">Our blockchain-powered marketplace ensures complete transparency, verified authenticity, and instant transfers. Each NFT represents true digital ownership of exclusive vehicles with additional real-world benefits and privileges.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="bg-gray-800 text-white p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {benefit.id}
                  </div>
                  <h3 className="text-xl font-medium">{benefit.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* NFT Collection */}
      <div className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">FEATURED CAR NFTs</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-300">Loading NFTs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {carNFTs.map((car) => (
                <div key={car.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                  <div className="relative">
                    <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />
                    {car.forSale && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        FOR SALE
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white">{car.make} {car.model}</h3>
                    <p className="text-gray-300 text-sm mb-4">Year: {car.year}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Current Price</p>
                        <p className="text-lg font-bold text-white">{car.price} ETH</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Owner</p>
                        <p className="text-sm text-gray-300">{formatAddress(car.owner)}</p>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full bg-orange-500 text-white py-2 rounded-md font-medium"
                      onClick={() => buyCarNFT(car.id, car.price)}
                    >
                      {car.forSale ? "BUY NOW" : "VIEW DETAILS"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-md font-medium">
              VIEW ALL NFTs
            </button>
          </div>
          // Add this near your other UI elements for testing
<button 
  className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium mr-2"
  onClick={() => {
    console.log("Contract status:", !!contract);
    if (contract) {
      console.log("Contract address:", contract.address);
      console.log("Available functions:", Object.keys(contract.functions));
      
      // Check if the adminMintCarNFT function exists
      if (typeof contract.adminMintCarNFT === 'function') {
        console.log("adminMintCarNFT function exists");
      } else {
        console.log("adminMintCarNFT function does NOT exist on this contract");
      }
    } else {
      console.log("Contract is null. Checking provider and signer:");
      console.log("Provider:", provider);
      console.log("Signer:", signer);
      console.log("Connected account:", account);
    }
  }}
>
  Debug Contract
</button>
        </div>
      </div>
    </div>
  );
};

export default CarNFTMarketplace;