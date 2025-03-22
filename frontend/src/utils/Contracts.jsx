import { ethers } from 'ethers';

// NFT Contract Operations
export const mintCarNFT = async (contract, make, model, year, imageUrl) => {
  if (!contract) throw new Error("Contract not initialized");
  
  try {
    const tx = await contract.mintCarNFT(make, model, year, imageUrl);
    return await tx.wait();
  } catch (error) {
    console.error("Error minting car NFT:", error);
    throw error;
  }
};

export const adminMintCarNFT = async (contract, make, model, year, price, metadataUrl) => {
  if (!contract) throw new Error("Contract not initialized");
  
  try {
    // Updated function to not require buyer address for initial minting
    // This assumes your contract has a function that allows admin minting without specifying buyer
    const priceInWei = ethers.utils.parseEther(price.toString());
    
    const tx = await contract.adminMintCarNFT(
      make,
      model,
      year,
      priceInWei,
      metadataUrl
    );
    
    return await tx.wait();
  } catch (error) {
    console.error("Error in admin minting:", error);
    throw error;
  }
};

export const listCarForSale = async (contract, tokenId, price) => {
  if (!contract) throw new Error("Contract not initialized");
  
  try {
    const priceInWei = ethers.utils.parseEther(price.toString());
    const tx = await contract.listCarForSale(tokenId, priceInWei);
    return await tx.wait();
  } catch (error) {
    console.error("Error listing car NFT for sale:", error);
    throw error;
  }
};

export const buyCarNFT = async (contract, tokenId, price) => {
  if (!contract) throw new Error("Contract not initialized");
  
  try {
    const priceInWei = ethers.utils.parseEther(price.toString());
    const tx = await contract.buyCarNFT(tokenId, { value: priceInWei });
    return await tx.wait();
  } catch (error) {
    console.error("Error buying car NFT:", error);
    throw error;
  }
};

// Function to extract token ID from event logs
export const getTokenIdFromLogs = (contract, logs) => {
  if (!contract || !logs) return "Unknown";
  
  for (const log of logs) {
    try {
      const parsedLog = contract.interface.parseLog(log);
      // Adjust the event name based on your contract
      if (parsedLog.name === 'CarNFTMinted' || parsedLog.name === 'Transfer') {
        return parsedLog.args.tokenId || parsedLog.args._tokenId || "Unknown";
      }
    } catch (e) {
      // Skip logs that can't be parsed
    }
  }
  return "Unknown";
};