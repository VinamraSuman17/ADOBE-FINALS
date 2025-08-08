import React from 'react'

const FeaturesSection = () => {
  const features = [
    {
      category: "AI-Powered Analysis",
      items: [
        "Advanced document structure recognition",
        "Intelligent heading classification", 
        "Professional content summarization",
        "Contextual keyword extraction",
        "Semantic content analysis"
      ]
    },
    {
      category: "Document Processing",
      items: [
        "PDF structure parsing",
        "Font and formatting analysis",
        "Multi-page document handling",
        "Content hierarchy detection",
        "Metadata extraction"
      ]
    },
    {
      category: "Professional Features",
      items: [
        "Secure file processing",
        "Multiple output formats",
        "Batch processing capability",
        "API integration ready",
        "Enterprise compatibility"
      ]
    }
  ]

  return (
    <section id="features" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Platform <span className="text-red">Capabilities</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive features designed for professional document analysis and processing requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-semibold text-white border-b border-red-600 pb-2">{feature.category}</h3>
              <ul className="space-y-3">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start text-gray-300">
                    <span className="text-red-600 mr-3 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded p-8 border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Technical Specifications
              </h3>
              <p className="text-gray-300 mb-6">
                Built with modern architecture for optimal performance and reliability. 
                Designed to handle professional workloads with consistent processing times and accurate results.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
                  <div className="text-2xl font-bold text-white">CPU</div>
                  <div className="text-sm text-gray-400">Processing</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
                  <div className="text-2xl font-bold text-white">Secure</div>
                  <div className="text-sm text-gray-400">Operations</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl text-gray-700 mb-4">⚙️</div>
              <p className="text-gray-400">Professional Grade System</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
