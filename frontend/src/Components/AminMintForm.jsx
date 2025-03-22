import React, { useState } from 'react';
import { ethers } from 'ethers'; // Import ethers directly here
import { uploadImageToIPFS, uploadMetadataToIPFS } from '../utils/Ipfs';
import { adminMintCarNFT, getTokenIdFromLogs, listCarForSale } from '../utils/contracts';


const AdminMintForm = ({ isAdmin, contract }) => {
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

  const handleAdminMintSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setMintError("Only admin can mint NFTs");
      return;
    }
    
    setMintLoading(true);
    setMintError(null);
    setMintResult(null);

    try {
      // Validate image
      if (!image) {
        throw new Error('Please select an image file');
      }

      // 1. Upload the image to IPFS
      const imageUrl = await uploadImageToIPFS(image);
      
      // 2. Create metadata and upload to IPFS
      const metadata = {
        name: `${formData.make} ${formData.model} (${formData.year})`,
        description: formData.description,
        image: imageUrl,
        attributes: [
          { trait_type: "Make", value: formData.make },
          { trait_type: "Model", value: formData.model },
          { trait_type: "Year", value: parseInt(formData.year) }
        ]
      };
      
      const metadataUrl = await uploadMetadataToIPFS(metadata);
      
      // 3. Mint the NFT using the contract - removed buyer address requirement
      const receipt = await adminMintCarNFT(
        contract,
        formData.make,
        formData.model,
        parseInt(formData.year),
        formData.price,
        metadataUrl
      );
      
      // 4. Get the token ID from the event logs
      const tokenId = getTokenIdFromLogs(contract, receipt.logs);
      
      setMintResult({
        tokenId: tokenId,
        txHash: receipt.transactionHash,
        metadataURI: metadataUrl
      });
      
      // 5. Reset form after successful mint
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        description: ''
      });
      setImage(null);
    } catch (err) {
      setMintError(err.message);
    } finally {
      setMintLoading(false);
    }
  };

  const handleListForSale = async (tokenId) => {
    try {
      await listCarForSale(contract, tokenId, formData.price);
      alert("NFT listed for sale successfully!");
    } catch (error) {
      console.error("Error listing NFT for sale:", error);
      alert("Failed to list NFT for sale: " + error.message);
    }
  };

  return (
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
                onClick={() => handleListForSale(mintResult.tokenId)}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                List For Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMintForm;