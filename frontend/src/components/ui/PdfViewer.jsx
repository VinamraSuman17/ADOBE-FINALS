import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const NormalViewer = forwardRef(({ pdfFile }, ref) => {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const viewerRef = useRef(null);
  const viewerId = useRef(`adobe-dc-view-${Date.now()}`);
  const containerDivId = useRef(`adobe-dc-container-${Date.now()}`);

  useImperativeHandle(ref, () => ({
    navigateToPage: (pageNumber) => {
      if (viewerRef.current?.getAPIs) {
        viewerRef.current.getAPIs().then((apis) => {
          // Delay add करें navigation के लिए
          setTimeout(() => {
            try {
              apis.gotoLocation(pageNumber + 1);
              console.log(`Navigating to page: ${pageNumber + 1}`);
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }, 500);
        }).catch((error) => {
          console.error("API access error:", error);
        });
      }
    },
  }));

  // SDK ready check
  useEffect(() => {
    const checkSDK = () => {
      if (window.AdobeDC?.View) {
        console.log("Adobe SDK loaded successfully");
        setIsSDKReady(true);
      } else {
        console.log("Adobe SDK not ready yet");
      }
    };

    if (window.AdobeDC?.View) {
      checkSDK();
    } else {
      const handleSDKReady = () => {
        console.log("Adobe SDK ready event fired");
        setIsSDKReady(true);
      };

      document.addEventListener("adobe_dc_view_sdk.ready", handleSDKReady);
      return () => {
        document.removeEventListener("adobe_dc_view_sdk.ready", handleSDKReady);
      };
    }
  }, []);

  // PDF viewer initialization
  useEffect(() => {
    console.log("PDF File:", pdfFile);
    console.log("SDK Ready:", isSDKReady);

    if (!isSDKReady || !pdfFile) {
      console.log("Not ready to initialize viewer");
      return;
    }

    // Clear previous viewer instance
    if (viewerRef.current) {
      try {
        if (viewerRef.current.unmount) {
          viewerRef.current.unmount();
        }
      } catch (error) {
        console.error("Error unmounting previous viewer:", error);
      }
      viewerRef.current = null;
    }

    // Clear container
    const container = document.getElementById(viewerId.current);
    if (container) {
      container.innerHTML = "";
    }

    console.log("Initializing Adobe DC View...");

    try {
      const adobeDCView = new window.AdobeDC.View({
        clientId: import.meta.env.VITE_ADOBE_API_KEY || "demo-client-id",
        divId: viewerId.current,
        parentDivId: containerDivId.current, // Important for proper context
      });

      console.log("Adobe DC View created, loading PDF...");

      adobeDCView
        .previewFile(
          {
            content: { location: { url: pdfFile } },
            metaData: { fileName: "document.pdf" },
          },
          {
            embedMode: "IN_LINE",
            showDownloadPDF: false,
            showPrintPDF: false,
            showLeftHandPanel: false,
            showAnnotationTools: false,
            enableTextSelection: false,
            defaultViewMode: "FIT_WIDTH", // Better page rendering
            showBookmarks: false,
            showThumbnails: false,
          }
        )
        .then((viewer) => {
          console.log("PDF loaded successfully");
          viewerRef.current = viewer;

          // Optional: Add event listeners for better debugging
          viewer.getAPIs().then((apis) => {
            console.log("APIs available:", Object.keys(apis));
            
            // Listen for page change events
            apis.registerCallback(
              window.AdobeDC.View.Enum.CallbackType.PAGE_CHANGED,
              (event) => {
                console.log("Page changed to:", event.data.currentPage);
              }
            );
          }).catch((error) => {
            console.error("Error getting APIs:", error);
          });
        })
        .catch((error) => {
          console.error("Error loading PDF:", error);
        });
    } catch (error) {
      console.error("Error initializing Adobe DC View:", error);
    }
  }, [isSDKReady, pdfFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        try {
          if (viewerRef.current.unmount) {
            viewerRef.current.unmount();
          }
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {pdfFile ? (
        <div 
          id={containerDivId.current}
          className="w-full"
          style={{ minHeight: "500px" }}
        >
          <div
            id={viewerId.current}
            className="border border-gray-600 rounded-lg bg-white"
            style={{ minHeight: "500px", width: "100%" }}
          />
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center text-gray-400">
          No PDF Selected
        </div>
      )}
    </div>
  );
});

NormalViewer.displayName = "NormalViewer";

export default NormalViewer;
