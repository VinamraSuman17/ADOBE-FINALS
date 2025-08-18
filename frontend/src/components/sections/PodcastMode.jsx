import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, Clock, SkipForward, ListChecks, Mic, Info } from 'lucide-react';

const PodcastMode = ({ analysis, outline, isMultipleFiles, comparison }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [podcastScript, setPodcastScript] = useState([]);
  const [currentSection, setCurrentSection] = useState(0);

  const speechSynthesisRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const progressInterval = useRef(null);
  const sectionTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Split long text into smaller utterances
  const speakText = useCallback((text, onChunkEnd, onComplete) => {
    const chunks = (text || '').match(/.{1,250}(\s|$)/g) || [];
    let index = 0;

    const speakNext = () => {
      if (!isPlayingRef.current || index >= chunks.length) {
        onComplete && onComplete();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        onChunkEnd && onChunkEnd();
        index++;
        speakNext();
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        index++;
        speakNext();
      };

      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.speak(utterance);
      } else {
        // Fallback: simulate timing if speech is unavailable
        setTimeout(() => {
          onChunkEnd && onChunkEnd();
          index++;
          speakNext();
        }, 500);
      }
    };

    speakNext();
  }, []);

  const generateComprehensivePodcastScript = useCallback(() => {
    const script = [];

    if (isMultipleFiles && comparison) {
      script.push({
        title: 'Introduction',
        content: `Welcome to your comprehensive document analysis. Today we're analyzing ${comparison || 'multiple'} documents.`,
        duration: 4,
      });

      script.push({
        title: 'Overview',
        content: `We completed a comparative analysis of your documents, identifying key themes and patterns.`,
        duration: 5,
      });

      if (comparison && comparison > 0) {
        script.push({
          title: 'Common Themes',
          content: `Key themes identified: ${comparison}.`,
          duration: 6,
        });
      }
    } else {
      script.push({
        title: 'Introduction',
        content: `Welcome to your document analysis. We're exploring ${analysis || 'your document'}.`,
        duration: 20, // realistic intro
      });

      script.push({
        title: 'Document Overview',
        content: `This document contains ${outline?.length || 0} main sections.`,
        duration: 10,
      });

      if (analysis) {
        script.push({
          title: 'Key Insights',
          content: `Key insights summary: ${typeof analysis === 'string' ? analysis.slice(0, 160) + '...' : 'Available in the transcript.'}`,
          duration: 8,
        });
      }
    }

    script.push({
      title: 'Conclusion',
      content: `This concludes your analysis. Thank you for using our service.`,
      duration: 4,
    });

    setPodcastScript(script);
    setTotalDuration(script.reduce((total, section) => total + (section.duration || 0), 0));
  }, [analysis, outline, isMultipleFiles, comparison]);

  useEffect(() => {
    if ((analysis && outline) || (isMultipleFiles && comparison)) {
      generateComprehensivePodcastScript();
    }
  }, [generateComprehensivePodcastScript]);

  const startProgressTracking = useCallback((duration) => {
    clearInterval(progressInterval.current);
    let elapsed = 0;
    progressInterval.current = setInterval(() => {
      elapsed += 0.3;
      setCurrentTime((prev) => {
        const newTime = prev + 0.3;
        return newTime >= totalDuration ? totalDuration : newTime;
      });

      if (elapsed >= duration) {
        clearInterval(progressInterval.current);
      }
    }, 300);
  }, [totalDuration]);

  const playSection = useCallback((sectionIndex) => {
    if (sectionTimeoutRef.current) {
      clearTimeout(sectionTimeoutRef.current);
      sectionTimeoutRef.current = null;
    }

    if (sectionIndex >= podcastScript.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentSection(0);
      setCurrentTime(0);
      return;
    }

    const section = podcastScript[sectionIndex];
    if (!section) return;

    setCurrentSection(sectionIndex);
    startProgressTracking(section.duration || 0);

    speakText(
      section.content,
      null,
      () => {
        if (isPlayingRef.current && sectionIndex + 1 < podcastScript.length) {
          setTimeout(() => playSection(sectionIndex + 1), 400);
        } else if (sectionIndex + 1 >= podcastScript.length) {
          setIsPlaying(false);
          isPlayingRef.current = false;
          setCurrentSection(0);
          setCurrentTime(0);
        }
      }
    );

    // Safety timeout (if speech engine misbehaves)
    sectionTimeoutRef.current = setTimeout(() => {
      if (isPlayingRef.current && sectionIndex + 1 < podcastScript.length) {
        playSection(sectionIndex + 1);
      }
    }, ((section.duration || 0) + 2) * 1000);
  }, [podcastScript, speakText, startProgressTracking]);

  const playPodcast = useCallback(() => {
    if (podcastScript.length === 0) return;

    setIsPlaying(true);
    isPlayingRef.current = true;
    setCurrentSection(0);
    setCurrentTime(0);

    // Cancel any existing speech before starting
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }

    setTimeout(() => playSection(0), 200);
  }, [podcastScript.length, playSection]);

  const pausePodcast = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    clearInterval(progressInterval.current);
    if (sectionTimeoutRef.current) {
      clearTimeout(sectionTimeoutRef.current);
      sectionTimeoutRef.current = null;
    }
  }, []);

  const resetPodcast = useCallback(() => {
    pausePodcast();
    setCurrentTime(0);
    setCurrentSection(0);
  }, [pausePodcast]);

  const skipToNext = useCallback(() => {
    if (currentSection + 1 < podcastScript.length) {
      pausePodcast();
      // Keep play/pause state consistent: only auto-continue if previously playing
      const wasPlaying = isPlayingRef.current;
      isPlayingRef.current = wasPlaying;
      if (wasPlaying) {
        setTimeout(() => playSection(currentSection + 1), 200);
        setIsPlaying(true);
      } else {
        setCurrentSection((s) => Math.min(s + 1, podcastScript.length - 1));
      }
    }
  }, [currentSection, podcastScript.length, pausePodcast, playSection]);

  const formatTime = (seconds) => {
    const mins = Math.floor((seconds || 0) / 60);
    const secs = Math.floor((seconds || 0) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  useEffect(() => {
    return () => {
      clearInterval(progressInterval.current);
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      if (sectionTimeoutRef.current) {
        clearTimeout(sectionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-indigo-300" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-white">Audio Summary</h3>
          <span className="text-xs text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            {podcastScript.length} sections
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <Info className="w-4 h-4" aria-hidden="true" />
          <span>Text-to-speech generated locally by the browser</span>
        </div>
      </header>

      {/* Status */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-800 text-xs text-gray-300">
        <div className="flex flex-wrap items-center gap-3">
          <span>Current: {Math.min(currentSection + 1, podcastScript.length)}/{podcastScript.length || 0}</span>
          <span>•</span>
          <span>Playing: {isPlaying ? 'Yes' : 'No'}</span>
          <span>•</span>
          <span>Section: {podcastScript[currentSection]?.title || 'None'}</span>
        </div>
      </div>

      {/* Player */}
      <div className="bg-gray-950/50 rounded-lg p-5 mb-6 border border-gray-800">
        {/* Time + Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={Math.round(progressPercentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetPodcast}
            className="p-3 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            title="Reset"
            aria-label="Reset"
            type="button"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={skipToNext}
            disabled={currentSection + 1 >= podcastScript.length || !podcastScript.length}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            title="Next Section"
            aria-label="Next Section"
            type="button"
          >
            <SkipForward size={18} />
          </button>

          <button
            onClick={isPlaying ? pausePodcast : playPodcast}
            disabled={podcastScript.length === 0}
            className={`p-5 rounded-full text-white transition-all transform hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed ${
              isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            title={isPlaying ? 'Pause' : 'Play All Sections'}
            aria-label={isPlaying ? 'Pause' : 'Play All Sections'}
            type="button"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <div className="hidden sm:flex items-center gap-2 text-gray-400">
            <Clock size={16} />
            <span className="text-sm">{Math.max(1, Math.ceil(totalDuration / 60))} min</span>
          </div>
        </div>

        {/* Current Section Indicator */}
        {podcastScript[currentSection] && (
          <div className="mt-6 text-center">
            <div
              className={`inline-flex items-center gap-3 rounded-full px-6 py-3 border ${
                isPlaying ? 'bg-indigo-600/15 border-indigo-500/30' : 'bg-gray-800/60 border-gray-700'
              }`}
            >
              <Mic className={`w-4 h-4 ${isPlaying ? 'text-indigo-300' : 'text-gray-400'}`} />
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

      {/* Section List */}
      <div className="max-h-56 overflow-y-auto">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-indigo-300" aria-hidden="true" />
          All Sections
        </h4>
        <div className="space-y-2">
          {podcastScript.map((section, index) => {
            const isActive = currentSection === index;
            const isDone = currentSection > index;
            return (
              <div
                key={index}
                className={`p-3 rounded border transition-all ${
                  isActive
                    ? 'bg-indigo-900/30 border-indigo-600/50'
                    : isDone
                    ? 'bg-emerald-900/20 border-emerald-600/30'
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-white">{section.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{section.duration}s</span>
                </div>
              </div>
            );
          })}
          {podcastScript.length === 0 && (
            <div className="p-4 text-xs text-gray-400 border border-gray-800 rounded bg-gray-900/60">
              No sections generated yet. Start by creating a podcast from your analysis.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PodcastMode;
