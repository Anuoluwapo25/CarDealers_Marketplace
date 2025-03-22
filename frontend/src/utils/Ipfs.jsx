// src/services/pinataService.js

import axios from 'axios';
import FormData from 'form-data';

// Your Pinata API keys
const PINATA_API_KEY = "YOUR_PINATA_API_KEY";
const PINATA_SECRET_KEY = "YOUR_PINATA_SECRET_KEY";

// Function to upload image to IPFS via Pinata
export const uploadImageToIPFS = async (imageFile) => {
  if (!imageFile) {
    throw new Error('No image file provided');
  }
  
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
      }
    );
    
    // Return the IPFS hash/CID
    return `ipfs://${response.data.IpfsHash}`;
    
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
};

// Function to upload metadata to IPFS via Pinata
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
      }
    );
    
    // Return the IPFS hash/CID
    return `ipfs://${response.data.IpfsHash}`;
    
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw error;
  }
};