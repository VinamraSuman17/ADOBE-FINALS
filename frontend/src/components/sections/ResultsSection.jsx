import React, { useState } from 'react'
import InsightsBulb from '../ui/InsightsBulb'
import PodcastMode from '../ui/PodcastMode'
import HighlightedSections from '../ui/HighlightedSections'

const ResultsSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!data || !data.success) {
    return null
  }

  const { outline, analysis, connections, highlighted_sections, individual_results, comparison, ranking } = data

  // ✅ Determine if it's single or multiple file analysis
  const isMultipleFiles = data.total_files && data.total_files > 1

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'highlights', label: 'Highlighted Sections', icon: '🎯' },
    { id: 'insights', label: 'AI Insights', icon: '💡' },
    { id: 'connections', label: 'Connect the Dots', icon: '🔗' },
    { id: 'podcast', label: 'Podcast Mode', icon: '🎧' },
    ...(isMultipleFiles ? [
      { id: 'comparison', label: 'Comparison', icon: '📈' },
      { id: 'ranking', label: 'Document Ranking', icon: '🏆' }
    ] : [])
  ]

  return (
    <section id="results" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Analysis <span className="text-red-600">Results</span>
          </h2>
          <p className="text-xl text-gray-300">
            {isMultipleFiles 
              ? `Comparative analysis of ${data.total_files} documents`
              : 'Your PDF analysis results powered by AI'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 mx-2 mb-4 rounded-t-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white border-b-2 border-red-600'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Outline */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-red-600 pb-2">
                  📋 Document Structure
                </h3>
                <div className="bg-gray-800 rounded p-4 max-h-80 overflow-y-auto border border-gray-700">
                  {isMultipleFiles ? (
                    // Multiple files overview
                    <div className="space-y-4">
                      <h4 className="font-medium text-white mb-4">
                        📚 {data.total_files} Documents Analyzed
                      </h4>
                      {individual_results && individual_results.slice(0, 3).map((result, index) => (
                        <div key={index} className="bg-gray-700 rounded p-3 border border-gray-600">
                          <div className="font-medium text-white text-sm mb-1">
                            📄 {result.filename}
                          </div>
                          <div className="text-xs text-gray-400">
                            {result.outline?.outline?.length || 0} sections • 
                            Page count: {result.analysis?.document_info?.page_count || 'N/A'}
                          </div>
                        </div>
                      ))}
                      {data.total_files > 3 && (
                        <div className="text-center text-gray-400 text-sm">
                          + {data.total_files - 3} more documents
                        </div>
                      )}
                    </div>
                  ) : (
                    // Single file outline
                    <div>
                      <h4 className="font-medium text-white mb-4">
                        {outline?.title || 'Document Analysis'}
                      </h4>
                      {outline?.outline && outline.outline.length > 0 ? (
                        <ul className="space-y-3">
                          {outline.outline.map((item, index) => (
                            <li key={index} className={`flex items-start space-x-3 ${
                              item.level === 'H1' ? 'ml-0' : 
                              item.level === 'H2' ? 'ml-4' : 'ml-8'
                            }`}>
                              <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                                item.level === 'H1' ? 'bg-red-600' :
                                item.level === 'H2' ? 'bg-red-400' : 'bg-red-300'
                              }`}></span>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-200 block">
                                  {item.text}
                                </span>
                                <span className="text-xs text-gray-500">Page {item.page}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No structured headings detected</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-red-600 pb-2">
                  🤖 AI Analysis
                </h3>
                <div className="space-y-4">
                  {/* Persona Info */}
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <h4 className="font-medium text-white mb-2">
                      👤 Persona: {analysis?.metadata?.persona || comparison?.persona || 'Unknown'}
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {isMultipleFiles 
                        ? comparison?.overview || 'Multi-document comparative analysis completed'
                        : analysis?.summary || 'Analysis in progress...'
                      }
                    </p>
                  </div>

                  {/* Keywords */}
                  {((analysis?.document_info?.keywords) || (comparison?.common_themes)) && (
                    <div className="bg-gray-800 rounded p-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">
                        🏷️ {isMultipleFiles ? 'Common Themes' : 'Key Terms'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(isMultipleFiles ? comparison.common_themes : analysis.document_info.keywords)
                          ?.slice(0, 8)
                          .map((keyword, index) => (
                          <span key={index} className="px-3 py-1 bg-red-600/20 text-red-300 rounded text-sm border border-red-600/30">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Insights */}
                  {analysis?.insights?.insights && (
                    <div className="bg-gray-800 rounded p-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">💡 Key Insights</h4>
                      <ul className="space-y-2">
                        {analysis.insights.insights.slice(0, 3).map((insight, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Relevance Score */}
                  {(analysis?.metadata?.relevance_score || comparison?.persona_relevance_comparison) && (
                    <div className="bg-gray-800 rounded p-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">📊 Relevance Analysis</h4>
                      {isMultipleFiles ? (
                        <div className="space-y-2">
                          {comparison.persona_relevance_comparison?.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">{item.filename}</span>
                              <span className="text-sm text-green-300">
                                {Math.round(item.score * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(analysis.metadata.relevance_score * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-green-300">
                            {Math.round(analysis.metadata.relevance_score * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Highlighted Sections Tab */}
          {activeTab === 'highlights' && (
            <HighlightedSections 
              highlightedSections={highlighted_sections || []}
              persona={analysis?.metadata?.persona || comparison?.persona}
            />
          )}

          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <InsightsBulb 
              analysis={analysis} 
              outline={outline}
              isMultipleFiles={isMultipleFiles}
              comparison={comparison}
            />
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">
                🔗 Connect the Dots Analysis
              </h3>
              {connections && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <h4 className="font-medium text-white mb-3">🎯 Section-Keyword Connections</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {connections.section_keyword_matches?.length > 0 ? (
                        connections.section_keyword_matches.map((match, index) => (
                          <div key={index} className="bg-gray-700 rounded p-3">
                            <div className="font-medium text-sm text-white">{match.section}</div>
                            <div className="text-xs text-gray-400">Page {match.page}</div>
                            <div className="mt-1">
                              {match.keywords.map((keyword, kidx) => (
                                <span key={kidx} className="inline-block px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs mr-1 mt-1">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No connections found</p>
                      )}
                    </div>
                  </div>

                  {/* Cross-document connections for multiple files */}
                  {isMultipleFiles && comparison?.common_themes && (
                    <div className="bg-gray-800 rounded p-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">🌐 Cross-Document Themes</h4>
                      <div className="space-y-2">
                        {comparison.common_themes.slice(0, 5).map((theme, index) => (
                          <div key={index} className="bg-blue-900/20 rounded p-2 border border-blue-600/30">
                            <span className="text-blue-300 text-sm">{theme}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Podcast Mode Tab */}
          {activeTab === 'podcast' && (
            <PodcastMode 
              analysis={analysis} 
              outline={outline}
              isMultipleFiles={isMultipleFiles}
              comparison={comparison}
            />
          )}

          {/* Comparison Tab (Multiple Files Only) */}
          {activeTab === 'comparison' && isMultipleFiles && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">
                📈 Document Comparison Analysis
              </h3>
              
              {comparison && (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <h4 className="font-medium text-white mb-3">📋 Analysis Overview</h4>
                    <p className="text-gray-300 text-sm">{comparison.overview}</p>
                  </div>

                  {/* Content Distribution */}
                  {comparison.content_distribution && (
                    <div className="bg-gray-800 rounded p-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">📊 Content Distribution</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {comparison.content_distribution.map((item, index) => (
                          <div key={index} className="bg-gray-700 rounded p-3">
                            <div className="text-white text-sm font-medium">{item.filename}</div>
                            <div className="text-gray-400 text-xs">{item.pages} pages</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Themes */}
                  {comparison.common_themes && (
                    <div className="bg-gray-800 rounded p-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">🎯 Common Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {comparison.common_themes.map((theme, index) => (
                          <span key={index} className="px-3 py-1 bg-green-600/20 text-green-300 rounded text-sm border border-green-600/30">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ranking Tab (Multiple Files Only) */}
          {activeTab === 'ranking' && isMultipleFiles && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">
                🏆 Document Ranking Analysis
              </h3>
              
              {ranking && (
                <div className="space-y-4">
                  {ranking.map((item, index) => (
                    <div key={index} className="bg-gray-800 rounded p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`text-2xl ${
                            item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '📄'
                          }`}>
                            {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '📄'}
                          </span>
                          <div>
                            <h4 className="text-white font-medium">#{item.rank} - {item.filename}</h4>
                            <p className="text-gray-400 text-sm">Final Score: {Math.round(item.final_score * 100)}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        {Object.entries(item.score_breakdown).map(([key, value]) => (
                          <div key={key} className="bg-gray-700 rounded p-2">
                            <div className="text-xs text-gray-400 capitalize">
                              {key.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-white">
                              {Math.round(value * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Key Strengths */}
                      {item.key_strengths && item.key_strengths.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.key_strengths.map((strength, sidx) => (
                            <span key={sidx} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                              ✓ {strength}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ResultsSection
