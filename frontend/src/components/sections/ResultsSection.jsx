import React, { useState } from 'react'
import InsightsBulb from '../ui/InsightsBulb'
import PodcastMode from '../ui/PodcastMode'

const ResultsSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!data || !data.success) {
    return null
  }

  const { outline, analysis, connections, enhanced_insights } = data

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'insights', label: 'AI Insights', icon: '💡' },
    { id: 'connections', label: 'Connect the Dots', icon: '🔗' },
    { id: 'podcast', label: 'Podcast Mode', icon: '🎧' }
  ]

  return (
    <section id="results" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Analysis <span className="text-red">Results</span>
          </h2>
          <p className="text-xl text-gray-300">
            Comprehensive AI-powered document analysis with advanced insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 mx-2 mb-4 rounded-t-lg font-medium transition-colors ${
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
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Outline */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-red-600 pb-2">
                  Document Structure
                </h3>
                <div className="bg-gray-800 rounded p-4 max-h-80 overflow-y-auto border border-gray-700">
                  <h4 className="font-medium text-white mb-4">{outline?.title || 'Document Analysis'}</h4>
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
                            <span className="text-sm font-medium text-gray-200 block">{item.text}</span>
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
              </div>

              {/* Analysis Results */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-red-600 pb-2">
                  Professional Analysis
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <h4 className="font-medium text-white mb-2">Persona: {analysis?.metadata?.persona || 'Unknown'}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {analysis?.summary || 'Analysis in progress...'}
                    </p>
                  </div>

                  {analysis?.document_info?.keywords && (
                    <div className="bg-gray-800 rounded p-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">Key Terms</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.document_info.keywords.map((keyword, index) => (
                          <span key={index} className="px-3 py-1 bg-red-600/20 text-red-300 rounded text-sm border border-red-600/30">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <InsightsBulb analysis={analysis} outline={outline} />
          )}

          {activeTab === 'connections' && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">🔗</span>
                Connect the Dots Analysis
              </h3>

              {connections && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Section-Keyword Matches */}
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <h4 className="font-medium text-white mb-3 flex items-center">
                      <span className="text-yellow-400 mr-2">🎯</span>
                      Section-Keyword Connections
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {connections.section_keyword_matches?.length > 0 ? (
                        connections.section_keyword_matches.map((match, index) => (
                          <div key={index} className="bg-gray-700 rounded p-3">
                            <div className="font-medium text-sm text-white">{match.section}</div>
                            <div className="text-xs text-gray-400">Page {match.page} • {match.level}</div>
                            <div className="mt-1">
                              {match.keywords.map((keyword, kidx) => (
                                <span key={kidx} className="inline-block px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs mr-1 mt-1">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Relevance: {(match.relevance_score * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No section-keyword connections found</p>
                      )}
                    </div>
                  </div>

                  {/* Heading-Insight Links */}
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <h4 className="font-medium text-white mb-3 flex items-center">
                      <span className="text-blue-400 mr-2">💭</span>
                      Heading-Insight Links
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {connections.heading_insight_links?.length > 0 ? (
                        connections.heading_insight_links.map((link, index) => (
                          <div key={index} className="bg-gray-700 rounded p-3">
                            <div className="font-medium text-sm text-white">{link.heading}</div>
                            <div className="text-xs text-gray-400 mb-2">Page {link.page}</div>
                            <div className="text-xs text-gray-300">
                              {link.insights.map((insight, iidx) => (
                                <div key={iidx} className="mb-1">• {insight}</div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No heading-insight links found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Insights */}
              {enhanced_insights && (
                <div className="mt-6 bg-gray-800 rounded p-4 border border-gray-700">
                  <h4 className="font-medium text-white mb-3 flex items-center">
                    <span className="text-purple-400 mr-2">🧠</span>
                    Enhanced Analysis
                  </h4>
                  <div className="space-y-3">
                    {enhanced_insights.document_structure_analysis && (
                      <div>
                        <strong className="text-purple-400">Structure Assessment:</strong>
                        <p className="text-gray-300 text-sm">{enhanced_insights.document_structure_analysis}</p>
                      </div>
                    )}
                    {enhanced_insights.content_flow_patterns?.length > 0 && (
                      <div>
                        <strong className="text-purple-400">Content Patterns:</strong>
                        <ul className="text-gray-300 text-sm ml-4">
                          {enhanced_insights.content_flow_patterns.map((pattern, index) => (
                            <li key={index}>• {pattern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'podcast' && (
            <PodcastMode analysis={analysis} outline={outline} />
          )}
        </div>

        {/* Processing Stats */}
        <div className="mt-12">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4 border-b border-red-600 pb-2">
              Processing Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
                <div className="text-2xl font-bold text-white mb-1">
                  {analysis?.document_info?.page_count || '—'}
                </div>
                <div className="text-sm text-gray-400">Pages</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
                <div className="text-2xl font-bold text-white mb-1">
                  {outline?.outline?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Sections</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
                <div className="text-2xl font-bold text-white mb-1">
                  {connections?.section_keyword_matches?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Connections</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
                <div className="text-2xl font-bold text-white mb-1">
                  {analysis?.document_info?.keywords?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Keywords</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResultsSection
