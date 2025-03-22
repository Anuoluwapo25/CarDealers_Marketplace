import React from 'react';

const CarNFTCard = ({ car, buyCarNFT, formatAddress }) => {
  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
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
  );
};

export default CarNFTCard;