import React, { useState, useEffect } from 'react'

const Navbar = ({ currentSection }) => {

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'features', label: 'Features' },
    { id: 'upload', label: 'Upload' }
  ]

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-black/95`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img src="https://res.cloudinary.com/dw3dcoqow/image/upload/v1755382288/Airbrush-Image-Enhancer-1755382165199-removebg-preview_u75uup.png" alt="" width={58}/>
            <span className="text-2xl font-bold text-white">PDF</span>
          </div>
          {/* <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-white">PDF</span>
            <span className="text-lg font-medium text-red">AI Assistant</span>
          </div> */}

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium ${
                  currentSection === item.id 
                    ? 'text-red' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => scrollToSection('upload')}
              className="bg-red text-white px-6 py-2 rounded font-medium hover:bg-red-700"
            >
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
