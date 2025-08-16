import React, { useState, useRef, useCallback } from "react";
import Button from "../ui/Button";
import AdobePdfViewer from "../ui/AdobePdfViewer";
import Loader from "../common/Loader";
import PDFPreviewModal from "../ui/PDFPreviewModal";
import { toast } from "react-toastify";
import { CgBulb } from "react-icons/cg";
import PodcastMode from "./PodcastMode";

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

      console.log(
        `✅ Uploaded ${data.documents_processed} prior documents with unique IDs`
      );
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

      console.log(`✅ Current document uploaded: ${data.filename}`);
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

    console.log("📝 Text selected for deep analysis:", selectionData);
    setSelectedText(selectionData);
    setAnalysisLoading(true);
    setIsDeepAiAnalysisLoading(true);

    try {
      const formData = new FormData();
      formData.append("selection_text", selectionData.text);
      formData.append("page_number", selectionData.page.toString());
      formData.append("user_session_id", sessionId);

      console.log("🤖 Requesting DEEP AI analysis...");
      const response = await fetch("http://localhost:8080/analyze-selection/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const results = await response.json();
      setAnalysisResults(results);

      console.log("✅ Deep AI analysis completed:", results);
      toast(
        `🤖 Deep AI insights generated! Found ${
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
      console.log("🎧 Generating DEEP AI-enhanced podcast...");

      const response = await fetch("http://localhost:8080/generate-podcast/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_data: analysisResults,
          selected_text: selectedText?.text || "",
          session_id: sessionId,
          voice_config: {
            speaker1: "AI Research Host",
            speaker2: "Deep Analysis Expert",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const podcastResult = await response.json();
      console.log(podcastResult);
      if (podcastResult.success) {
        setPodcastData(podcastResult.podcast);
        console.log(
          "✅ Deep AI-enhanced podcast generated:",
          podcastResult.podcast
        );
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
                console.log("✅ Audio playback started");
                setIsPodcastPlaying(true);
              })
              .catch((error) => {
                console.error("❌ Audio playback failed:", error);
                toast("Audio playback failed. Please try again.");
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
    toast("Audio playback error. Please try regenerating the podcast.");
    setIsPodcastPlaying(false);
  };

  // Navigate to snippet location
  const navigateToSnippet = (snippet) => {
    console.log("🔗 Navigating to:", snippet);
    if (pdfViewerRef.current?.navigateToPage && snippet.page) {
      pdfViewerRef.current.navigateToPage(snippet.page - 1);
    }
  };

  // ✅ Handle PDF Preview
  const handlePDFPreview = (snippet) => {
    if (snippet.document_id) {
      setPreviewModal({ isOpen: true, snippet });
      console.log(
        "👁️ Opening PDF preview for:",
        snippet.document_name,
        "at page",
        snippet.page
      );
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
              <span className="text-xl">🧠</span>
              <span className="text-sm text-green-300 font-medium">
                Deep Analysis Engine
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-full border border-orange-500/30">
              <span className="text-xl">👁️</span>
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
              <h3 className="text-2xl font-bold text-white mb-4">
                📚 Step 1: Build AI Knowledge Base
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
                    <div className="text-6xl text-gray-500 mb-4">🧠</div>
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
                    <span className="text-2xl">✅</span>
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
                        <span>🧠</span>
                        <span className="truncate">{file.name}</span>
                        <div className="px-1 py-0.5 bg-purple-600/20 rounded">
                          <span className="text-xs text-purple-300">👁️</span>
                        </div>
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
                <h3 className="text-2xl font-bold text-white mb-4">
                  📖 Step 2: Upload Analysis Target
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
                      <span className="text-2xl">✅</span>
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
                className={`bg-gray-800 rounded-lg p-6 border ${
                  stage === "analysis" ? "border-red-600" : "border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    🤖 Step 3: Deep AI Analysis
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
                      "{selectedText.text.substring(0, 200)}
                      {selectedText.text.length > 200 ? "..." : ""}"
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
                        <span>🧠</span>
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
                      <span className="text-xl">🎉</span>
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
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span>Current Document Viewer</span>
                  <div className="px-2 py-1 bg-blue-600/20 rounded border border-blue-500/30">
                    <span className="text-xs text-blue-300">AI Ready</span>
                  </div>
                </h3>
                <div className="min-h-[600px] bg-gray-900 rounded-lg">
                  <AdobePdfViewer
                    ref={pdfViewerRef}
                    pdfFile={currentDocument}
                    onTextSelection={handleTextSelection}
                  />
                </div>
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
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
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
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {tab === "insights" && "🧠 AI Insights"}
            {tab === "snippets" && "📋 PDF Previews"}
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
            <span>📋 Cross-Document Connections</span>
            <span className="text-sm text-gray-400">
              ({results.relevant_snippets?.length || 0})
            </span>
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
                  <span>📄 {snippet.document_name}</span>
                  {snippet.document_id && (
                    <div className="px-1 py-0.5 bg-purple-600/20 rounded">
                      <span className="text-xs text-purple-300">
                        👁️ Preview
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
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded flex items-center space-x-1"
                    >
                      <span>👁️</span>
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
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <span>🔍</span>
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
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <span>📋</span>
                    <span>Copy Text</span>
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  AI Relevance: {(snippet.similarity_score * 100).toFixed(1)}%
                  {snippet.document_id && (
                    <span className="ml-2 text-purple-400">
                      • Preview Available
                    </span>
                  )}
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
          <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
            <span>🎧 AI-Generated Podcast</span>
            <div className="px-2 py-1 bg-purple-600/20 rounded border border-purple-500/30">
              <span className="text-xs text-purple-300">Deep Analysis</span>
            </div>
          </h4>

          {!podcastData && !isPodcastGenerating && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/40">
              <div className="text-center">
                <div className="text-6xl mb-4">🎙️</div>
                <h5 className="text-xl font-bold text-white mb-2">
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
                  <span className="flex items-center space-x-2">
                    <span>🤖</span>
                    <span>Generate Deep AI Podcast</span>
                  </span>
                </Button>
              </div>
            </div>
          )}

          {isPodcastGenerating && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/40">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Loader />
                  <span className="text-white font-medium">
                    Generating Deep AI Podcast...
                  </span>
                </div>
                <div className="space-y-2 text-sm text-purple-300">
                  <div className="flex items-center justify-center space-x-2">
                    <span>🧠</span>
                    <span>Processing AI insights...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎙️</span>
                    <span>Creating intelligent 2-speaker discussion...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>🔊</span>
                    <span>Generating professional audio...</span>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          )}

          {podcastData && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-white font-bold mb-1 flex items-center space-x-2">
                    <span>🎉 Deep AI Podcast Ready!</span>
                  </h5>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-300 text-sm">
                      Duration: {podcastData.duration || "~5 minutes"} •
                      AI-Enhanced Discussion
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={onTogglePodcast}
                    className={`${
                      isPodcastPlaying
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white font-medium`}
                  >
                    {isPodcastPlaying ? "⏸️ Pause" : "▶️ Play"}
                  </Button>
                </div>
              </div>
              <div>{`${podcastData.audio_url}`}</div>
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

// ✅ DEEP GEMINI AI INSIGHTS COMPONENT - Same as before
const DeepGeminiInsightsDisplay = ({ insights }) => {
  const [activeInsight, setActiveInsight] = useState("deep_similarities");
  const [isExpanded, setIsExpanded] = useState(false);

  const insightCategories = [
    {
      key: "deep_similarities",
      title: "Deep Similarities",
      icon: "🔗",
      color: "blue",
      description: "Advanced conceptual alignments",
    },
    {
      key: "strategic_contradictions",
      title: "⚡ Strategic Conflicts",
      icon: "⚡",
      color: "red",
      description: "Fundamental disagreements",
    },
    {
      key: "breakthrough_connections",
      title: "🚀 Breakthrough Links",
      icon: "🚀",
      color: "green",
      description: "Revolutionary insights",
    },
    {
      key: "strategic_insights",
      title: "💡 Strategic Intelligence",
      icon: "💡",
      color: "yellow",
      description: "Actionable recommendations",
    },
    {
      key: "evolutionary_variations",
      title: "🔄 Evolution Patterns",
      icon: "🔄",
      color: "purple",
      description: "How concepts evolved",
    },
    {
      key: "powerful_examples",
      title: "📋 Compelling Evidence",
      icon: "📋",
      color: "indigo",
      description: "Strong supporting cases",
    },
    {
      key: "knowledge_synthesis",
      title: "🧠 Meta-Analysis",
      icon: "🧠",
      color: "pink",
      description: "Higher-order insights",
    },
    {
      key: "critical_limitations",
      title: "⚠️ Critical Constraints",
      icon: "⚠️",
      color: "orange",
      description: "Important limitations",
    },
  ];

  const getInsightQuality = (insights) => {
    const totalInsights = Object.values(insights).flat().length;
    const avgLength =
      Object.values(insights)
        .flat()
        .reduce((acc, insight) => acc + insight.length, 0) / totalInsights;

    if (totalInsights > 15 && avgLength > 100)
      return { level: "Exceptional", color: "green", icon: "🏆" };
    if (totalInsights > 10 && avgLength > 80)
      return { level: "Advanced", color: "blue", icon: "🎯" };
    if (totalInsights > 5 && avgLength > 60)
      return { level: "Good", color: "yellow", icon: "👍" };
    return { level: "Basic", color: "orange", icon: "📊" };
  };

  const quality = getInsightQuality(insights);

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-xl border border-purple-500/40">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse">
            <span className="text-2xl">
              <CgBulb />
            </span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">Insights</h4>
          </div>
        </div>
      </div>

      {/* AI Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-800/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Object.values(insights).flat().length}
          </div>
          <div className="text-xs text-gray-400">AI Insights</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {
              Object.keys(insights).filter((k) => insights[k]?.length > 0)
                .length
            }
          </div>
          <div className="text-xs text-gray-400">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(
              Object.values(insights)
                .flat()
                .reduce((acc, insight) => acc + insight.length, 0) /
                Object.values(insights).flat().length
            ) || 0}
          </div>
          <div className="text-xs text-gray-400">Avg Depth</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">AI</div>
          <div className="text-xs text-gray-400">Generated</div>
        </div>
      </div>

      {/* Enhanced Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {insightCategories.map(({ key, title, icon, color, description }) => {
          const count = insights[key]?.length || 0;
          return (
            <button
              key={key}
              onClick={() => setActiveInsight(key)}
              className={`relative px-3 py-2 rounded-full text-sm font-medium transition-all group ${
                activeInsight === key
                  ? `bg-${color}-600 text-white shadow-lg scale-105`
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title={description}
            >
              <span className="mr-1">{icon}</span>
              {title.split(" ").pop()}
              {count > 0 && (
                <div
                  className={`absolute -top-2 -right-2 w-5 h-5 bg-${color}-500 text-xs rounded-full flex items-center justify-center text-white`}
                >
                  {count}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Enhanced Active Insight Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-lg font-semibold text-white flex items-center space-x-2">
            <span>
              {insightCategories.find((cat) => cat.key === activeInsight)?.icon}
            </span>
            <span>
              {
                insightCategories.find((cat) => cat.key === activeInsight)
                  ?.title
              }
            </span>
            <span className="text-sm text-gray-400">
              ({insights[activeInsight]?.length || 0})
            </span>
          </h5>
          <div className="text-xs text-gray-400">
            {
              insightCategories.find((cat) => cat.key === activeInsight)
                ?.description
            }
          </div>
        </div>

        <div className="space-y-4">
          {insights[activeInsight]?.length > 0 ? (
            insights[activeInsight].map((insight, idx) => (
              <div
                key={idx}
                className="group relative p-5 bg-gray-800/60 rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-all hover:bg-gray-800/80"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 leading-relaxed">{insight}</p>

                    {/* Enhanced insight metadata */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>🧠 {insight.length} chars</span>
                        <span>•</span>
                        <span>🤖 AI Generated</span>
                        {insight.includes("Page") && (
                          <>
                            <span>•</span>
                            <span>📄 With Reference</span>
                          </>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs text-purple-400 hover:text-purple-300">
                          💡 Expand Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-600/30 text-center">
              <div className="text-4xl text-gray-500 mb-2">🤔</div>
              <p className="text-gray-400 italic">
                No {activeInsight.replace("_", " ")} found in current analysis
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Try selecting more or different text for richer AI insights
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
