import React, { useState } from 'react';

const FeaturedCarSlider = ({ featuredCars, buyCarNFT }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredCars.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredCars.length) % featuredCars.length);
  };

  return (
    <div className="relative bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="relative h-64 md:h-80 lg:h-96 bg-gray-800 rounded-lg overflow-hidden">
          {/* Car Image */}
          <img
            src={featuredCars[currentSlide]?.image}
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
    )};


export default FeaturedCarSlider;