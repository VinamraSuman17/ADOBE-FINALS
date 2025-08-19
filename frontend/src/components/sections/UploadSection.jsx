import React, { useState, useRef, useCallback, useMemo } from "react";
import Button from "../ui/Button";
import AdobePdfViewer from "../ui/AdobePdfViewer";
import Loader from "../common/Loader";
import PDFPreviewModal from "../ui/PDFPreviewModal";
import { toast } from "react-toastify";
import { CgBulb } from "react-icons/cg";
import PodcastMode from "./PodcastMode.jsx";

import {
  Link2,
  Zap,
  Rocket,
  Lightbulb,
  Repeat2,
  FileText,
  Brain,
  AlertTriangle,
  Trophy,
  Target,
  ThumbsUp,
  BarChart2,
  ChevronDown,
  Radio,
  CheckCircle2,
  Loader2,
  Waves,
  Volume2,
  Pause,
  Play,
  Sparkles,
  Bot,
  Check,
  Notebook,
  Cpu,
  Network,
  View,
  Eye,
  Copy,
  ViewIcon,
  GitGraph,
} from "lucide-react";

const UploadSection = ({
  onWorkflowComplete,
  onUploadSuccess,
  loading,
  setLoading,
}) => {
  const [priorDocuments, setPriorDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [stage, setStage] = useState("prior"); // 'prior' | 'current' | 'analysis'
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [priorUploadProgress, setPriorUploadProgress] = useState(0);
  const [currentUploadProgress, setCurrentUploadProgress] = useState(0);
  const [selectedText, setSelectedText] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // ✅ Enhanced state for DEEP AI-powered features
  const [podcastData, setPodcastData] = useState(null);
  const [isPodcastGenerating, setIsPodcastGenerating] = useState(false);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDeepAiAnalysisLoading, setIsDeepAiAnalysisLoading] = useState(false);
  const [documentsWithIds, setDocumentsWithIds] = useState([]);

  // ✅ PDF Preview Modal State
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    snippet: null,
  });

  const pdfViewerRef = useRef(null);
  const audioRef = useRef(null);

  // ✅ Enhanced prior documents upload with unique IDs
  const handlePriorDocumentsUpload = async (files) => {
    if (!files || files.length === 0) {
      toast("Please select at least 1 PDF file");
      return;
    }

    if (files.length > 50) {
      toast("Maximum 30 files allowed for prior documents");
      return;
    }

    setLoading(true);
    setPriorUploadProgress(0);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        if (file.type === "application/pdf") {
          formData.append("files", file);
        }
      });
      formData.append("user_session_id", sessionId);

      const response = await fetch(
        "http://localhost:8080/ingest-prior-documents/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      setPriorDocuments(Array.from(files));
      setDocumentsWithIds(data.documents_with_ids || []); // ✅ Store documents with IDs
      toast(
        `Successfully uploaded ${data.documents_processed} prior documents for AI analysis with preview enabled!`
      );
    } catch (error) {
      console.error("Prior documents upload failed:", error);
      toast("Upload failed: " + error.message);
    } finally {
      setLoading(false);
      setPriorUploadProgress(0);
    }
  };

  // Handle current document upload (1 PDF)
  const handleCurrentDocumentUpload = async (file) => {
    if (!file) {
      toast("Please select a PDF file");
      return;
    }

    if (file.type !== "application/pdf") {
      toast("Please select a PDF file only");
      return;
    }

    setLoading(true);
    setCurrentUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_session_id", sessionId);

      const response = await fetch(
        "http://localhost:8080/set-current-document/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      setCurrentDocument(file);

      toast(
        "Current document ready! Now select text for deep AI-powered insights."
      );
    } catch (error) {
      console.error("Current document upload failed:", error);
      toast("Upload failed: " + error.message);
    } finally {
      setLoading(false);
      setCurrentUploadProgress(0);
    }
  };

  // ✅ ENHANCED text selection with DEEP AI insights
  const handleTextSelection = async (selectionData) => {
    if (!selectionData?.text || selectionData.text.length < 15) {
      toast(
        "Please select more text (at least 15 characters) for comprehensive AI analysis"
      );
      return;
    }

    setSelectedText(selectionData);
    setAnalysisLoading(true);
    setIsDeepAiAnalysisLoading(true);

    try {
      const formData = new FormData();
      formData.append("selection_text", selectionData.text);
      formData.append("page_number", selectionData.page.toString());
      formData.append("user_session_id", sessionId);

      const response = await fetch("http://localhost:8080/analyze-selection/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const results = await response.json();
      setAnalysisResults(results);

      toast(
        `Deep AI insights generated! Found ${
          results.metadata?.total_insights || 0
        } insights with PDF preview available.`
      );

      // Trigger parent callback
      onUploadSuccess?.({
        priorDocuments,
        currentDocument,
        selectedText: selectionData,
        analysisResults: results,
        sessionId,
        aiEnhanced: true,
        deepAnalysis: true,
      });
    } catch (error) {
      console.error("Deep AI analysis failed:", error);
      toast("AI analysis failed: " + error.message);
    } finally {
      setAnalysisLoading(false);
      setIsDeepAiAnalysisLoading(false);
    }
  };

  // ✅ ENHANCED podcast generation with DEEP AI insights
  const handleGeneratePodcast = useCallback(async () => {
    if (!analysisResults) {
      toast("No analysis results available for podcast generation");
      return;
    }

    setIsPodcastGenerating(true);

    try {
      const response = await fetch("http://localhost:8080/generate-podcast/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_data: analysisResults,
          selected_text: selectedText?.text || "",
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const podcastResult = await response.json();
      console.log(podcastResult)
      if (podcastResult.success) {
        setPodcastData(podcastResult.podcast);
        toast(
          "🎧 Deep AI-enhanced podcast ready! Advanced insights in audio format."
        );
      } else {
        throw new Error(podcastResult.message || "Podcast generation failed");
      }
    } catch (error) {
      console.error("❌ Podcast generation failed:", error);
      toast("Podcast generation failed: " + error.message);
    } finally {
      setIsPodcastGenerating(false);
    }
  }, [analysisResults, selectedText, sessionId]);

  // ✅ Enhanced audio controls
  const togglePodcastPlayback = useCallback(() => {
    if (audioRef.current && podcastData) {
      try {
        if (isPodcastPlaying) {
          audioRef.current.pause();
        } else {
          if (audioRef.current.src !== podcastData.audio_url) {
            audioRef.current.src = podcastData.audio_url;
            audioRef.current.load();
          }

          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPodcastPlaying(true);
              })
              .catch((error) => {
                console.error("❌ Audio playback failed:", error);
                setIsPodcastPlaying(false);
              });
          }
        }
      } catch (error) {
        console.error("❌ Playback toggle error:", error);
        toast("Audio control error: " + error.message);
        setIsPodcastPlaying(false);
      }
    } else {
      toast("Audio not ready. Please regenerate the podcast.");
    }
  }, [isPodcastPlaying, podcastData]);

  // Audio event handlers
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioError = (e) => {
    console.error("❌ Audio error:", e);
    setIsPodcastPlaying(false);
  };

  // Navigate to snippet location
  const navigateToSnippet = (snippet) => {
    if (pdfViewerRef.current?.navigateToPage && snippet.page) {
      pdfViewerRef.current.navigateToPage(snippet.page - 1);
    }
  };

  // ✅ Handle PDF Preview
  const handlePDFPreview = (snippet) => {
    if (snippet.document_id) {
      setPreviewModal({ isOpen: true, snippet });
    } else {
      toast("PDF preview not available for this document");
    }
  };

  return (
    <section id="upload" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Adobe Challenge -{" "}
            <span className="text-red-600">Deep AI Document Intelligence</span>
          </h2>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full border border-green-500/30">
              <span className="text-xl"><Cpu/></span>
              <span className="text-sm text-green-300 font-medium">
                Deep Analysis Engine
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-full border border-orange-500/30">
              <span className="text-xl"><View/></span>
              <span className="text-sm text-orange-300 font-medium">
                PDF Preview
              </span>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Upload your document library → Upload current document → Select text
            for revolutionary AI insights with PDF preview
          </p>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${
                stage === "prior"
                  ? "text-red-600"
                  : priorDocuments.length > 0
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stage === "prior"
                    ? "bg-red-600 text-white"
                    : priorDocuments.length > 0
                    ? "bg-green-400 text-black"
                    : "bg-gray-600"
                }`}
              >
                1
              </div>
              <span className="font-medium">
                Knowledge Base ({priorDocuments.length}/30)
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-600"></div>
            <div
              className={`flex items-center space-x-2 ${
                stage === "current"
                  ? "text-red-600"
                  : currentDocument
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stage === "current"
                    ? "bg-red-600 text-white"
                    : currentDocument
                    ? "bg-green-400 text-black"
                    : "bg-gray-600"
                }`}
              >
                2
              </div>
              <span className="font-medium">Current Document</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-600"></div>
            <div
              className={`flex items-center space-x-2 ${
                stage === "analysis"
                  ? "text-red-600"
                  : selectedText
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stage === "analysis"
                    ? "bg-red-600 text-white"
                    : selectedText
                    ? "bg-green-400 text-black"
                    : "bg-gray-600"
                }`}
              >
                3
              </div>
              <span className="font-medium">Deep AI Analysis</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Upload Interface */}
          <div className="space-y-8">
            {/* Stage 1: Prior Documents Upload */}
            <div
              className={`bg-gray-800 rounded-lg p-6 border ${
                stage === "prior"
                  ? "border-red-600"
                  : priorDocuments.length > 0
                  ? "border-green-400"
                  : "border-gray-700"
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex space-x-2 items-center">
                  <span className="text-2xl"><Notebook/></span>
                      <span className="font-medium">
                        Step 1: Build AI Knowledge Base
                      </span>
                </h3>
              <p className="text-gray-300 mb-6">
                Upload 20-30 PDFs to create your intelligent document library.
                The AI will use these for deep cross-document analysis with PDF
                preview capability.
              </p>

              {priorDocuments.length === 0 ? (
                <div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => {
                      handlePriorDocumentsUpload(e.target.files);
                      setStage("current");
                    }}
                    className="hidden"
                    id="prior-docs-input"
                    disabled={loading}
                  />
                  <label
                    htmlFor="prior-docs-input"
                    className="cursor-pointer block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-gray-500 transition-colors"
                  >
                    <p className="text-white font-medium">
                      Click to select 20-30 PDF files
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Build your AI knowledge base with preview
                    </p>
                  </label>

                  {priorUploadProgress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>Building AI knowledge base with preview...</span>
                        <span>{priorUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${priorUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 text-green-400 mb-4">
                    {/* <span className="text-2xl">✅</span> */}
                    <span className="font-medium">
                      {priorDocuments.length} documents indexed with preview!
                    </span>
                    <div className="px-2 py-1 bg-green-600/20 rounded border border-green-500/30">
                      <span className="text-xs text-green-300">
                        Preview Ready
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto mb-4">
                    {priorDocuments.slice(0, 10).map((file, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-gray-700 text-gray-300 p-2 rounded flex items-center space-x-2"
                      >
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                    {priorDocuments.length > 10 && (
                      <div className="text-xs text-gray-400 p-2">
                        ... and {priorDocuments.length - 10} more files with
                        preview
                      </div>
                    )}
                  </div>
                  <a
                    href="#current-doc"
                    className="inline-flex items-center justify-center rounded-md border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 px-3 py-1.5 text-sm font-medium shadow-sm"
                  >
                    Next: Upload Current Document →
                  </a>
                </div>
              )}
            </div>

            {/* Stage 2: Current Document Upload */}
            {(priorDocuments.length > 0 || stage !== "prior") && (
              <div
                id="current-doc"
                className={`bg-gray-800 rounded-lg p-6 border ${
                  stage === "current"
                    ? "border-red-600"
                    : currentDocument
                    ? "border-green-400"
                    : "border-gray-700"
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex space-x-2 items-center">
                  <span className="text-2xl"><Cpu/></span>
                      <span className="font-medium">
                        Step 2: Upload Analysis Target
                      </span>
                </h3>
                <p className="text-gray-300 mb-6">
                  Upload the PDF you're currently reading. Select text from this
                  document to discover AI-powered connections with your
                  knowledge base and preview related documents.
                </p>

                {!currentDocument ? (
                  <div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        setStage("current");
                        handleCurrentDocumentUpload(e.target.files[0]);
                        setStage("analysis");
                      }}
                      className="hidden"
                      id="current-doc-input"
                      disabled={loading}
                    />
                    <label
                      htmlFor="current-doc-input"
                      className="cursor-pointer block w-full p-6 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-gray-500 transition-colors"
                    >
                      <div className="text-4xl text-gray-500 mb-3">🎯</div>
                      <p className="text-white font-medium">
                        Click to select 1 PDF file
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Your analysis target document
                      </p>
                    </label>

                    {currentUploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>Preparing for AI analysis...</span>
                          <span>{currentUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${currentUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 text-green-400 mb-4">
                      <span className="text-2xl"><Check/></span>
                      <span className="font-medium">
                        Analysis target: {currentDocument.name}
                      </span>
                    </div>
                    <a
                      href="#ai-analysis"
                      className="inline-flex items-center justify-center rounded-md border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 px-3 py-1.5 text-sm font-medium shadow-sm"
                    >
                      Next: Start Deep AI Analysis →
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Stage 3: Deep AI Analysis Instructions */}
            {currentDocument && (
              <div
                id="ai-analysis"
                className={`bg-gray-800 rounded-lg p-6
                `}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-2xl font-bold text-white mb-4 flex space-x-2 items-center">
                  <span className="text-2xl"><Network/></span>
                      <span className="font-medium">
                         Step 3: Deep AI Analysis
                      </span>
                  </h3>
                  <div className="px-2 py-1 bg-orange-600/20 rounded border border-orange-500/30">
                    <span className="text-xs text-orange-300">PDF Preview</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">
                  Select any text in the PDF viewer to unleash deep AI analysis
                  across your {priorDocuments.length} document knowledge base.
                  Preview related PDFs instantly with one click.
                </p>

                {selectedText && (
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <h4 className="font-bold text-white mb-2">
                      Selected for AI Analysis:
                    </h4>
                    <p className="text-gray-300 text-sm bg-gray-600 p-2 rounded">
                      "{selectedText.text}"
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        Page {selectedText.page}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-purple-400">
                          {selectedText.text.length} characters
                        </p>
                        <div className="px-1 py-0.5 bg-green-600/20 rounded">
                          <span className="text-xs text-green-300">
                            AI Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {analysisLoading && (
                  <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/30">
                    <div className="flex items-center space-x-3 text-yellow-400 mb-2">
                      <Loader />
                      <div>
                        <span className="font-medium">
                          Deep AI Analysis in Progress...
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-purple-300">
                      <div className="flex items-center space-x-2">
                        <span>
                          AI analyzing across {priorDocuments.length}{" "}
                          documents...
                        </span>
                      </div>
                      {isDeepAiAnalysisLoading && (
                        <div className="flex items-center space-x-2">
                          <span>🔍</span>
                          <span>
                            Generating insights with preview capabilities...
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span>👁️</span>
                        <span>Preparing PDF previews...</span>
                      </div>
                    </div>
                  </div>
                )}

                {analysisResults && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-400 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-400 mb-2">
                      <span className="text-xl"><Sparkles/></span>
                      <span className="font-medium">
                        Deep AI Analysis Complete!
                      </span>
                      <div className="px-2 py-1 bg-green-600/20 rounded border border-green-500/30">
                        <span className="text-xs text-green-300">
                          AI Enhanced
                        </span>
                      </div>
                      <div className="px-2 py-1 bg-purple-600/20 rounded border border-purple-500/30">
                        <span className="text-xs text-purple-300">
                          Preview Ready
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">
                          {analysisResults.relevant_snippets?.length || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          Relevant Sections
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                          {analysisResults.metadata?.insight_categories || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          AI Categories
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">
                          {analysisResults.metadata?.total_insights || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          Total Insights
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">
                          {analysisResults.relevant_snippets?.filter(
                            (s) => s.document_id
                          ).length || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          Preview Available
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - PDF Viewer & Results */}
          <div className="space-y-6">
            {currentDocument && (
              <div className="min-h-[600px] bg-gray-900">
                <AdobePdfViewer
                  ref={pdfViewerRef}
                  pdfFile={currentDocument}
                  onTextSelection={handleTextSelection}
                />
              </div>
            )}

            {analysisResults && (
              <DeepAiAnalysisResultsPanel
                results={analysisResults}
                onSnippetClick={navigateToSnippet}
                onPDFPreview={handlePDFPreview}
                onGeneratePodcast={handleGeneratePodcast}
                isPodcastGenerating={isPodcastGenerating}
                podcastData={podcastData}
                onTogglePodcast={togglePodcastPlayback}
                isPodcastPlaying={isPodcastPlaying}
                currentTime={currentTime}
                duration={duration}
              />
            )}
          </div>
        </div>

        {/* ✅ PDF Preview Modal */}
        <PDFPreviewModal
          snippet={previewModal.snippet}
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, snippet: null })}
        />

        {/* ✅ Enhanced Audio Element */}
        {podcastData && (
          <audio
            ref={audioRef}
            preload="metadata"
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onError={handleAudioError}
            onEnded={() => setIsPodcastPlaying(false)}
            onPlay={() => setIsPodcastPlaying(true)}
            onPause={() => setIsPodcastPlaying(false)}
          >
            <source src={podcastData.audio_url} type="audio/mpeg" />
            <source src={podcastData.audio_url} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <Loader />
              <p className="text-white mt-4">Processing with AI...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// ✅ DEEP AI ANALYSIS RESULTS PANEL with PDF Preview
const DeepAiAnalysisResultsPanel = ({
  results,
  onSnippetClick,
  onPDFPreview,
  onGeneratePodcast,
  isPodcastGenerating,
  podcastData,
  onTogglePodcast,
  isPodcastPlaying,
  currentTime = 0,
  duration = 0,
}) => {
  const [activeTab, setActiveTab] = useState("insights");

  // Format time for display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-4">
        <h3 className="text-xl font-bold text-white">
          Deep AI Analysis Results
        </h3>
        <div className="px-2 py-1 bg-green-600/20 rounded border border-green-500/30">
          <span className="text-xs text-green-300">Deep Analysis</span>
        </div>
        <div className="px-2 py-1 bg-orange-600/20 rounded border border-orange-500/30">
          <span className="text-xs text-orange-300">PDF Preview</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        {["insights", "snippets", "podcast"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-medium flex items-center transition-colors ${
              activeTab === tab
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {tab === "insights" &&
              <Lightbulb className="mr-1 text-yellow-200"/>
            }
            {tab === "insights" && "AI Insights"}
            {tab === "snippets" && "PDF Previews"}
            {tab === "podcast" && "🎧 AI Podcast"}
          </button>
        ))}
      </div>

      {/* ✅ DEEP GEMINI AI INSIGHTS TAB */}
      {activeTab === "insights" && (
        <DeepGeminiInsightsDisplay insights={results.insights} />
      )}

      {/* ✅ SNIPPETS WITH PDF PREVIEW */}
      {activeTab === "snippets" && (
        <div className="space-y-3">
          <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
            <span><GitGraph/></span>
            <span>Cross-Document Connections</span>
            <div className="px-2 py-1 bg-purple-600/20 rounded border border-purple-500/30">
              <span className="text-xs text-purple-300">Preview Ready</span>
            </div>
          </h4>
          {results.relevant_snippets?.map((snippet, index) => (
            <div
              key={index}
              className="group p-3 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-red-400 flex items-center space-x-2">
                  <span>{snippet.document_name}</span>
                  {snippet.document_id && (
                    <div className="px-1 py-0.5 bg-purple-600/20 rounded">
                      <span className="text-xs text-purple-300">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Page {snippet.page} •{" "}
                  {(snippet.similarity_score * 100).toFixed(0)}% match
                </div>
              </div>
              <div className="text-gray-300 text-sm leading-relaxed mb-3">
                {snippet.section_text}
              </div>

              {/* ✅ ENHANCED BUTTONS WITH PDF PREVIEW */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-600/50">
                <div className="flex items-center space-x-2">
                  {/* PDF Preview Button - Primary Action */}
                  {snippet.document_id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onPDFPreview(snippet);
                        document.body.style.overflow = "hidden";
                      }}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center space-x-1"
                    >
                      <span><Eye size={18}/></span>
                      <span>Preview PDF</span>
                    </button>
                  )}

                  {/* View in current viewer */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onSnippetClick(snippet);
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-1"
                  >
                    <span><ViewIcon size={17}/></span>
                    <span>View Current</span>
                  </button>

                  {/* Copy text */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(snippet.section_text);
                      toast("📋 Text copied to clipboard!");
                    }}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-1"
                  >
                    <span><Copy size={15}/></span>
                    <span>Copy Text</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {(!results.relevant_snippets ||
            results.relevant_snippets.length === 0) && (
            <div className="p-6 bg-gray-700/50 rounded-lg text-center">
              <div className="text-4xl text-gray-500 mb-2">🤔</div>
              <p className="text-gray-400">
                No cross-document connections found
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Try selecting different or longer text
              </p>
            </div>
          )}
        </div>
      )}

      {/* ✅ AI PODCAST TAB - Same as before */}
      {activeTab === "podcast" && (
        <div className="space-y-4">
          {/* Header */}
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-300" aria-hidden="true" />
            <span>AI-Generated Podcast</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-purple-500/30 bg-purple-600/10">
              <CheckCircle2
                className="w-3.5 h-3.5 text-purple-300"
                aria-hidden="true"
              />
              <span className="text-xs text-purple-200">Deep Analysis</span>
            </span>
          </h4>

          {/* Empty state (Create) */}
          {!podcastData && !isPodcastGenerating && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/40">
              <div className="text-center">
                <div className="mx-auto mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/40">
                  <Radio
                    className="w-6 h-6 text-purple-300"
                    aria-hidden="true"
                  />
                </div>
                <h5 className="text-xl font-semibold text-white mb-2">
                  Create AI Podcast
                </h5>
                <p className="text-gray-300 text-sm mb-6">
                  Generate an engaging 2-speaker podcast discussion powered by
                  deep AI insights from your cross-document analysis.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onGeneratePodcast}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                >
                  <span className="inline-flex items-center gap-2">
                    <Radio className="w-4 h-4" aria-hidden="true" />
                    <span>Generate Deep AI Podcast</span>
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Generating state */}
          {isPodcastGenerating && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/40">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2
                    className="w-5 h-5 text-purple-300 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="text-white font-medium">
                    Generating Deep AI Podcast...
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-purple-200 mb-4">
                  <div className="inline-flex items-center justify-center gap-2">
                    <Brain className="w-4 h-4" aria-hidden="true" />
                    <span>Processing AI insights</span>
                  </div>
                  <div className="inline-flex items-center justify-center gap-2">
                    <Waves className="w-4 h-4" aria-hidden="true" />
                    <span>Creating 2-speaker discussion</span>
                  </div>
                  <div className="inline-flex items-center justify-center gap-2">
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    <span>Rendering audio</span>
                  </div>
                </div>

                <div className="mt-2 w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          )}

          {/* Ready state */}
          {podcastData && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-white font-bold mb-1 flex items-center gap-2">
                    <Radio
                      className="w-4 h-4 text-purple-300"
                      aria-hidden="true"
                    />
                    Deep AI Podcast Ready
                  </h5>
                  <p className="text-gray-300 text-sm">
                    Duration: {podcastData.duration || "~5 minutes"} •
                    AI-Enhanced Discussion
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={onTogglePodcast}
                    className={`inline-flex items-center gap-2 ${
                      isPodcastPlaying
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white font-medium`}
                  >
                    {isPodcastPlaying ? (
                      <>
                        <Pause className="w-4 h-4" aria-hidden="true" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" aria-hidden="true" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <PodcastMode
                analysis={podcastData.script}
                outline={podcastData.selected_text_preview}
                isMultipleFiles={false}
                comparison={podcastData.speakers}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const colorMap = {
  blue: {
    base: "text-blue-300",
    badge: "bg-blue-600/10 border-blue-500/30 text-blue-300",
    active: "bg-blue-600 text-white",
    dot: "bg-blue-500 text-white",
  },
  red: {
    base: "text-red-300",
    badge: "bg-red-600/10 border-red-500/30 text-red-300",
    active: "bg-red-600 text-white",
    dot: "bg-red-500 text-white",
  },
  green: {
    base: "text-emerald-300",
    badge: "bg-emerald-600/10 border-emerald-500/30 text-emerald-300",
    active: "bg-emerald-600 text-white",
    dot: "bg-emerald-500 text-white",
  },
  yellow: {
    base: "text-yellow-300",
    badge: "bg-yellow-600/10 border-yellow-500/30 text-yellow-300",
    active: "bg-yellow-600 text-white",
    dot: "bg-yellow-500 text-white",
  },
  purple: {
    base: "text-purple-300",
    badge: "bg-purple-600/10 border-purple-500/30 text-purple-300",
    active: "bg-purple-600 text-white",
    dot: "bg-purple-500 text-white",
  },
  indigo: {
    base: "text-indigo-300",
    badge: "bg-indigo-600/10 border-indigo-500/30 text-indigo-300",
    active: "bg-indigo-600 text-white",
    dot: "bg-indigo-500 text-white",
  },
  pink: {
    base: "text-pink-300",
    badge: "bg-pink-600/10 border-pink-500/30 text-pink-300",
    active: "bg-pink-600 text-white",
    dot: "bg-pink-500 text-white",
  },
  orange: {
    base: "text-orange-300",
    badge: "bg-orange-600/10 border-orange-500/30 text-orange-300",
    active: "bg-orange-600 text-white",
    dot: "bg-orange-500 text-white",
  },
};

const iconMap = {
  deep_similarities: Link2,
  strategic_contradictions: Zap,
  breakthrough_connections: Rocket,
  strategic_insights: Lightbulb,
  evolutionary_variations: Repeat2,
  powerful_examples: FileText,
  knowledge_synthesis: Brain,
  critical_limitations: AlertTriangle,
};

const qualityIconMap = {
  Exceptional: Trophy,
  Advanced: Target,
  Good: ThumbsUp,
  Basic: BarChart2,
};

const Metric = ({ value, label, className = "" }) => (
  <div className={`text-center ${className}`}>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

const Badge = ({ colorKey = "indigo", children }) => {
  const cfg = colorMap[colorKey] || colorMap.indigo;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${cfg.badge}`}
    >
      {children}
    </span>
  );
};

const DeepGeminiInsightsDisplay = ({ insights }) => {
  const [activeInsight, setActiveInsight] = useState("deep_similarities");
  const [isExpanded, setIsExpanded] = useState(false);

  const insightCategories = [
    {
      key: "deep_similarities",
      title: "Deep Similarities",
      color: "blue",
      description: "Advanced conceptual alignments",
    },
    {
      key: "strategic_contradictions",
      title: "Strategic Conflicts",
      color: "red",
      description: "Fundamental disagreements",
    },
    {
      key: "breakthrough_connections",
      title: "Breakthrough Links",
      color: "green",
      description: "Revolutionary insights",
    },
    {
      key: "strategic_insights",
      title: "Strategic Intelligence",
      color: "yellow",
      description: "Actionable recommendations",
    },
    {
      key: "evolutionary_variations",
      title: "Evolution Patterns",
      color: "purple",
      description: "How concepts evolved",
    },
    {
      key: "powerful_examples",
      title: "Compelling Evidence",
      color: "indigo",
      description: "Strong supporting cases",
    },
    {
      key: "knowledge_synthesis",
      title: "Meta-Analysis",
      color: "pink",
      description: "Higher-order insights",
    },
    {
      key: "critical_limitations",
      title: "Critical Constraints",
      color: "orange",
      description: "Important limitations",
    },
  ];

  const safeArray = (val) => (Array.isArray(val) ? val : []);
  const allInsights = useMemo(
    () => insightCategories.flatMap((c) => safeArray(insights?.[c.key])),
    [insights]
  );

  const totalInsights = allInsights.length;
  const avgLength = useMemo(() => {
    if (!totalInsights) return 0;
    const sum = allInsights.reduce((acc, s) => acc + (s?.length || 0), 0);
    return Math.round(sum / totalInsights);
  }, [allInsights, totalInsights]);

  const categoriesWithContent = useMemo(
    () =>
      insightCategories.filter((c) => safeArray(insights?.[c.key]).length > 0)
        .length,
    [insights]
  );

  const getInsightQuality = (insightsObj) => {
    const arr = Object.values(insightsObj || {}).flat();
    const t = arr.length;
    const avg =
      t > 0
        ? Math.round(arr.reduce((acc, i) => acc + (i?.length || 0), 0) / t)
        : 0;

    if (t > 15 && avg > 100) return { level: "Exceptional", color: "green" };
    if (t > 10 && avg > 80) return { level: "Advanced", color: "blue" };
    if (t > 5 && avg > 60) return { level: "Good", color: "yellow" };
    return { level: "Basic", color: "orange" };
  };

  const quality = getInsightQuality(insights || {});
  const QualityIcon = qualityIconMap[quality.level] || BarChart2;

  const ActiveIcon = iconMap[activeInsight] || Lightbulb;
  const activeCategory =
    insightCategories.find((c) => c.key === activeInsight) ||
    insightCategories[0];
  const activeColorCfg = colorMap[activeCategory.color] || colorMap.indigo;
  const activeItems = safeArray(insights?.[activeCategory.key]);

  return (
    <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-amber-100 border border-white/10">
            <Lightbulb className="w-5 h-5 text-yellow-800" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white leading-tight">
              Insights
            </h4>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 p-4 bg-gray-900/60 border border-gray-800 rounded-lg">
        <Metric value={totalInsights} label="AI Insights" />
        <Metric value={categoriesWithContent} label="Categories" />
        <Metric value={avgLength || 0} label="Avg Depth (chars)" />
        <Metric value="AI" label="Generated" />
      </div>

      {/* Category Tabs */}
      <nav
        className="flex flex-wrap gap-2 mb-5"
        aria-label="Insight Categories"
      >
        {insightCategories.map(({ key, title, color }) => {
          const count = safeArray(insights?.[key]).length;
          const cfg = colorMap[color] || colorMap.indigo;
          const IconEl = iconMap[key] || Lightbulb;
          const isActive = activeInsight === key;
          return (
            <button
              key={key}
              onClick={() => setActiveInsight(key)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                isActive
                  ? `${cfg.active} border-transparent`
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
              }`}
              title={title}
              role="tab"
              aria-selected={isActive}
            >
              <IconEl
                className={`w-3.5 h-3.5 ${isActive ? "text-white" : cfg.base}`}
                aria-hidden="true"
              />
              <span>{title}</span>
              {count > 0 && (
                <span
                  className={`ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] rounded-full ${cfg.dot}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Insight Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ActiveIcon
            className={`w-4 h-4 ${activeColorCfg.base}`}
            aria-hidden="true"
          />
          <h5 className="text-white font-semibold">
            {activeCategory.title}{" "}
            <span className="text-sm text-gray-400">
              ({activeItems.length})
            </span>
          </h5>
        </div>
        <p className="text-xs text-gray-400">{activeCategory.description}</p>
      </div>

      {/* Active Insight Content */}
      <section className="space-y-3">
        {activeItems.length > 0 ? (
          activeItems.map((insight, idx) => (
            <article
              key={idx}
              className="group relative p-4 bg-gray-900/60 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900 transition-colors"
            >
              <header className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {insight}
                  </p>

                  {/* Metadata */}
                  <footer className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5" />
                        {insight?.length || 0} chars
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        AI Generated
                      </span>
                      {typeof insight === "string" &&
                        /page|pg|p\.\s?\d+/i.test(insight) && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              With Reference
                            </span>
                          </>
                        )}
                    </div>
                  </footer>
                </div>
              </header>
            </article>
          ))
        ) : (
          <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-800 text-center">
            <p className="text-gray-300">
              No {activeCategory.title.toLowerCase()} found in current analysis.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try selecting more or different text for richer AI insights.
            </p>
          </div>
        )}
      </section>
    </section>
  );
};

export default UploadSection;
