import React from 'react'

const AboutSection = () => {
  const capabilities = [
    {
      title: "Document Structure Analysis",
      description: "Comprehensive extraction and analysis of document hierarchy, headings, and organizational structure."
    },
    {
      title: "Persona-Based Processing",
      description: "Tailored analysis and insights based on user role and specific professional requirements."
    },
    {
      title: "Content Intelligence",
      description: "Advanced natural language processing for content summarization and key information extraction."
    },
    {
      title: "Professional Integration",
      description: "Enterprise-ready solution designed for professional workflows and business environments."
    }
  ]

  return (
    <section id="about" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Professional Document <span className="text-red">Analysis Platform</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A comprehensive artificial intelligence solution designed for professional document processing and analysis. 
            Our platform provides detailed insights and structured data extraction for various business applications.
          </p>
        </div>

        <div className="space-y-8">
          {capabilities.map((capability, index) => (
            <div key={index} className="border-l-4 border-red-600 pl-6 py-4">
              <h3 className="text-xl font-semibold text-white mb-3">{capability.title}</h3>
              <p className="text-gray-300 leading-relaxed">{capability.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gray-800 rounded p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">
              Enterprise Solution
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Built for professional environments requiring reliable, accurate, and secure document processing capabilities. 
              Our solution integrates seamlessly with existing business workflows and provides consistent results.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
