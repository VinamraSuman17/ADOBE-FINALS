// import React from 'react'

// const HighlightedSections = ({ highlightedSections, persona }) => {
//   if (!highlightedSections || highlightedSections.length === 0) {
//     return null
//   }

//   return (
//     <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
//       <h3 className="text-xl font-semibold text-white mb-4 border-b border-yellow-600 pb-2">
//         🎯 Highlighted Relevant Sections
//       </h3>
      
//       <div className="text-sm text-gray-400 mb-4">
//         Found {highlightedSections.length} sections with {'>'}80% relevance for {persona}
//       </div>

//       <div className="space-y-4">
//         {highlightedSections.map((item, index) => (
//           <div key={index} className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
//             {/* Section Header */}
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center space-x-2">
//                 <span className="text-yellow-400 text-lg">📍</span>
//                 <span className="text-white font-medium">
//                   {item.section.text}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <span className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
//                   Page {item.section.page}
//                 </span>
//                 <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
//                   {Math.round(item.relevance_score * 100)}% Match
//                 </span>
//               </div>
//             </div>

//             {/* Snippet Explanation */}
//             <div className="bg-gray-700 rounded p-3 mb-3">
//               <h4 className="text-yellow-300 text-sm font-medium mb-2">
//                 📝 Relevance Explanation:
//               </h4>
//               <p className="text-gray-300 text-sm leading-relaxed">
//                 {item.snippet}
//               </p>
//             </div>

//             {/* Highlight Reason */}
//             <div className="text-xs text-gray-400">
//               <span className="text-yellow-400">💡 Why highlighted:</span> {item.highlight_reason}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default HighlightedSections




import React from 'react'
import { Target, MapPin, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react'

const HighlightedSections = ({ highlightedSections, persona }) => {
  if (!highlightedSections || highlightedSections.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="text-red-600" size={20} />
          <h3 className="text-xl font-semibold text-white">Highlighted Relevant Sections</h3>
        </div>
        <div className="text-center py-8">
          <Target className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">Analyzing document sections for {persona} relevance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-4 border-b border-yellow-600 pb-2">
        <Target className="text-red-600" size={20} />
        <h3 className="text-xl font-semibold text-white">Highlighted Relevant Sections</h3>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="text-green-400" size={16} />
        <div className="text-sm text-gray-400">
          Found {highlightedSections.length} sections with {">"} 80% relevance for <span className="text-white font-medium">{persona}</span>
        </div>
      </div>

      <div className="space-y-4">
        {highlightedSections.map((item, index) => (
          <div key={index} className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30 hover:bg-yellow-900/30 transition-all">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="text-yellow-400" size={16} />
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

            {/* 1-2 Sentence Snippet */}
            <div className="bg-gray-700 rounded p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="text-yellow-300" size={14} />
                <h4 className="text-yellow-300 text-sm font-medium">Relevance Snippet:</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {item.snippet}
              </p>
            </div>

            {/* Why Highlighted */}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <TrendingUp className="text-yellow-400" size={12} />
              <span className="text-yellow-400">Why highlighted:</span> 
              <span>{item.highlight_reason}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-3 bg-gray-700 rounded border border-gray-600">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="text-blue-400" size={16} />
          <h4 className="text-white font-medium">Analysis Summary</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Sections Analyzed:</span>
            <span className="text-white">{highlightedSections.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Average Relevance:</span>
            <span className="text-green-300">
              {highlightedSections.length > 0 
                ? Math.round(highlightedSections.reduce((sum, item) => sum + item.relevance_score, 0) / highlightedSections.length * 100)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HighlightedSections

