import React from 'react'

const HighlightedSections = ({ highlightedSections, persona }) => {
  if (!highlightedSections || highlightedSections.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4 border-b border-yellow-600 pb-2">
        🎯 Highlighted Relevant Sections
      </h3>
      
      <div className="text-sm text-gray-400 mb-4">
        Found {highlightedSections.length} sections with {'>'}80% relevance for {persona}
      </div>

      <div className="space-y-4">
        {highlightedSections.map((item, index) => (
          <div key={index} className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 text-lg">📍</span>
                <span className="text-white font-medium">
                  {item.section.text}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                  Page {item.section.page}
                </span>
                <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                  {Math.round(item.relevance_score * 100)}% Match
                </span>
              </div>
            </div>

            {/* Snippet Explanation */}
            <div className="bg-gray-700 rounded p-3 mb-3">
              <h4 className="text-yellow-300 text-sm font-medium mb-2">
                📝 Relevance Explanation:
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {item.snippet}
              </p>
            </div>

            {/* Highlight Reason */}
            <div className="text-xs text-gray-400">
              <span className="text-yellow-400">💡 Why highlighted:</span> {item.highlight_reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HighlightedSections
