import React from 'react';
import CarNFTCard from './CarNftCard';

const NFTCollection = ({ isLoading, carNFTs, buyCarNFT, formatAddress }) => {
  return (
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
              <CarNFTCard 
                key={car.id} 
                car={car} 
                buyCarNFT={buyCarNFT} 
                formatAddress={formatAddress} 
              />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-md font-medium">
            VIEW ALL NFTs
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTCollection;