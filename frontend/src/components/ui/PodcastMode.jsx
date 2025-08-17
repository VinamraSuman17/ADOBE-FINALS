import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, Volume2, Clock, SkipForward } from 'lucide-react'


const PodcastMode = ({ analysis, outline, isMultipleFiles, comparison }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [podcastScript, setPodcastScript] = useState([])
  const [currentSection, setCurrentSection] = useState(0)
  const speechSynthesis = useRef(window.speechSynthesis)
  const utteranceRef = useRef(null)
  const progressInterval = useRef(null)
  const sectionTimeoutRef = useRef(null)
  const isPlayingRef = useRef(false) // ✅ Ref to track playing state reliably

  const generateSectionDescription = (sectionText, persona) => {
    const descriptions = {
      'student': 'important learning content that builds foundational knowledge',
      'business_analyst': 'critical business information for strategic analysis',  
      'researcher': 'valuable research data that supports empirical findings',
      'project_manager': 'essential project information for planning and execution',
      'legal_professional': 'relevant legal information for case preparation',
      'financial_analyst': 'financial data important for quantitative analysis'
    }
    return descriptions[persona] || 'significant information relevant to your analysis'
  }

  const generateComprehensivePodcastScript = useCallback(() => {
    const script = []
    
    if (isMultipleFiles && comparison) {
      script.push({
        title: "Introduction",
        content: `Welcome to your comprehensive document analysis. Today we're analyzing ${comparison || 'multiple'} documents.`,
        duration: 4
      })

      script.push({
        title: "Overview",
        content: `We completed a comparative analysis of your documents, identifying key themes and patterns.`,
        duration: 5
      })

      if (comparison && comparison > 0) {
        script.push({
          title: "Common Themes",
          content: `Key themes identified: ${comparison}.`,
          duration: 6
        })
      }
    } else {
      script.push({
        title: "Introduction",  
        content: `Welcome to your document analysis. We're exploring ${analysis || 'your document'}.`,
        duration: 200
      })

      script.push({
        title: "Document Overview",
        content: `This document contains ${outline?.length || 0} main sections across ${analysis || 1} pages.`,
        duration: 20
      })

      if (analysis && analysis > 0) {
        script.push({
          title: "Key Insights",
          content: `Key insights: ${analysis}.`,
          duration: 6
        })
      }
    }

    script.push({
      title: "Conclusion",
      content: `This concludes your analysis. Thank you for using our service.`,
      duration: 4
    })
    setPodcastScript(script)
    setTotalDuration(script.reduce((total, section) => total + section.duration, 0))
  }, [analysis, outline, isMultipleFiles, comparison])

  useEffect(() => {
    if ((analysis && outline) || (isMultipleFiles && comparison)) {
      generateComprehensivePodcastScript()
    }
  }, [generateComprehensivePodcastScript])

  // ✅ COMPLETELY REWRITTEN playSection with bulletproof progression
  const playSection = useCallback((sectionIndex) => {
    
    // ✅ Clear any existing timeouts
    if (sectionTimeoutRef.current) {
      clearTimeout(sectionTimeoutRef.current)
      sectionTimeoutRef.current = null
    }
    
    // ✅ Check if we've reached the end
    if (sectionIndex >= podcastScript.length) {
      setIsPlaying(false)
      isPlayingRef.current = false
      setCurrentSection(0)
      setCurrentTime(0)
      return
    }

    const section = podcastScript[sectionIndex]
    if (!section) {
      setIsPlaying(false)
      isPlayingRef.current = false
      return
    }

    // ✅ Update current section
    setCurrentSection(sectionIndex)
    
    // ✅ Cancel any existing speech
    if (speechSynthesis.current.speaking) {
      speechSynthesis.current.cancel()
    }
    
    // ✅ Small delay to ensure speech synthesis is ready
    setTimeout(() => {
      if (!isPlayingRef.current) {
        return
      }

      const utterance = new SpeechSynthesisUtterance(section.content)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      let hasEnded = false
      
      utterance.onstart = () => {
        startProgressTracking(section.duration)
      }

      utterance.onend = () => {
        if (hasEnded) return // Prevent double execution
        hasEnded = true
        
        clearInterval(progressInterval.current)
        
        // ✅ Move to next section ONLY if still playing
        if (isPlayingRef.current && sectionIndex + 1 < podcastScript.length) {
          setTimeout(() => {
            if (isPlayingRef.current) {
              playSection(sectionIndex + 1)
            }
          }, 500)
        } else if (sectionIndex + 1 >= podcastScript.length) {
          setIsPlaying(false)
          isPlayingRef.current = false
          setCurrentSection(0)
          setCurrentTime(0)
        }
      }

      utterance.onerror = (event) => {
        console.error(`❌ SPEECH ERROR: ${section.title}`, event)
        if (hasEnded) return
        hasEnded = true
        
        clearInterval(progressInterval.current)
        
        // ✅ Continue to next section even on error
        if (isPlayingRef.current && sectionIndex + 1 < podcastScript.length) {
          setTimeout(() => {
            if (isPlayingRef.current) {
              playSection(sectionIndex + 1)
            }
          }, 1000)
        }
      }

      utteranceRef.current = utterance
      speechSynthesis.current.speak(utterance)
      
      // ✅ ULTIMATE SAFETY NET: Force next section after timeout
      sectionTimeoutRef.current = setTimeout(() => {
        if (!hasEnded && isPlayingRef.current) {
          hasEnded = true
          clearInterval(progressInterval.current)
          
          if (speechSynthesis.current.speaking) {
            speechSynthesis.current.cancel()
          }
          
          if (sectionIndex + 1 < podcastScript.length) {
            playSection(sectionIndex + 1)
          } else {
            setIsPlaying(false)
            isPlayingRef.current = false
            setCurrentSection(0)
            setCurrentTime(0)
          }
        }
      }, (section.duration + 1) * 1000) // Section duration + 1 second
      
    }, 300)
    
  }, [podcastScript])

  const startProgressTracking = (duration) => {
    clearInterval(progressInterval.current)
    let elapsed = 0
    progressInterval.current = setInterval(() => {
      elapsed += 0.3
      setCurrentTime(prev => {
        const newTime = prev + 0.3
        return newTime >= totalDuration ? totalDuration : newTime
      })
      
      if (elapsed >= duration) {
        clearInterval(progressInterval.current)
      }
    }, 300)
  }

  const playPodcast = () => {
    if (podcastScript.length === 0) {
      return
    }
    
    setIsPlaying(true)
    isPlayingRef.current = true // ✅ Set ref immediately
    setCurrentSection(0)
    setCurrentTime(0)
    
    // ✅ Start first section immediately
    setTimeout(() => {
      playSection(0)
    }, 100)
  }

  const pausePodcast = () => {
    setIsPlaying(false)
    isPlayingRef.current = false // ✅ Set ref immediately
    
    if (speechSynthesis.current.speaking) {
      speechSynthesis.current.cancel()
    }
    clearInterval(progressInterval.current)
    if (sectionTimeoutRef.current) {
      clearTimeout(sectionTimeoutRef.current)
      sectionTimeoutRef.current = null
    }
  }

  const resetPodcast = () => {
    pausePodcast()
    setCurrentTime(0)
    setCurrentSection(0)
  }

  const skipToNext = () => {
    if (currentSection + 1 < podcastScript.length) {
      
      // Cancel current
      if (speechSynthesis.current.speaking) {
        speechSynthesis.current.cancel()
      }
      clearInterval(progressInterval.current)
      if (sectionTimeoutRef.current) {
        clearTimeout(sectionTimeoutRef.current)
      }
      
      // Start next
      setTimeout(() => {
        if (isPlayingRef.current) {
          playSection(currentSection + 1)
        }
      }, 200)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Volume2 className="text-red-600" size={20} />
        <h3 className="text-xl font-semibold text-white">Audio Summary</h3>
        <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
          {podcastScript.length} sections
        </span>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-2 bg-gray-700 rounded text-xs text-gray-300">
        Current: {currentSection + 1}/{podcastScript.length} • 
        Playing: {isPlaying ? 'YES' : 'NO'} • 
        Section: {podcastScript[currentSection]?.title || 'None'}
      </div>

      {/* Audio Player */}
      <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-600">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={resetPodcast}
            className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={skipToNext}
            disabled={currentSection + 1 >= podcastScript.length || !isPlaying}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
            title="Next Section"
          >
            <SkipForward size={18} />
          </button>
          
          <button
            onClick={isPlaying ? pausePodcast : playPodcast}
            disabled={podcastScript.length === 0}
            className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-600 transition-all transform hover:scale-105"
            title={isPlaying ? "Pause" : "Play All Sections"}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <div className="flex items-center space-x-2 text-gray-400">
            <Clock size={16} />
            <span className="text-sm">
              {Math.ceil(totalDuration / 60)} min
            </span>
          </div>
        </div>

        {/* Current Section Display */}
        {podcastScript[currentSection] && (
          <div className="mt-6 text-center">
            <div className={`inline-flex items-center space-x-3 rounded-full px-6 py-3 border ${
              isPlaying 
                ? 'bg-red-600/20 border-red-600/30' 
                : 'bg-gray-700/50 border-gray-600/30'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isPlaying ? 'bg-red-400 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium text-white">
                {podcastScript[currentSection].title}
              </span>
              <span className="text-xs text-gray-400">
                ({currentSection + 1}/{podcastScript.length})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* All Sections List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <h4 className="text-white font-medium mb-3">All Sections:</h4>
        {podcastScript.map((section, index) => (
          <div 
            key={index} 
            className={`p-3 rounded border transition-all ${
              currentSection === index 
                ? 'bg-red-900/30 border-red-600/50' 
                : currentSection > index
                  ? 'bg-green-900/20 border-green-600/30'
                  : 'bg-gray-900 border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono">
                  {currentSection === index && isPlaying ? '▶️' : 
                   currentSection > index ? '✅' : 
                   `${index + 1}.`}
                </span>
                <span className="text-sm text-white">{section.title}</span>
              </div>
              <span className="text-xs text-gray-500">{section.duration}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PodcastMode
