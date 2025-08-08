import React, { useEffect, useState } from 'react'

const PdfViewer = ({ pdfData, pdfFile }) => {
  const [adobeDC, setAdobeDC] = useState(null)

  useEffect(() => {
    // Adobe DC View SDK initialize
    if (window.AdobeDC && pdfFile) {
      const adobeDCView = new window.AdobeDC.View({
        clientId: import.meta.env.VITE_ADOBE_API_KEY,
        divId: "adobe-dc-view"
      });

      // PDF ko display karna
      adobeDCView.previewFile({
        content: { promise: Promise.resolve(pdfFile.arrayBuffer()) },
        metaData: { fileName: pdfFile.name }
      }, {
        embedMode: "IN_LINE",
        showDownloadPDF: false,
        showPrintPDF: false,
        showLeftHandPanel: true,
        showAnnotationTools: false
      });

      setAdobeDC(adobeDCView)
    }
  }, [pdfFile])

  return (
    <div className="bg-gray-800 rounded p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">PDF Preview</h3>
      
      {pdfFile ? (
        <div 
          id="adobe-dc-view" 
          className="border border-gray-600 rounded h-96 overflow-hidden"
        />
      ) : (
        <div className="border border-gray-600 rounded h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📄</div>
            <p>PDF will appear here after upload</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PdfViewer
