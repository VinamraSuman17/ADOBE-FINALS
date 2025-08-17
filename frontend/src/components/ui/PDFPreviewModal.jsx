import React, { useState, useEffect, useRef } from "react";
import AdobePdfViewer from "../ui/AdobePdfViewer";
import Loader from "../common/Loader";
import { toast } from "react-toastify";
import NormalViewer from "./PdfViewer";

const PDFPreviewModal = ({ snippet, isOpen, onClose }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(snippet?.page || 1);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (isOpen && snippet?.document_id) {
      fetchPDF();
    }
  }, [isOpen, snippet]);

  useEffect(() => {
    if (pdfFile && viewerRef.current && snippet?.page) {
      const timer = setTimeout(() => {
        try {
          if (viewerRef.current?.goToPage && snippet.page > 1) {
            viewerRef.current.goToPage(snippet.page - 1); // 0-based
            setCurrentPage(snippet.page);
          }
        } catch (err) {
          console.error("⚠️ Failed to navigate to page:", err);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pdfFile, snippet?.page]);

  const fetchPDF = async () => {
    setIsLoading(true);
    setError(null);
    try {

      // Try metadata endpoint first
      let file = null;
      try {
        const metadataResponse = await fetch(
          `http://localhost:8080/pdf-metadata/${snippet.document_id}`
        );
        if (metadataResponse.ok) {
          const metadataResult = await metadataResponse.json();
          if (metadataResult.success && metadataResult.pdf_data) {
            file = await fetchAndCreateFile(
              metadataResult.pdf_data.file_url,
              metadataResult.pdf_data.filename
            );
          }
        }
      } catch (err) {
        console.warn("⚠️ Metadata fetch failed:", err.message);
      }

      // Fallback to direct access
      if (!file) {
        const directUrl = `http://localhost:8080/files/${snippet.document_id}.pdf`;
        file = await fetchAndCreateFile(
          directUrl,
          snippet.document_name || "document.pdf"
        );
      }

      setPdfFile(file);
      toast(`📖 Preview opened: ${file.name}`);
    } catch (err) {
      console.error("❌ PDF preview fetch failed:", err);
      setError(err.message);
      toast.error(`Failed to load PDF: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndCreateFile = async (url, name) => {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch PDF from ${url} (${response.status})`);
    const blob = await response.blob();
    return new File([blob], name, {
      type: "application/pdf",
      lastModified: Date.now(),
    });
  };

  const handleClose = () => {
    setPdfFile(null);
    setError(null);
    setIsLoading(true);
    onClose();
    document.body.style.overflow = "auto";
  };

  const handleCopyLink = () => {
    const link = `http://localhost:8080/files/${snippet.document_id}.pdf#page=${snippet.page}`;
    navigator.clipboard.writeText(link);
    toast("🔗 PDF link copied!");
  };

  const handleDownload = () => {
    const url = pdfFile
      ? URL.createObjectURL(pdfFile)
      : `http://localhost:8080/files/${snippet.document_id}.pdf`;

    const link = document.createElement("a");
    link.href = url;
    link.download = snippet.document_name || "document.pdf";
    link.click();

    if (pdfFile) URL.revokeObjectURL(url);
    toast("📥 Download started!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-[100vh] pt-[15vh] pb-[2vh] bg-black/60 flex flex-col items-center justify-center z-50 overflow-y-scroll">
      <div className="bg-gray-900 rounded-lg w-11/12 max-w-7xl flex flex-col scale-[0.85]">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>📄 {snippet.document_name}</span>
              <div className="px-2 py-1 bg-purple-600/20 rounded border border-purple-500/30">
                <span className="text-xs text-purple-300">Preview</span>
              </div>
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-400">
                Target Page: {snippet.page} | Relevance:{" "}
                {(snippet.similarity_score * 100).toFixed(1)}%
              </p>
              <div className="px-2 py-1 bg-green-600/20 rounded border border-green-500/30">
                <span className="text-xs text-green-300">AI Match</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              🔗 Copy Link
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              📥 Download
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader />
              <p className="text-white mt-4 text-lg">Loading PDF...</p>
              <p className="text-gray-400 text-sm">{snippet.document_name}</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-6xl text-red-500 mb-4">❌</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Preview Failed
              </h3>
              <p className="text-gray-400 mb-2">{error}</p>
              <div className="flex space-x-2">
                <button
                  onClick={fetchPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔄 Retry
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  📥 Download
                </button>
              </div>
            </div>
          )}

          {pdfFile && !isLoading && !error && (
            <div className="h-full bg-gray-800 rounded-lg p-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  PDF Preview - Page {snippet.page}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    Current: {currentPage}
                  </span>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg">
                <div className="w-full h-[80vh] overflow-y-scroll">
                  <NormalViewer
                    pdfFile= { `http://localhost:8080/files/${snippet.document_id}.pdf#page=${snippet.page}`}
                    fileName="Sample.pdf"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Matched: "{snippet.section_text.substring(0, 100)}..."
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(snippet.section_text);
              toast("📋 Text copied!");
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            📋 Copy Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
