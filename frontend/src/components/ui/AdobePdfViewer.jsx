import React, { useEffect, useState, useRef } from 'react'

const AdobePdfViewer = ({ pdfFile, isUploaded = false }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSDKReady, setIsSDKReady] = useState(false)
  const viewerRef = useRef(null)
  const containerRef = useRef(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  // ✅ Check if Adobe SDK is ready
  useEffect(() => {
    const checkSDKReady = () => {
      if (window.AdobeDC && window.AdobeDC.View) {
        console.log('✅ Adobe SDK already available')
        setIsSDKReady(true)
      } else {
        console.log('⏳ Waiting for Adobe SDK to load...')
        
        const handleSDKReady = () => {
          console.log('✅ Adobe SDK ready event triggered')
          setIsSDKReady(true)
        }
        
        document.addEventListener('adobe_dc_view_sdk.ready', handleSDKReady)
        
        // Cleanup
        return () => {
          document.removeEventListener('adobe_dc_view_sdk.ready', handleSDKReady)
        }
      }
    }

    if (document.readyState === 'complete') {
      checkSDKReady()
    } else {
      window.addEventListener('load', checkSDKReady)
      return () => window.removeEventListener('load', checkSDKReady)
    }
  }, [])

  // ✅ Initialize PDF viewer with proper timing
  useEffect(() => {
    if (isSDKReady && pdfFile) {
      console.log('🎯 Conditions met - SDK ready and file available')
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        initializePdfViewer()
      }, 100)
    }
  }, [isSDKReady, pdfFile])

  const initializePdfViewer = async () => {
    try {
      setIsLoading(true)
      setError(null)
      retryCountRef.current += 1

      console.log(`🔍 Initialization attempt ${retryCountRef.current}/${maxRetries}`)

      // ✅ Double-check Adobe SDK is available
      if (!window.AdobeDC || !window.AdobeDC.View) {
        throw new Error('Adobe SDK not loaded')
      }

      // ✅ Wait for DOM element to exist with shorter timeout
      const waitForElement = new Promise((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 50 // 5 seconds total (100ms * 50)
        
        const checkElement = () => {
          attempts++
          const element = document.getElementById('adobe-dc-view')
          
          console.log(`🔍 Attempt ${attempts}: Looking for #adobe-dc-view element...`)
          
          if (element) {
            console.log('✅ Found #adobe-dc-view element:', element)
            resolve(element)
          } else if (attempts >= maxAttempts) {
            console.log('❌ Element not found after maximum attempts')
            reject(new Error('Element #adobe-dc-view not found'))
          } else {
            setTimeout(checkElement, 100)
          }
        }
        
        checkElement()
      })

      const viewerElement = await waitForElement

      // Clear any previous content
      viewerElement.innerHTML = ''
      console.log('🧹 Cleared previous viewer content')

      console.log('🎯 Initializing Adobe DC View...')

      // Initialize Adobe DC View
      const adobeDCView = new window.AdobeDC.View({
        clientId: import.meta.env.VITE_ADOBE_API_KEY || 'demo-client-id',
        divId: 'adobe-dc-view'
      })

      console.log('📄 Converting file to ArrayBuffer...')
      const arrayBuffer = await pdfFile.arrayBuffer()
      console.log(`✅ File converted: ${arrayBuffer.byteLength} bytes`)

      // Preview file
      console.log('🚀 Calling previewFile...')
      await adobeDCView.previewFile({
        content: { promise: Promise.resolve(arrayBuffer) },
        metaData: { 
          fileName: pdfFile.name,
          id: `pdf-${Date.now()}`
        }
      }, {
        embedMode: 'IN_LINE',
        showDownloadPDF: false,
        showPrintPDF: false,
        showLeftHandPanel: true,
        showAnnotationTools: false,
        showPageControls: true,
        showZoomControl: true,
        enableFormFilling: false,
        showBookmarks: true
      })

      viewerRef.current = adobeDCView
      retryCountRef.current = 0 // Reset on success
      setIsLoading(false)
      console.log('✅ Adobe PDF Viewer initialized successfully!')

    } catch (err) {
      console.error('❌ Adobe PDF Viewer Error:', err)
      
      // ✅ Retry logic
      if (retryCountRef.current < maxRetries) {
        console.log(`🔄 Retrying in ${retryCountRef.current} seconds... (${retryCountRef.current}/${maxRetries})`)
        setTimeout(() => {
          initializePdfViewer()
        }, 1000 * retryCountRef.current)
      } else {
        setError(`Failed after ${maxRetries} attempts: ${err.message}`)
        setIsLoading(false)
        retryCountRef.current = 0
      }
    }
  }

  const handleRetry = () => {
    retryCountRef.current = 0
    if (pdfFile && isSDKReady) {
      initializePdfViewer()
    }
  }

  // ✅ Always render the adobe-dc-view div when pdfFile exists
  const shouldShowViewer = pdfFile && isSDKReady

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
              className="border border-gray-600 rounded-lg h-96 overflow-hidden bg-white"
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
  )
}

export default AdobePdfViewer
