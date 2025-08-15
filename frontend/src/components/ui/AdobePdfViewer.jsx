import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const AdobePdfViewer = forwardRef(({ pdfFile, onTextSelection, isUploaded = false }, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [adobeView, setAdobeView] = useState(null);
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useImperativeHandle(ref, () => ({
    navigateToPage: (pageNumber) => {
      console.log(`🔗 Attempting to navigate to page ${pageNumber + 1}`);
      if (adobeView?.getAPIs) {
        adobeView.getAPIs().then((apis) => {
          apis.gotoLocation(pageNumber + 1)
            .then(() => console.log(`✅ Successfully navigated to page ${pageNumber + 1}`))
            .catch(error => console.error('❌ Navigation failed:', error));
        }).catch(error => {
          console.error('❌ Failed to get APIs:', error);
        });
      } else {
        console.warn('⚠️ Adobe viewer not ready for navigation');
      }
    }
  }));

  // ✅ Check if Adobe SDK is ready
  useEffect(() => {
    const checkSDKReady = () => {
      if (window.AdobeDC && window.AdobeDC.View) {
        console.log('✅ Adobe SDK already available');
        setIsSDKReady(true);
      } else {
        console.log('⏳ Waiting for Adobe SDK to load...');
        
        const handleSDKReady = () => {
          console.log('✅ Adobe SDK ready event triggered');
          setIsSDKReady(true);
        };
        
        document.addEventListener('adobe_dc_view_sdk.ready', handleSDKReady);
        
        // Cleanup
        return () => {
          document.removeEventListener('adobe_dc_view_sdk.ready', handleSDKReady);
        };
      }
    };

    if (document.readyState === 'complete') {
      checkSDKReady();
    } else {
      window.addEventListener('load', checkSDKReady);
      return () => window.removeEventListener('load', checkSDKReady);
    }
  }, []);

  // ✅ Initialize PDF viewer with proper timing
  useEffect(() => {
    if (isSDKReady && pdfFile) {
      console.log('🎯 Conditions met - SDK ready and file available');
      console.log('🎯 onTextSelection prop received:', typeof onTextSelection);
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        initializePdfViewer();
      }, 100);
    }
  }, [isSDKReady, pdfFile, onTextSelection]);

  const initializePdfViewer = async () => {
  try {
    setIsLoading(true);
    setError(null);
    retryCountRef.current += 1;

    console.log(`🔍 Initialization attempt ${retryCountRef.current}/${maxRetries}`);

    // ✅ Check SDK loaded
    if (!window.AdobeDC || !window.AdobeDC.View) {
      throw new Error("Adobe SDK not loaded");
    }

    // ✅ Wait for target element
    const viewerElement = await new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      const checkElement = () => {
        attempts++;
        const el = document.getElementById("adobe-dc-view");
        if (el) return resolve(el);
        if (attempts >= maxAttempts) return reject(new Error("#adobe-dc-view not found"));
        setTimeout(checkElement, 100);
      };
      checkElement();
    });

    viewerElement.innerHTML = "";
    console.log("🧹 Cleared previous viewer content");

    // ✅ Init Adobe View
    const adobeDCView = new window.AdobeDC.View({
      clientId: import.meta.env.VITE_ADOBE_API_KEY || "demo-client-id",
      divId: "adobe-dc-view"
    });

    // ✅ Register profile callback
    adobeDCView.registerCallback(
      window.AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API,
      () => Promise.resolve({
        userProfile: { name: "Adobe Challenge User", email: "user@adobe-challenge.com" }
      })
    );

    let contentConfig;
    if (typeof pdfFile === "string") {
      // 📌 Deep link case
      console.log("🌐 Using PDF URL:", pdfFile);
      contentConfig = {
        location: {
          url: pdfFile
          // headers: [{ key: "Authorization", value: "Bearer token" }] // if needed
        }
      };
    } else if (pdfFile instanceof File) {
      // 📌 File object case
      console.log("📄 Converting file to ArrayBuffer...");
      const arrayBuffer = await pdfFile.arrayBuffer();
      console.log(`✅ File converted: ${arrayBuffer.byteLength} bytes`);
      contentConfig = {
        promise: Promise.resolve(new Uint8Array(arrayBuffer)),
        mimeType: "application/pdf"
      };
    } else {
      throw new Error("Invalid pdfFile type");
    }

    // ✅ Preview file
    const previewFilePromise = adobeDCView.previewFile(
      {
        content: contentConfig,
        metaData: {
          fileName: typeof pdfFile === "string" ? "document.pdf" : pdfFile.name,
          id: `pdf-${Date.now()}`
        }
      },
      {
        embedMode: "IN_LINE",
        showDownloadPDF: false,
        showPrintPDF: false,
        showLeftHandPanel: true,
        showAnnotationTools: false,
        showPageControls: true,
        showZoomControl: true,
        enableFormFilling: false,
        showBookmarks: true,
        enableTextSelection: true
      }
    );

    previewFilePromise
      .then((adobeViewer) => {
        console.log("✅ PDF rendered successfully!");
        // Register selection listener
        adobeDCView.registerCallback(
          window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
          async (event) => {
            if (event.type === "PREVIEW_SELECTION_END") {
              const apis = await adobeViewer.getAPIs();
              const selectedContent = await apis.getSelectedContent();
              if (selectedContent?.data?.length > 0) {
                const selectionData = {
                  text: selectedContent.data,
                  page: event.data?.pageNumber || 1,
                  coordinates: event.data?.coordinates || null,
                  timestamp: Date.now()
                };
                showSelectionFeedback(selectionData.text.substring(0, 100));
                onTextSelection?.(selectionData);
              }
            }
          },
          { listenOn: ["PREVIEW_SELECTION_END"], enableFilePreviewEvents: true }
        );
        console.log("✅ Text selection callback registered");
      })
      .catch((err) => {
        console.error("❌ PDF render failed:", err);
      });

    setAdobeView(adobeDCView);
    retryCountRef.current = 0;
    setIsLoading(false);
  } catch (err) {
    console.error("❌ Adobe PDF Viewer Error:", err);
    if (retryCountRef.current < maxRetries) {
      console.log(`🔄 Retrying in ${retryCountRef.current} seconds...`);
      setTimeout(initializePdfViewer, 1000 * retryCountRef.current);
    } else {
      setError(`Failed after ${maxRetries} attempts: ${err.message}`);
      setIsLoading(false);
      retryCountRef.current = 0;
    }
  }
};


  const showSelectionFeedback = (selectedText) => {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <div class="font-medium">✅ Text Selected for Analysis</div>
        <div class="text-sm opacity-90">"${selectedText}${selectedText.length > 100 ? '...' : ''}"</div>
      </div>
    `;
    notification.className = 'fixed top-4 right-4 z-50 transition-all duration-300';
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  };

  const handleRetry = () => {
    retryCountRef.current = 0;
    if (pdfFile && isSDKReady) {
      initializePdfViewer();
    }
  };

  // ✅ Always render the adobe-dc-view div when pdfFile exists
  const shouldShowViewer = pdfFile && isSDKReady;

  return (
    <div ref={containerRef} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Adobe PDF Preview
        {isUploaded && <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded">Uploaded</span>}
        {!isSDKReady && <span className="ml-2 px-2 py-1 bg-orange-600 text-xs rounded">SDK Loading</span>}
      </h3>
      
      {/* ✅ Always render adobe-dc-view div when we have a file */}
      {pdfFile && (
        <>
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-700/80 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading Adobe PDF Viewer...</p>
                <p className="text-xs text-gray-500 mt-2">
                  Attempt {retryCountRef.current}/{maxRetries}
                </p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 bg-red-900/20 rounded-lg flex items-center justify-center z-10">
              <div className="text-center text-red-400 p-4">
                <p className="mb-4">⚠️ {error}</p>
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry Loading
                </button>
              </div>
            </div>
          )}


          {/* ✅ Adobe DC View Container - Always present */}
          <div className="relative overflow-y-scroll h-[700px]">
            <div 
              id="adobe-dc-view" 
              className="border border-gray-600 rounded-lg h-96 bg-white"
              style={{ 
                minHeight: '400px', 
                width: '100%',
                display: shouldShowViewer ? 'block' : 'block' // Always visible
              }}
            />
          </div>
        </>
      )}

      {/* No file selected state */}
      {!pdfFile && (
        <div className="border border-gray-600 rounded-lg h-96 flex items-center justify-center bg-gray-700">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium">No Document Selected</p>
            <p className="text-sm mt-2">Upload a PDF to preview here</p>
          </div>
        </div>
      )}

      {/* SDK not ready state */}
      {!isSDKReady && !pdfFile && (
        <div className="border border-orange-600 rounded-lg h-96 flex items-center justify-center bg-orange-900/20">
          <div className="text-center text-orange-400">
            <div className="animate-pulse text-4xl mb-4">⏳</div>
            <p className="text-lg font-medium">Adobe SDK Loading...</p>
            <p className="text-sm mt-2">Please wait while Adobe PDF Embed API initializes</p>
          </div>
        </div>
      )}
    </div>
  );
});

AdobePdfViewer.displayName = 'AdobePdfViewer';

export default AdobePdfViewer;
