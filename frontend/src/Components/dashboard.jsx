import React, { useState } from 'react';
import { 
  ChartLineUp,
  File,
  Wallet,
  Gear,
  DotsThreeVertical 
} from 'phosphor-react';

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-60 bg-white shadow-md">
        <div className="flex flex-col items-center p-4">
          <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold mb-6">
            <span>E</span>
          </div>
          <span className="text-sm font-medium text-purple-800">EduCatalyst</span>
          
          <div className="mt-10 w-full">
            <button className="w-full bg-purple-700 text-white rounded-md py-2 px-4 mb-4 text-sm flex items-center justify-center">
              <ChartLineUp className="mr-2" size={16} />
              <span>Overview</span>
            </button>
            
            <div className="w-full py-2 px-4 flex items-center text-gray-500 mb-3">
              <File size={16} className="mr-2" />
              <span className="text-sm">Request</span>
            </div>
            
            <div className="w-full py-2 px-4 flex items-center text-gray-500 mb-3">
              <Wallet size={16} className="mr-2" />
              <span className="text-sm">Wallet</span>
            </div>
            
            <div className="w-full py-2 px-4 flex items-center text-gray-500">
              <Gear size={16} className="mr-2" />
              <span className="text-sm">Settings</span>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-semibold text-purple-800 mb-6">Dashboard</h1>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-400 p-4">
            <p className="text-sm text-purple-600 mb-2">All Requests</p>
            <p className="text-2xl font-bold">5000</p>
          </div>
          
          <div className="bg-white rounded-lg border border-green-400 p-4">
            <p className="text-sm text-gray-600 mb-2">Completed Requests</p>
            <p className="text-2xl font-bold">3000</p>
          </div>
          
          <div className="bg-white rounded-lg border border-yellow-400 p-4">
            <p className="text-sm text-gray-600 mb-2">Currently Funding</p>
            <p className="text-2xl font-bold">1000</p>
          </div>
          
          <div className="bg-white rounded-lg border border-pink-400 p-4">
            <p className="text-sm text-gray-600 mb-2">Pending Request</p>
            <p className="text-2xl font-bold">1000</p>
          </div>
          
        </div>
        
        {/* Chart Section */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-purple-600 font-small">Requests Charts</h2>
            <select 
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          
          {/* Chart Component */}
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>60,000</span>
              <span>50,000</span>
              <span>40,000</span>
              <span>30,000</span>
              <span>20,000</span>
              <span>10,000</span>
              <span></span>
            </div>
            
            {/* Purple Area Chart (simplified representation) */}
            {/* <div className="ml-12 h-full bg-gradient-to-b from-purple-600 to-purple-500 rounded-md opacity-80"></div> */}
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500 mt-2">
              <span>Jan/2024</span>
              <span>Feb/2024</span>
              <span>Mar/2024</span>
              <span>Apr/2024</span>
              <span>May/2024</span>
              <span>Jun/2024</span>
              <span>Jul/2024</span>
              <span>Aug/2024</span>
              <span>Sep/2024</span>
              <span>Oct/2024</span>
              <span>Nov/2024</span>
              <span>Dec/2024</span>
            </div>
          </div>
        </div>
        
        {/* Table Section */}
        <div className= "rounded-lg p-4">
          <table className="w-full">
            <thead className='bg-purple-100 '>
              <tr className="text-sm text-left text-gray-600">
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Funding Amount</th>
                <th className="py-3 px-4">Minimum Threshold</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t bg-white border-gray-100">
                <td className="py-3 px-4">Tech Innovators cohort</td>
                <td className="py-3 px-4">10 ETH</td>
                <td className="py-3 px-4">7 ETH</td>
                <td className="py-3 px-4">Apr 12, 2025</td>
                <td className="py-3 px-4">Apr 20, 2025</td>
                <td className="py-3 px-4">
                  <span className="text-yellow-600 text-sm bg-yellow-100 py-1 px-2 rounded-md">Pending approval</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="text-gray-500">
                    <DotsThreeVertical size={16} />
                  </button>
                </td>
              </tr>
              <tr className="border-t bg-white border-gray-100">
                <td className="py-3 px-4">Hackathon for Sustainability</td>
                <td className="py-3 px-4">20 ETH</td>
                <td className="py-3 px-4">10 ETH</td>
                <td className="py-3 px-4">May 12, 2025</td>
                <td className="py-3 px-4">May 20, 2025</td>
                <td className="py-3 px-4">
                  <span className="text-purple-600 text-sm bg-purple-100 py-1 px-2 rounded-md">Completely funded</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="text-gray-500">
                    <DotsThreeVertical size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Footer Profile */}
        <div className="fixed bottom-4 left-5 flex items-left bg-white p-2 rounded-lg shadow">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
            E
          </div>
          <div className="mr-2">
            <div className="text-sm font-medium">EduTech Global</div>
            <div className="text-xs text-gray-500">@edutechglobal</div>
          </div>
          <button className="ml-2 text-gray-500">
            <DotsThreeVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;