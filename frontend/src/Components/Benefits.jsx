import React from 'react';

const BenefitsSection = () => {
  const benefits = [
    { id: 1, title: "Verifiable ownership", description: "Each car NFT has blockchain-verified proof of ownership and authenticity, eliminating fraud and providing complete transparency of vehicle history." },
    { id: 2, title: "Exclusive collector benefits", description: "NFT car owners get access to exclusive events, private viewings, and special discounts on future releases within our ecosystem." },
    { id: 3, title: "Fractional ownership", description: "Our smart contracts allow for multiple investors to own shares of high-value vehicles, democratizing access to luxury car investments." },
    { id: 4, title: "Seamless transfers & sales", description: "Buy, sell, and transfer ownership instantly without paperwork. Smart contracts handle all the details securely and transparently." },
  ];

  return (
    <div className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="md:w-1/4 mb-6 md:mb-0">
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
  );
};

export default BenefitsSection;