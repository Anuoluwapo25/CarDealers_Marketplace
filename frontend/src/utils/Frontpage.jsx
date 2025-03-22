import React, { useState } from 'react';
import Car from '../assets/blackcar.jpg';

const CarDealershipWebsite = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      image: {Car},
      title: "CHOOSE YOUR STYLISH",
      subtitle: "CAR AND GET DISCOUNT",
      description: "Vis vero nihil variations aliquet passages invincible there and therein praiso experts nestuante condecturs vapidutas vachairt doluminerta verliom dolominertis dolcious prasentium volusera exsitalie duing voliations aluest passages involtable there egros decorateret slum."
    },
    // Add more slides here if needed
  ];

  const services = [
    { id: 1, title: "Deals for every budget", description: "Lorem ipsum niram mullet non deluent doloros minim volitipate mollit reprehenderit velit. Praesion cupidisunt conqueata ullamcos expetsi." },
    { id: 2, title: "Best price guaranteed", description: "Lorem ipsum niram mullet non deluent doloros minim volitipate mollit reprehenderit velit. Praesion cupidisunt conqueata ullamcos expetsi." },
    { id: 3, title: "Fully electric driving", description: "Lorem ipsum niram mullet non deluent doloros minim volitipate mollit reprehenderit velit. Praesion cupidisunt conqueata ullamcos expetsi." },
    { id: 4, title: "Best experienced team", description: "Lorem ipsum niram mullet non deluent doloros minim volitipate mollit reprehenderit velit. Praesion cupidisunt conqueata ullamcos expetsi." },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-black border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">+</span>
            </div>
            <span className="ml-2 text-gray-800 font-bold uppercase">REDFELLA</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-orange-500 font-medium border-b-2 border-orange-500 pb-1">FEATURES</a>
            <a href="#" className="text-white font-medium">COLLECTION</a>
            <a href="#" className="text-white font-medium">TESTIMONIAL</a>
            <a href="#" className="text-white font-medium">PRICING</a>
            <a href="#" className="text-white font-medium">CONTACT US</a>
          </div>
          
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium">
            Connect Wallet
          </button>
        </div>
      </nav>
      
      {/* Hero Section / Slider */}
      <div className="relative bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg overflow-hidden">
            {/* Car Image */}
            <img
              src={Car}
              alt="Orange luxury car"
              className="w-full h-full object-cover"
            />
            
            {/* Slider Content */}
            <div className="absolute bottom-0 left-0 right-0 bg-white p-6 md:p-8 md:flex md:justify-between md:items-center">
              <div className="mb-4 md:mb-0 md:w-1/2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">CHOOSE YOUR STYLISH</h2>
                <h3 className="text-xl md:text-2xl font-bold text-orange-500">CAR AND GET DISCOUNT</h3>
              </div>
              
              <div className="md:w-1/2">
                <p className="text-sm text-gray-600">
                  Vis vero nihil variations aliquet passages invincible there and therein praiso experts nestuante condecturs vapidutas vachairt doluminerta verliom dolominertis dolcious prasentium volusera exsitalie duing voliations aluest passages involtable there egros decorateret slum.
                </p>
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
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide ? "bg-black" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            
            {/* Smart Deal Button */}
            <button className="absolute top-8 right-8 bg-white text-gray-800 rounded-full px-4 py-1 text-sm font-medium flex items-center">
              <span className="w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
              SMART DEAL
            </button>
          </div>
        </div>
      </div>
      
      {/* Social Media Bar */}
      <div className="bg-gray-800 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex justify-between">
            {['Cytocurrency', 'Ethereum', 'Bitcoin', 'Ethereum', 'Bitcoin', 'Cytocurrency', 'Mint', 'Behance'].map((platform, index) => (
              <a key={index} href="#" className="text-sm opacity-70 hover:opacity-100">{platform}</a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="bg-orange-500 p-8 rounded-lg">
                <h3 className="text-white text-3xl font-bold tracking-wider">E.V.</h3>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4">WE HAVE CREATIVE SERVICES FOR YOU</h2>
              <p className="text-gray-600 mb-4">We are many variations aliquet passages involtable there and therein praiso experts nestuante aluim dolcerecte copidutata vachairt doluminerta dolceresited dolorea passages involtable there varitatib.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-gray-900 text-white p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {service.id}
                  </div>
                  <h3 className="text-xl font-medium">{service.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDealershipWebsite;