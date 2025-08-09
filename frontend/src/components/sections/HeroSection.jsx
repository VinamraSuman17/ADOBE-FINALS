import React from 'react'
import Button from '../ui/Button'

const HeroSection = () => {
  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <section id="home" className="min-h-screen pt-24 pb-10 flex items-center justify-center px-4 bg-black">
      <div className="max-w-6xl mx-auto text-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="text-white">Intelligent PDF</span>
            <br />
            <span className="text-red">Document Analysis</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Advanced artificial intelligence technology for comprehensive document analysis and content extraction. 
            Professional-grade insights tailored to your specific requirements and use cases.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button variant="primary" size="lg" onClick={scrollToUpload}>
              <span>Begin Analysis</span>
            </Button>
            
            <Button variant="secondary" size="lg" onClick={scrollToAbout}>
              <span>Learn More</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16 border-t border-gray-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Enterprise</div>
              <div className="text-sm text-gray-400">Grade Security</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">AI</div>
              <div className="text-sm text-gray-400">Powered Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Multi</div>
              <div className="text-sm text-gray-400">Persona Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
