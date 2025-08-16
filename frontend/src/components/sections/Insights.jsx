import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  LightBulbIcon, 
  DocumentDuplicateIcon, 
  ExclamationTriangleIcon,
  CogIcon,
  UserGroupIcon,
  ClockIcon,
  SparklesIcon,
  ArrowsPointingOutIcon, // Changed from ArrowsExpandIcon
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

// Enhanced insight categories with proper icons
const insightCategories = [
  {
    key: 'deep_similarities',
    title: 'Deep Similarities',
    icon: <DocumentDuplicateIcon className="w-4 h-4" />,
    color: 'purple',
    description: 'Cross-document patterns and connections'
  },
  {
    key: 'key_insights',
    title: 'Key Insights',
    icon: <LightBulbIcon className="w-4 h-4" />,
    color: 'blue',
    description: 'Primary analytical findings'
  },
  {
    key: 'recommendations',
    title: 'Recommendations',
    icon: <ChartBarIcon className="w-4 h-4" />,
    color: 'green',
    description: 'Actionable suggestions'
  },
  {
    key: 'potential_issues',
    title: 'Potential Issues',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
    color: 'red',
    description: 'Areas requiring attention'
  }
];

// Function to format deep similarities with better structure
const formatDeepSimilarity = (text) => {
  // Split by periods and create structured paragraphs
  const sentences = text.split('. ').filter(s => s.trim().length > 0);
  
  return sentences.map((sentence, idx) => {
    // Clean up the sentence
    let cleanSentence = sentence.trim();
    if (!cleanSentence.endsWith('.') && idx < sentences.length - 1) {
      cleanSentence += '.';
    }
    
    // Identify document references and highlight them
    const documentPattern = /'([^']+\.pdf)'/g;
    const parts = cleanSentence.split(documentPattern);
    
    return (
      <p key={idx} className="mb-3 last:mb-0">
        {parts.map((part, partIdx) => {
          if (part.endsWith('.pdf')) {
            return (
              <span 
                key={partIdx}
                className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm font-medium mx-1"
              >
                <DocumentTextIcon className="w-3 h-3 mr-1" />
                {part}
              </span>
            );
          }
          
          // Highlight key terms
          const highlightedText = part
            .replace(/\*([^*]+)\*/g, '<strong class="text-yellow-300 font-semibold">$1</strong>')
            .replace(/(PDF|Adobe|Acrobat)/gi, '<span class="text-purple-300 font-medium">$1</span>');
          
          return (
            <span 
              key={partIdx} 
              dangerouslySetInnerHTML={{ __html: highlightedText }} 
            />
          );
        })}
      </p>
    );
  });
};

const ProfessionalInsightsDisplay = ({ insights, activeInsight, setActiveInsight }) => {
  return (
    <div className="space-y-6">
      {/* Professional Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {insightCategories.map(({ key, title, icon, color, description }) => {
          const count = insights[key]?.length || 0;
          return (
            <button
              key={key}
              onClick={() => setActiveInsight(key)}
              className={`relative inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                activeInsight === key
                  ? `bg-${color}-600 text-white shadow-lg shadow-${color}-600/25 scale-[1.02]`
                  : "bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/50 hover:border-gray-500/50"
              }`}
              title={description}
            >
              <span className="mr-2 flex-shrink-0">{icon}</span>
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{title.split(" ")[0]}</span>
              
              {count > 0 && (
                <div className={`ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full font-bold min-w-[1.25rem] text-center`}>
                  {count}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-xl p-4 border border-gray-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${insightCategories.find(cat => cat.key === activeInsight)?.color || 'gray'}-600/20`}>
              {insightCategories.find((cat) => cat.key === activeInsight)?.icon}
            </div>
            <div>
              <h5 className="text-xl font-semibold text-white">
                {insightCategories.find((cat) => cat.key === activeInsight)?.title}
              </h5>
              <p className="text-sm text-gray-400">
                {insightCategories.find((cat) => cat.key === activeInsight)?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1 bg-gray-600/40 rounded-full">
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">
                {insights[activeInsight]?.length || 0} insights
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Content Display */}
      <div className="space-y-4">
        {insights[activeInsight]?.length > 0 ? (
          insights[activeInsight].map((insight, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-gray-800/60 to-gray-800/40 rounded-xl border border-gray-600/30 hover:border-gray-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-gray-900/20"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {idx + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-100 leading-relaxed">
                      {activeInsight === 'deep_similarities' ? (
                        <div className="space-y-3">
                          {formatDeepSimilarity(insight)}
                        </div>
                      ) : (
                        <p className="text-gray-200 leading-relaxed">{insight}</p>
                      )}
                    </div>

                    {/* Professional Metadata Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <AcademicCapIcon className="w-3 h-3" />
                          <span>{insight.length} characters</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <SparklesIcon className="w-3 h-3" />
                          <span>AI Generated</span>
                        </div>
                        {insight.includes("Page") && (
                          <div className="flex items-center space-x-1">
                            <DocumentTextIcon className="w-3 h-3" />
                            <span>Referenced</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>Just now</span>
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-purple-400 hover:text-purple-300 rounded hover:bg-purple-500/10 transition-colors">
                          <ArrowsPointingOutIcon className="w-3 h-3" />
                          <span>Expand Analysis</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-800/30 to-gray-700/20 rounded-xl border border-gray-600/20">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
              <LightBulbIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h6 className="text-lg font-medium text-gray-400 mb-2">
              No {activeInsight.replace('_', ' ')} found
            </h6>
            <p className="text-gray-500 max-w-md mx-auto">
              Try selecting more or different text for richer AI insights and analysis.
            </p>
            <div className="mt-4">
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm">
                <SparklesIcon className="w-4 h-4" />
                <span>Generate More Insights</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInsightsDisplay;
