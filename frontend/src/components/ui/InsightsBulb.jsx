import React, { useState, useEffect } from 'react'

const InsightsBulb = ({ analysis, outline }) => {
  const [activeInsight, setActiveInsight] = useState(null)
  const [insights, setInsights] = useState([])

  useEffect(() => {
    if (analysis && outline) {
      generateGeminiInsights()
    }
  }, [analysis, outline])

  const generateGeminiInsights = () => {
    const insightData = [
      {
        id: 'key-insights',
        type: 'Gemini Key Insights',
        icon: '💡',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400/30',
        content: analysis?.insights?.insights || ['Generating Gemini insights...']
      },
      {
        id: 'facts',
        type: 'Gemini Discovery',
        icon: '🔍',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10', 
        borderColor: 'border-blue-400/30',
        content: analysis?.insights?.fact || 'Gemini is analyzing interesting facts...'
      },
      {
        id: 'contradictions',
        type: 'Critical Analysis',
        icon: '⚠️',
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        borderColor: 'border-orange-400/30',
        content: analysis?.insights?.contradiction || 'No contradictions found by Gemini'
      },
      {
        id: 'connections',
        type: 'Connected Sections',
        icon: '🔗',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        borderColor: 'border-green-400/30',
        content: generateGeminiConnections()
      },
      {
        id: 'inspiration',
        type: 'Gemini Inspiration',
        icon: '✨',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
        borderColor: 'border-purple-400/30',
        content: analysis?.insights?.inspiration || 'Gemini is finding inspirational connections...'
      }
    ]
    setInsights(insightData)
  }

  const generateGeminiConnections = () => {
    if (!outline?.outline || !analysis?.document_info?.keywords) {
      return 'Gemini found no section-keyword connections'
    }

    const connections = []
    outline.outline.forEach(heading => {
      const matchingKeywords = analysis.document_info.keywords.filter(keyword => 
        heading.text.toLowerCase().includes(keyword.toLowerCase())
      )
      if (matchingKeywords.length > 0) {
        connections.push(`${heading.text} (Page ${heading.page}) → Keywords: ${matchingKeywords.join(', ')}`)
      }
    })

    return connections.length > 0 ? connections : ['Gemini analysis: No direct section-keyword connections found']
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <span className="text-2xl mr-3">🧠</span>
        Gemini AI Insights Hub
        <span className="ml-auto text-sm text-red-400">
          {analysis?.metadata?.ai_model || 'Gemini 2.5 Flash'}
        </span>
      </h3>

      {/* Gemini Insights Bulbs */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {insights.map((insight) => (
          <button
            key={insight.id}
            onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105
              ${activeInsight === insight.id ? 
                `${insight.bgColor} ${insight.borderColor}` : 
                'bg-gray-700 border-gray-600 hover:border-gray-500'
              }
            `}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{insight.icon}</div>
              <div className={`text-xs font-medium ${
                activeInsight === insight.id ? insight.color : 'text-gray-300'
              }`}>
                {insight.type}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Gemini Insight Display */}
      {activeInsight && (
        <div className="space-y-4">
          {insights.filter(i => i.id === activeInsight).map(insight => (
            <div key={insight.id} className={`${insight.bgColor} rounded-lg p-4 border ${insight.borderColor}`}>
              <h4 className={`font-semibold mb-3 flex items-center ${insight.color}`}>
                <span className="text-xl mr-2">{insight.icon}</span>
                {insight.type}
                <span className="ml-auto text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                  Gemini AI
                </span>
              </h4>
              
              <div className="text-gray-200">
                {Array.isArray(insight.content) ? (
                  <ul className="space-y-2">
                    {insight.content.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`${insight.color} mr-2`}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{insight.content}</p>
                )}
              </div>
              
              {/* Gemini AI Attribution */}
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-xs text-gray-400 flex items-center">
                  <span className="mr-1">🤖</span>
                  Generated by Google Gemini AI • Model: {analysis?.metadata?.ai_model || 'gemini-2.5-flash'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!activeInsight && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>Click on any Gemini insight bulb above to explore</p>
          <p className="text-xs mt-2 text-gray-500">
            Powered by Google Gemini AI • {analysis?.metadata?.ai_model || 'gemini-2.5-flash'}
          </p>
        </div>
      )}
    </div>
  )
}

export default InsightsBulb
