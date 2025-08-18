import React, { useState } from 'react'
import { 
  BarChart3, 
  Target, 
  Lightbulb, 
  Link, 
  Headphones, 
  TrendingUp, 
  Trophy,
  FileText,
  Brain,
  Users,
  Zap
} from 'lucide-react'
import InsightsBulb from '../ui/InsightsBulb'
import PodcastMode from "./PodcastMode.jsx";
import HighlightedSections from '../ui/HighlightedSections'

const ResultsSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!data || !data.success) {
    return null
  }

  const { outline, analysis, connections, highlighted_sections, individual_results, comparison, ranking } = data

  // Determine if it's single or multiple file analysis
  const isMultipleFiles = data.total_files && data.total_files > 1

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'highlights', label: 'Highlighted Sections', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'connections', label: 'Connect the Dots', icon: Link },
    { id: 'podcast', label: 'Audio Summary', icon: Headphones },
    ...(isMultipleFiles ? [
      { id: 'comparison', label: 'Comparison', icon: TrendingUp },
      { id: 'ranking', label: 'Document Ranking', icon: Trophy }
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
              ? `Comprehensive analysis of ${data.total_files} documents`
              : 'Your document analysis powered by advanced AI'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-800">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 mx-2 mb-4 rounded-t-lg font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white border-b-2 border-red-600'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Outline */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center space-x-2 mb-4 border-b border-red-600 pb-2">
                  <FileText className="text-red-600" size={20} />
                  <h3 className="text-xl font-semibold text-white">Document Structure</h3>
                </div>
                <div className="bg-gray-800 rounded p-4 max-h-80 overflow-y-auto border border-gray-700">
                  {isMultipleFiles ? (
                    // Multiple files overview
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Users className="text-blue-400" size={16} />
                        <h4 className="font-medium text-white">
                          {data.total_files} Documents Analyzed
                        </h4>
                      </div>
                      {individual_results && individual_results.slice(0, 3).map((result, index) => (
                        <div key={index} className="bg-gray-700 rounded p-3 border border-gray-600">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="text-blue-400" size={14} />
                            <div className="font-medium text-white text-sm">
                              {result.filename}
                            </div>
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
                <div className="flex items-center space-x-2 mb-4 border-b border-red-600 pb-2">
                  <Brain className="text-red-600" size={20} />
                  <h3 className="text-xl font-semibold text-white">AI Analysis</h3>
                </div>
                <div className="space-y-4">
                  {/* Persona Info */}
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="text-blue-400" size={16} />
                      <h4 className="font-medium text-white">
                        Persona: {analysis?.metadata?.persona || comparison?.persona || 'Unknown'}
                      </h4>
                    </div>
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
                      <div className="flex items-center space-x-2 mb-3">
                        <Zap className="text-yellow-400" size={16} />
                        <h4 className="font-medium text-white">
                          {isMultipleFiles ? 'Common Themes' : 'Key Terms'}
                        </h4>
                      </div>
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
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="text-yellow-400" size={16} />
                        <h4 className="font-medium text-white">Key Insights</h4>
                      </div>
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
                      <div className="flex items-center space-x-2 mb-3">
                        <Target className="text-green-400" size={16} />
                        <h4 className="font-medium text-white">Relevance Analysis</h4>
                      </div>
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
              <div className="flex items-center space-x-2 mb-6">
                <Link className="text-red-600" size={20} />
                <h3 className="text-xl font-semibold text-white">Connect the Dots Analysis</h3>
              </div>
              {connections && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="text-yellow-400" size={16} />
                      <h4 className="font-medium text-white">Section-Keyword Connections</h4>
                    </div>
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
                      <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="text-blue-400" size={16} />
                        <h4 className="font-medium text-white">Cross-Document Themes</h4>
                      </div>
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
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="text-red-600" size={20} />
                <h3 className="text-xl font-semibold text-white">Document Comparison Analysis</h3>
              </div>
              
              {comparison && (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="bg-gray-800 rounded p-4 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="text-blue-400" size={16} />
                      <h4 className="font-medium text-white">Analysis Overview</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{comparison.overview}</p>
                  </div>

                  {/* Rest of comparison content... */}
                </div>
              )}
            </div>
          )}

          {/* Ranking Tab (Multiple Files Only) */}
          {activeTab === 'ranking' && isMultipleFiles && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="text-red-600" size={20} />
                <h3 className="text-xl font-semibold text-white">Document Ranking Analysis</h3>
              </div>
              
              {ranking && (
                <div className="space-y-4">
                  {ranking.map((item, index) => (
                    <div key={index} className="bg-gray-800 rounded p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Trophy 
                            className={`${
                              item.rank === 1 ? 'text-yellow-400' : 
                              item.rank === 2 ? 'text-gray-300' : 
                              item.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                            }`} 
                            size={24} 
                          />
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
