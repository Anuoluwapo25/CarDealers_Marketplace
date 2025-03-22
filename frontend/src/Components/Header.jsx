import React from 'react';

const Header = ({ 
  account, 
  isAdmin, 
  connectWallet, 
  formatAddress, 
  toggleAdminForTesting, 
  showAdminForm,
  setShowAdminForm
}) => {
  return (
    <>
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
    </>
  );
};

export default Header;