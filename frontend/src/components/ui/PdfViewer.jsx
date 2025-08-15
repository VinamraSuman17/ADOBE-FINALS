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
  useImperativeHandle(ref, () => ({
    navigateToPage: (pageNumber) => {
      if (viewerRef.current?.getAPIs) {
        viewerRef.current.getAPIs().then((apis) => {
          apis.gotoLocation(pageNumber + 1);
        });
      }
    },
  }));
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
      document.addEventListener("adobe_dc_view_sdk.ready", checkSDK);
      return () =>
        document.removeEventListener("adobe_dc_view_sdk.ready", checkSDK);
    }
  }, []);
  useEffect(() => {
    const onSDKReady = () => setIsSDKReady(true);

    if (window.AdobeDC?.View) {
      onSDKReady();
    } else {
      document.addEventListener("adobe_dc_view_sdk.ready", onSDKReady);
      return () =>
        document.removeEventListener("adobe_dc_view_sdk.ready", onSDKReady);
    }
  }, []);

  useEffect(() => {
    console.log(pdfFile);
    if (!isSDKReady || !pdfFile) return;

    const container = document.getElementById("adobe-dc-view");
    if (container) {
      container.innerHTML = "";
      console.log("ppp");
    }
    // Clear previous viewer instance
    if (viewerRef.current && viewerRef.current.unmount) {
      viewerRef.current.unmount();
      viewerRef.current = null;
    }
    const adobeDCView = new window.AdobeDC.View({
      clientId: import.meta.env.VITE_ADOBE_API_KEY || "demo-client-id",
      divId: viewerId.current,
    });
    // This will work with any PDF URL
    adobeDCView
      .previewFile(
        {
          content: { location: { url: pdfFile } }, // Direct URL usage
          metaData: { fileName: "hello.pdf" },
        },
        {
          embedMode: "IN_LINE",
          showDownloadPDF: false,
          showPrintPDF: false,
          showLeftHandPanel: false,
          showAnnotationTools: false,
          enableTextSelection: false,
        }
      )
      .then((viewer) => {
        viewerRef.current = viewer;
      });
    console.log("yaha haih");
  }, [isSDKReady, pdfFile]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {pdfFile ? (
        <div
          id={viewerId.current}
          className="border border-gray-600 rounded-lg bg-white"
          style={{ minHeight: "500px", width: "100%" }}
        />
      ) : (
        <div className="h-96 flex items-center justify-center text-gray-400">
          No PDF Selected
        </div>
      )}
    </div>
  );
});

export default NormalViewer;
