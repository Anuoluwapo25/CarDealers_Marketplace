import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Car from '../assets/blackcar.jpg';
import Car2 from '../assets/car.png';
import NFT_MARKETPLACE_ABI from '../abi/NFT.json';
import { uploadImageToIPFS, uploadMetadataToIPFS } from '../utils/Ipfs';

const NFT_MARKETPLACE_ADDRESS = "0x91926E1f55B16Bb2171BA9b3649603275934d282";

const CarNFTMarketplace = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [carNFTs, setCarNFTs] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    buyerAddress: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);

  // Featured cars for display
  const featuredCars = [
    {
      id: 1, make: "Bentley", model: "Continental GT", year: 2023,
      image: Car, price: 3.5, owner: "0x1234...5678", forSale: true
    },
    {
      id: 2, make: "Bentley", model: "Continental GT", year: 2023,
      image: Car2, price: 2.5, owner: "0x1234...5678", forSale: true
    }
  ];

  // Connect Wallet function
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const marketplaceContract = new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);
        setContract(marketplaceContract);

        // Optional: Check admin (if contract has isAdmin)
        try {
          const adminStatus = await marketplaceContract.isAdmin(accounts[0]);
          setIsAdmin(adminStatus);
        } catch (err) {
          console.log('Admin check failed or not implemented:', err);
        }

        setStatus('Wallet connected');
      } catch (err) {
        setStatus('Wallet connection failed');
      }
    } else {
      setStatus('Please install MetaMask');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Mint NFT
  const handleMint = async (e) => {
    e.preventDefault();

    if (!contract || !account) {
      setStatus('Please connect wallet first!');
      return;
    }

    if (!image) {
      setStatus('Please select an image for the NFT');
      return;
    }

    try {
      setMintLoading(true);
      setStatus('Uploading image to IPFS...');
      const imageUrl = await uploadImageToIPFS(image);

      setStatus('Uploading metadata to IPFS...');
      const metadata = {
        name: `${formData.make} ${formData.model} (${formData.year})`,
        description: formData.description,
        image: imageUrl,
        attributes: [
          { trait_type: "Make", value: formData.make },
          { trait_type: "Model", value: formData.model },
          { trait_type: "Year", value: formData.year.toString() },
          { trait_type: "Price", value: formData.price.toString() }
        ]
      };

      const metadataUrl = await uploadMetadataToIPFS(metadata);
      const metadataIPFS = metadataUrl.replace('ipfs://', '');

      setStatus('Minting NFT on blockchain...');
      const priceInWei = ethers.utils.parseEther(formData.price.toString());
      const tx = await contract.mintCar(
        formData.buyerAddress,
        metadataIPFS,
        formData.make,
        formData.model,
        formData.year,
        priceInWei,
        { gasLimit: 3000000 }
      );
      await tx.wait();

      setStatus('Mint successful!');
      setMintLoading(false);
    } catch (error) {
      console.error('Minting failed:', error);
      setStatus(`Mint failed: ${error.message}`);
      setMintLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-5">🚗 Car NFT Marketplace</h1>

      <button
        onClick={connectWallet}
        className="bg-purple-700 text-white px-4 py-2 rounded mb-5"
      >
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>
      <p>{status}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Featured Cars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {featuredCars.map(car => (
          <div key={car.id} className="border p-4 rounded shadow">
            <img src={car.image} alt={car.model} className="w-full h-48 object-cover rounded" />
            <h3 className="text-xl font-bold mt-2">{car.make} {car.model}</h3>
            <p>Year: {car.year}</p>
            <p>Price: {car.price} ETH</p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Admin Mint NFT</h2>
          <form onSubmit={handleMint} className="grid gap-4">
            <input type="text" name="buyerAddress" placeholder="Buyer Address" onChange={handleInputChange} required className="border p-2 rounded" />
            <input type="text" name="make" placeholder="Car Make" onChange={handleInputChange} required className="border p-2 rounded" />
            <input type="text" name="model" placeholder="Car Model" onChange={handleInputChange} required className="border p-2 rounded" />
            <input type="number" name="year" placeholder="Year" onChange={handleInputChange} required className="border p-2 rounded" />
            <input type="text" name="price" placeholder="Price (in ETH)" onChange={handleInputChange} required className="border p-2 rounded" />
            <textarea name="description" placeholder="Description" onChange={handleInputChange} className="border p-2 rounded" />
            <input type="file" onChange={handleImageChange} className="border p-2 rounded" />
            <button type="submit" className="bg-green-600 text-white p-2 rounded" disabled={mintLoading}>
              {mintLoading ? "Minting..." : "Mint NFT"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CarNFTMarketplace;
