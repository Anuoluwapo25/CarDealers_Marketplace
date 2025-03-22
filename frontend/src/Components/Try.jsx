import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Car from '../assets/blackcar.jpg';
import Car2 from '../assets/car.png';
import NFT_MARKETPLACE_ABI from '../abi/NFT.json';
import { uploadImageToIPFS, uploadMetadataToIPFS } from '../utils/Ipfs.js';

const NFT_MARKETPLACE_ADDRESS = "0x91926E1f55B16Bb2171BA9b3649603275934d282";

const CarNFTMarketplace = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [carNFTs, setCarNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin mint form state
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [formData, setFormData] = useState({
    buyerAddress: '',
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
  const [uploadProgress, setUploadProgress] = useState('');

  const featuredCars = [
    {
      id: 1,
      make: "Bentley",
      model: "Continental GT",
      year: 2023,
      image: Car,
      price: 3.5, 
      owner: "0x1234...5678",
      forSale: true
    },
    {
      id: 2,
      make: "Bentley",
      model: "Continental GT",
      year: 2023,
      image: Car2, 
      price: 2.5, 
      owner: "0x1234...5678",
      forSale: true
    },
    // Add more featured cars if needed
  ];

  // Benefits of car NFTs
  const benefits = [
    { id: 1, title: "Verifiable ownership", description: "Each car NFT has blockchain-verified proof of ownership and authenticity, eliminating fraud and providing complete transparency of vehicle history." },
    { id: 2, title: "Exclusive collector benefits", description: "NFT car owners get access to exclusive events, private viewings, and special discounts on future releases within our ecosystem." },
    { id: 3, title: "Fractional ownership", description: "Our smart contracts allow for multiple investors to own shares of high-value vehicles, democratizing access to luxury car investments." },
    { id: 4, title: "Seamless transfers & sales", description: "Buy, sell, and transfer ownership instantly without paperwork. Smart contracts handle all the details securely and transparently." },
  ];

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
          
          // Load car NFTs from the contract
          fetchCarNFTs(marketplaceContract);
          
          // Check if the connected account is an admin
          try {
            // This depends on your contract having an isAdmin function
            const adminStatus = await marketplaceContract.isAdmin(accounts[0]);
            setIsAdmin(adminStatus);
          } catch (error) {
            console.log("No isAdmin function or error checking admin status:", error);
            // If no explicit isAdmin function, you can use a hardcoded admin address
            // setIsAdmin(accounts[0].toLowerCase() === "0xYourAdminAddressHere".toLowerCase());
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (newAccounts) => {
            setAccount(newAccounts[0]);
            checkAdminStatus(marketplaceContract, newAccounts[0]);
          });
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }
      } else {
        console.log("Please install MetaMask!");
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
  
  const checkAdminStatus = async (contract, address) => {
    if (!contract || !address) return;
    
    try {
      const adminStatus = await contract.isAdmin(address);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.log("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const fetchCarNFTs = async (marketplaceContract) => {
    if (!marketplaceContract) return;
    
    try {
      setIsLoading(true);
      // This implementation depends on your contract's function to get all NFTs
      // Below is a placeholder implementation - adjust according to your contract
      const totalSupply = await marketplaceContract.totalSupply();
      const nfts = [];
      
      for (let i = 0; i < totalSupply; i++) {
        try {
          const tokenId = await marketplaceContract.tokenByIndex(i);
          const tokenURI = await marketplaceContract.tokenURI(tokenId);
          const owner = await marketplaceContract.ownerOf(tokenId);
          
          // Fetch metadata from token URI
          let metadata = {};
          try {
            // If your tokenURI returns an IPFS URI, convert it to HTTP URL
            const httpUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            const response = await fetch(httpUrl);
            metadata = await response.json();
          } catch (err) {
            console.error("Error fetching metadata for token", tokenId, err);
            metadata = { name: `Car NFT #${tokenId}` };
          }
          
          nfts.push({
            id: tokenId.toString(),
            name: metadata.name || `Car NFT #${tokenId}`,
            description: metadata.description || "",
            image: metadata.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') || "",
            attributes: metadata.attributes || [],
            owner: owner,
            // Add any other properties from your contract or metadata
          });
        } catch (err) {
          console.error("Error processing token", i, err);
        }
      }
      
      setCarNFTs(nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  // Handle form submission for minting
  const handleMintSubmit = async (e) => {
    e.preventDefault();
    setMintLoading(true);
    setMintResult(null);
    setMintError(null);
    setUploadProgress('Preparing to upload...');
    
    if (!contract || !image) {
      setMintError("Contract not initialized or image not selected");
      setMintLoading(false);
      return;
    }
    
    try {
      // 1. Upload image to IPFS via Pinata
      setUploadProgress('Uploading image to IPFS...');
      const imageURI = await uploadImageToIPFS(image);
      
      // 2. Create and upload metadata to IPFS
      setUploadProgress('Uploading metadata to IPFS...');
      const metadata = {
        name: `${formData.make} ${formData.model} (${formData.year})`,
        description: formData.description,
        image: imageURI,
        attributes: [
          { trait_type: "Make", value: formData.make },
          { trait_type: "Model", value: formData.model },
          { trait_type: "Year", value: formData.year.toString() },
          { trait_type: "Price", value: formData.price.toString() }
        ]
      };
      
      const metadataURI = await uploadMetadataToIPFS(metadata);
      
      // 3. Mint NFT using the contract
      setUploadProgress('Minting NFT on blockchain...');
      const metadataURIWithoutPrefix = metadataURI.replace('ipfs://', '');
      
      // Convert price to Wei if your contract expects an ETH amount
      const priceInWei = ethers.utils.parseEther(formData.price.toString());
      
      // Call your contract's minting function - adjust this to match your contract's function
      // This is just an example that assumes your contract has a mintCar function
      const tx = await contract.mintCar(
        formData.buyerAddress,
        metadataURIWithoutPrefix,
        formData.make,
        formData.model,
        formData.year,
        priceInWei,
        { gasLimit: 3000000 }
      );
      
      setUploadProgress('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      // Get the token ID from the event logs (adjust according to your contract events)
      const transferEvent = receipt.events.find(event => event.event === 'Transfer');
      const tokenId = transferEvent.args.tokenId.toString();
      
      setMintResult({
        transactionHash: receipt.transactionHash,
        tokenId: tokenId,
        metadata: metadataURI
      });
      
      // Refresh the NFT list
      fetchCarNFTs(contract);
      
      // Reset form
      setFormData({
        buyerAddress: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        description: ''
      });
      setImage(null);
      
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintError(error.message || "Failed to mint NFT");
    } finally {
      setMintLoading(false);
      setUploadProgress('');
    }
  };

  // Admin form component
  const renderAdminForm = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Admin: Mint New Car NFT</h2>
        <button 
          onClick={() => setShowAdminForm(!showAdminForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          {showAdminForm ? 'Hide Form' : 'Show Mint Form'}
        </button>
        
        {showAdminForm && (
          <form onSubmit={handleMintSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Buyer Address:</label>
              <input
                type="text"
                name="buyerAddress"
                value={formData.buyerAddress}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="0x..."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Make:</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Ferrari"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700">Model:</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="F8 Tributo"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Year:</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="1900"
                  max="2100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700">Price (ETH):</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  min="0"
                  placeholder="1.5"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Describe the car..."
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700">Car Image:</label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                accept="image/*"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded"
              disabled={mintLoading}
            >
              {mintLoading ? 'Processing...' : 'Mint NFT'}
            </button>
            
            {uploadProgress && (
              <div className="mt-2 text-blue-600">{uploadProgress}</div>
            )}
            
            {mintResult && (
              <div className="mt-4 p-4 bg-green-100 rounded">
                <h3 className="font-bold text-green-800">Success!</h3>
                <p>Transaction Hash: {mintResult.transactionHash.substring(0, 10)}...</p>
                <p>Token ID: {mintResult.tokenId}</p>
                <p>Metadata: {mintResult.metadata}</p>
              </div>
            )}
            
            {mintError && (
              <div className="mt-4 p-4 bg-red-100 rounded text-red-800">
                <h3 className="font-bold">Error:</h3>
                <p>{mintError}</p>
              </div>
            )}
          </form>
        )}
      </div>
    );
  };

  // Render the main component UI
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12">Luxury Car NFT Marketplace</h1>
      
      {/* Connect wallet button/status */}
      <div className="text-right mb-6">
        {account ? (
          <div className="inline-block bg-green-100 px-4 py-2 rounded">
            <span className="font-bold">Connected: </span>
            <span>{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span>
          </div>
        ) : (
          <button 
            onClick={async () => {
              try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
              } catch (err) {
                console.error("User denied account access", err);
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
      
      {/* Admin section */}
      {renderAdminForm()}
      
      {/* Featured cars slider */}
      <div className="relative mb-16">
        <h2 className="text-3xl font-bold mb-6">Featured Luxury Cars</h2>
        <div className="flex overflow-x-auto pb-4 space-x-6">
          {featuredCars.map(car => (
            <div key={car.id} className="min-w-[300px] bg-white rounded-lg shadow-lg overflow-hidden">
              <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold">{car.make} {car.model}</h3>
                <p className="text-gray-600">{car.year}</p>
                <p className="text-xl font-bold mt-2">{car.price} ETH</p>
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Car NFT benefits */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Benefits of Car NFTs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(benefit => (
            <div key={benefit.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Marketplace listing */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Marketplace</h2>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl">Loading NFTs...</p>
          </div>
        ) : carNFTs.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-xl">No Car NFTs available at the moment.</p>
            {isAdmin && (
              <button 
                onClick={() => setShowAdminForm(true)}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
              >
                Mint Your First NFT
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carNFTs.map(nft => (
              <div key={nft.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <p>No Image Available</p>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold">{nft.name}</h3>
                  <p className="text-gray-600 mt-1">{nft.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-medium">{nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}</span>
                    </div>
                    {nft.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">{attr.trait_type}:</span>
                        <span className="font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarNFTMarketplace;