import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';

const AdobePdfViewer = forwardRef(
  ({ pdfFile, onTextSelection, isUploaded = false }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSDKReady, setIsSDKReady] = useState(false);
    const [adobeView, setAdobeView] = useState(null);
    const [currentZoom, setCurrentZoom] = useState(1);
    const [manualZoomMode, setManualZoomMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const containerRef = useRef(null);
    const modalRef = useRef(null);
    const initTimeoutRef = useRef(null);
    const resizeTimerRef = useRef(null);
    const cleanupResizeListenerRef = useRef(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    const memoOnTextSelection = useCallback(onTextSelection || null, [onTextSelection]);

    const pdfKey = useMemo(() => {
      if (typeof pdfFile === 'string') return pdfFile;
      if (pdfFile instanceof File) {
        return `${pdfFile.name}:${pdfFile.size}:${pdfFile.lastModified || 0}`;
      }
      return '';
    }, [pdfFile]);

    // Manual zoom implementation
    const applyManualZoom = (zoomLevel) => {
      const viewerId = isFullscreen ? 'adobe-dc-view-fullscreen' : 'adobe-dc-view';
      const viewer = document.querySelector(`#${viewerId}`);
      if (viewer) {
        viewer.style.transform = `scale(${zoomLevel})`;
        viewer.style.transformOrigin = 'top left';
        viewer.style.width = `${100 / zoomLevel}%`;
        viewer.style.height = `${100 / zoomLevel}%`;
        setCurrentZoom(zoomLevel);
      }
    };

    useImperativeHandle(ref, () => ({
      navigateToPage: (pageNumber, zoomLevel = null) => {
        if (adobeView?.getAPIs) {
          adobeView.getAPIs()
            .then(async (apis) => {
              try {
                await apis.getNavigationAPIs().gotoLocation(pageNumber + 1);
                if (zoomLevel) {
                  try {
                    await apis.getZoomAPIs().setZoomLevel(zoomLevel);
                    setCurrentZoom(zoomLevel);
                  } catch {
                    applyManualZoom(zoomLevel);
                  }
                }
                const wrapperId = isFullscreen ? 'adobe-scroll-wrapper-fullscreen' : 'adobe-scroll-wrapper';
                debouncedReflow(wrapperId, 120);
              } catch (err) {
                console.error("navigateToPage failed:", err);
              }
            });
        }
      },

      zoomIn: () => {
        if (!manualZoomMode && adobeView?.getAPIs) {
          adobeView.getAPIs().then(async (apis) => {
            try {
              await apis.getZoomAPIs().zoomIn();
              const zoomLevel = await apis.getZoomAPIs().getZoomLevel();
              setCurrentZoom(zoomLevel);
            } catch (err) {
              console.warn("Adobe zoom failed, switching to manual zoom:", err);
              setManualZoomMode(true);
              applyManualZoom(Math.min(currentZoom * 1.25, 3));
            }
          });
        } else {
          applyManualZoom(Math.min(currentZoom * 1.25, 3));
        }
      },

      zoomOut: () => {
        if (!manualZoomMode && adobeView?.getAPIs) {
          adobeView.getAPIs().then(async (apis) => {
            try {
              await apis.getZoomAPIs().zoomOut();
              const zoomLevel = await apis.getZoomAPIs().getZoomLevel();
              setCurrentZoom(zoomLevel);
            } catch (err) {
              console.warn("Adobe zoom failed, switching to manual zoom:", err);
              setManualZoomMode(true);
              applyManualZoom(Math.max(currentZoom * 0.8, 0.25));
            }
          });
        } else {
          applyManualZoom(Math.max(currentZoom * 0.8, 0.25));
        }
      },

      setZoom: (level) => {
        if (!manualZoomMode && adobeView?.getAPIs && level > 0) {
          adobeView.getAPIs().then(async (apis) => {
            try {
              await apis.getZoomAPIs().setZoomLevel(level);
              setCurrentZoom(level);
            } catch (err) {
              console.warn("Adobe zoom failed, switching to manual zoom:", err);
              setManualZoomMode(true);
              applyManualZoom(level);
            }
          });
        } else {
          applyManualZoom(level);
        }
      },

      fitToWidth: () => {
        if (!manualZoomMode && adobeView?.getAPIs) {
          adobeView.getAPIs().then(async (apis) => {
            try {
              await apis.getZoomAPIs().fitToWidth();
              const zoomLevel = await apis.getZoomAPIs().getZoomLevel();
              setCurrentZoom(zoomLevel);
            } catch (err) {
              console.warn("Adobe fitToWidth failed, using manual approach:", err);
              setManualZoomMode(true);
              applyManualZoom(1.2);
            }
          });
        } else {
          applyManualZoom(1.2);
        }
      },

      fitToPage: () => {
        if (!manualZoomMode && adobeView?.getAPIs) {
          adobeView.getAPIs().then(async (apis) => {
            try {
              await apis.getZoomAPIs().fitToPage();
              const zoomLevel = await apis.getZoomAPIs().getZoomLevel();
              setCurrentZoom(zoomLevel);
            } catch (err) {
              console.warn("Adobe fitToPage failed, using manual approach:", err);
              setManualZoomMode(true);
              applyManualZoom(1);
            }
          });
        } else {
          applyManualZoom(1);
        }
      },

      resetZoom: () => {
        if (!manualZoomMode && adobeView?.getAPIs) {
          adobeView.getAPIs().then(async (apis) => {
            try {
              await apis.getZoomAPIs().setZoomLevel(1);
              setCurrentZoom(1);
            } catch (err) {
              console.warn("Adobe reset failed, using manual approach:", err);
              setManualZoomMode(true);
              applyManualZoom(1);
            }
          });
        } else {
          applyManualZoom(1);
        }
      },

      enableManualZoom: () => {
        setManualZoomMode(true);
        applyManualZoom(currentZoom);
      },

      openFullscreen: () => {
        setIsFullscreen(true);
      },

      closeFullscreen: () => {
        setIsFullscreen(false);
      }
    }));

    // Open fullscreen modal
    const openFullscreen = () => {
      setIsFullscreen(true);
      // Re-initialize viewer in fullscreen mode
      setTimeout(() => {
        initializeFullscreenViewer();
      }, 100);
    };

    // Close fullscreen modal
    const closeFullscreen = () => {
      setIsFullscreen(false);
      // Clean up fullscreen viewer
      const fullscreenViewer = document.getElementById('adobe-dc-view-fullscreen');
      if (fullscreenViewer) {
        fullscreenViewer.innerHTML = '';
      }
    };

    // Initialize fullscreen viewer
    const initializeFullscreenViewer = async () => {
      if (!window.AdobeDC || !pdfKey) return;

      try {
        const fullscreenElement = await waitForEl('#adobe-dc-view-fullscreen', 60, 50);
        fullscreenElement.innerHTML = '';

        const view = new window.AdobeDC.View({
          clientId: import.meta.env.VITE_ADOBE_API_KEY || 'demo-client-id',
          divId: 'adobe-dc-view-fullscreen',
        });

        const contentConfig =
          typeof pdfFile === 'string'
            ? { location: { url: pdfFile } }
            : pdfFile instanceof File
            ? { promise: fileToUint8Array(pdfFile), mimeType: 'application/pdf' }
            : null;

        if (!contentConfig) return;

        const metaData = {
          fileName: typeof pdfFile === 'string' ? 'document.pdf' : pdfFile.name,
          id: `pdf-fullscreen-${Date.now()}`,
        };

        const options = {
          embedMode: 'FULL_WINDOW',
          showDownloadPDF: false,
          showPrintPDF: true,
          showLeftHandPanel: true,
          showAnnotationTools: true,
          showPageControls: true,
          showZoomControl: true,
          enableFormFilling: false,
          showBookmarks: true,
          enableTextSelection: true,
          defaultViewMode: 'FIT_PAGE',
        };

        view.previewFile({ content: contentConfig, metaData }, options);
      } catch (err) {
        console.error('Fullscreen viewer initialization failed:', err);
      }
    };

    // Handle Escape key for fullscreen
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape' && isFullscreen) {
          closeFullscreen();
        }
      };

      if (isFullscreen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isFullscreen]);

    useEffect(() => {
      const onReady = () => setIsSDKReady(true);
      if (window.AdobeDC?.View) {
        setIsSDKReady(true);
      } else {
        document.addEventListener('adobe_dc_view_sdk.ready', onReady);
        return () => document.removeEventListener('adobe_dc_view_sdk.ready', onReady);
      }
    }, []);

    useEffect(() => {
      if (!isSDKReady || !pdfKey) return;

      initTimeoutRef.current = setTimeout(() => {
        initializePdfViewer();
      }, 60);

      return () => {
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        const el = document.getElementById('adobe-dc-view');
        if (el) {
          el.innerHTML = '';
          el.style.transform = '';
          el.style.width = '';
          el.style.height = '';
        }
        setAdobeView(null);
        setManualZoomMode(false);

        if (cleanupResizeListenerRef.current) {
          cleanupResizeListenerRef.current();
          cleanupResizeListenerRef.current = null;
        }
      };
    }, [isSDKReady, pdfKey, memoOnTextSelection]);

    const initializePdfViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setManualZoomMode(false);
        retryCountRef.current += 1;

        if (!window.AdobeDC || !window.AdobeDC.View) {
          throw new Error('Adobe SDK not loaded');
        }

        const parentId = containerRef.current?.id || 'adobe-dc-container';
        if (!containerRef.current?.id && containerRef.current) {
          containerRef.current.id = parentId;
        }

        const viewerElement = await waitForEl('#adobe-dc-view', 60, 50);
        viewerElement.innerHTML = '';
        viewerElement.style.transform = '';
        viewerElement.style.width = '';
        viewerElement.style.height = '';

        const view = new window.AdobeDC.View({
          clientId: import.meta.env.VITE_ADOBE_API_KEY || 'demo-client-id',
          divId: 'adobe-dc-view',
          parentDivId: parentId,
        });

        view.registerCallback(
          window.AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API,
          () =>
            Promise.resolve({
              userProfile: { name: 'User', email: 'user@example.com' },
            })
        );

        const contentConfig =
          typeof pdfFile === 'string'
            ? { location: { url: pdfFile } }
            : pdfFile instanceof File
            ? { promise: fileToUint8Array(pdfFile), mimeType: 'application/pdf' }
            : (() => {
                throw new Error('Invalid pdfFile type');
              })();

        const metaData = {
          fileName: typeof pdfFile === 'string' ? 'document.pdf' : pdfFile.name,
          id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        };

        const options = {
          embedMode: 'IN_LINE',
          showDownloadPDF: false,
          showPrintPDF: false,
          showLeftHandPanel: false,
          showAnnotationTools: false,
          showPageControls: true,
          showZoomControl: true,
          enableFormFilling: false,
          showBookmarks: false,
          enableTextSelection: true,
          defaultViewMode: 'FIT_WIDTH',
        };

        const preview = view.previewFile({ content: contentConfig, metaData }, options);

        preview
          .then(async (adobeViewer) => {
            setAdobeView(adobeViewer);

            setTimeout(async () => {
              try {
                const apis = await adobeViewer.getAPIs();
                
                try {
                  await apis.getZoomAPIs().setZoomLevel(1);
                  const initialZoom = await apis.getZoomAPIs().getZoomLevel();
                  setCurrentZoom(initialZoom);
                } catch (zoomErr) {
                  console.warn("Adobe Zoom APIs not available, enabling manual zoom mode:", zoomErr);
                  setManualZoomMode(true);
                  setCurrentZoom(1);
                }

                dispatchWindowResize();
                nudgeScrollOnce('adobe-scroll-wrapper');
                setTimeout(() => nudgeScrollOnce('adobe-scroll-wrapper'), 100);
                setTimeout(() => dispatchWindowResize(), 160);
              } catch (err) {
                console.warn('Initial setup failed, enabling manual zoom mode:', err);
                setManualZoomMode(true);
                setCurrentZoom(1);
              }
            }, 500);

            const onResize = () => debouncedReflow('adobe-scroll-wrapper', 160);
            window.addEventListener('resize', onResize);
            cleanupResizeListenerRef.current = () => window.removeEventListener('resize', onResize);

            view.registerCallback(
              window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
              async (event) => {
                if (event.type === 'PREVIEW_SELECTION_END') {
                  try {
                    const apis = await adobeViewer.getAPIs();
                    const selectedContent = await apis.getSelectedContent();
                    if (selectedContent?.data?.length > 0) {
                      const selectionData = {
                        text: selectedContent.data,
                        page: event.data?.pageNumber || 1,
                        coordinates: event.data?.coordinates || null,
                        timestamp: Date.now(),
                      };
                      memoOnTextSelection?.(selectionData);
                    }
                  } catch (e) {
                    console.warn('Selection handling failed:', e);
                  }
                }

                if (event.type === 'ZOOM_CHANGE' && !manualZoomMode) {
                  try {
                    const zoomLevel = event.data?.zoomLevel;
                    if (zoomLevel) {
                      setCurrentZoom(zoomLevel);
                    }
                  } catch (e) {
                    console.warn('Zoom change handling failed:', e);
                  }
                }
              },
              { 
                listenOn: ['PREVIEW_SELECTION_END', 'ZOOM_CHANGE'], 
                enableFilePreviewEvents: true 
              }
            );
          })
          .catch((err) => {
            console.error('previewFile failed:', err);
            setError(`Preview failed: ${err.message}`);
          });

        setIsLoading(false);
        retryCountRef.current = 0;
      } catch (err) {
        console.error('Initialize error:', err);
        if (retryCountRef.current < maxRetries) {
          setTimeout(initializePdfViewer, 500 * retryCountRef.current);
        } else {
          setError(`Failed after ${maxRetries} attempts: ${err.message}`);
          setIsLoading(false);
          retryCountRef.current = 0;
        }
      }
    };

    useEffect(() => {
      const scroller = document.getElementById('adobe-scroll-wrapper');
      if (!scroller) return;
      const onFirstScroll = () => {
        debouncedReflow('adobe-scroll-wrapper', 80);
        scroller.removeEventListener('scroll', onFirstScroll);
      };
      scroller.addEventListener('scroll', onFirstScroll, { passive: true });
      return () => scroller.removeEventListener('scroll', onFirstScroll);
    }, [isSDKReady, pdfKey]);

    useEffect(() => {
      return () => {
        if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
        if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
        if (cleanupResizeListenerRef.current) {
          cleanupResizeListenerRef.current();
          cleanupResizeListenerRef.current = null;
        }
      };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === '=' || e.key === '+') {
            e.preventDefault();
            ref.current?.zoomIn();
          } else if (e.key === '-') {
            e.preventDefault();
            ref.current?.zoomOut();
          } else if (e.key === '0') {
            e.preventDefault();
            ref.current?.resetZoom();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [ref]);

    return (
      <>
        {/* Main PDF Viewer */}
        <div
          ref={containerRef}
          id="adobe-dc-container"
          className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
          style={{ position: 'relative' }}
        >
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-slate-800 to-gray-800 px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {typeof pdfFile === 'string' ? 'Remote PDF' : pdfFile?.name || 'No file selected'}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isUploaded && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                      Uploaded
                    </span>
                  )}
                  {!isSDKReady && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                      SDK Loading
                    </span>
                  )}
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={openFullscreen}
                disabled={!pdfKey}
                className="group relative p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                title="Open in Fullscreen"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Fullscreen Preview
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Zoom Controls */}
          <div className="bg-slate-800/50 border-b border-slate-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-400 bg-slate-800 px-2 py-2 border-slate-600">
                    {Math.round(currentZoom * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Primary Zoom Controls */}
                <div className="flex items-center bg-slate-700 overflow-hidden border border-slate-600">
                  <button
                    onClick={() => ref.current?.zoomOut()}
                    className="px-4 py-1 hover:bg-slate-600 text-white text-lg font-bold transition-colors"
                    title="Zoom Out (Ctrl+-)"
                  >
                    −
                  </button>
                  <div className="w-px h-8 bg-slate-600"></div>
                  <button
                    onClick={() => ref.current?.resetZoom()}
                    className="px-3 py-1 hover:bg-slate-600 text-white text-xs font-medium transition-colors"
                    title="Reset to 100% (Ctrl+0)"
                  >
                    100%
                  </button>
                  <div className="w-px h-8 bg-slate-600"></div>
                  <button
                    onClick={() => ref.current?.zoomIn()}
                    className="px-4 py-1 hover:bg-slate-600 text-white text-lg font-bold transition-colors"
                    title="Zoom In (Ctrl++)"
                  >
                    +
                  </button>
                </div>

                {/* Manual Zoom Toggle */}
                {!manualZoomMode && (
                  <button
                    onClick={() => ref.current?.enableManualZoom()}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs rounded border border-purple-500/30 transition-colors"
                    title="Switch to Manual Zoom"
                  >
                    Manual
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-900/50 border border-red-700/50 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* PDF Content */}
          <div className="">
            {pdfKey ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                    <div className="text-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-600 rounded-full animate-spin border-t-red-500 mx-auto mb-4"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-red-500/20 mx-auto"></div>
                      </div>
                      <p className="text-white font-medium">Loading Adobe PDF Viewer...</p>
                      <p className="text-slate-400 text-sm mt-2">
                        Attempt {retryCountRef.current}/{maxRetries}
                      </p>
                    </div>
                  </div>
                )}

                <div 
                  id="adobe-scroll-wrapper" 
                  className="relative overflow-auto border border-slate-600 bg-white shadow-inner"
                  style={{ height: '700px' }}
                >
                  <div
                    id="adobe-dc-view"
                    className="w-full transition-transform duration-200"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </>
            ) : (
              <div className="border border-dashed border-slate-600 rounded-xl h-96 flex items-center justify-center bg-slate-800/30">
                <div className="text-center text-slate-400">
                  <div className="text-6xl mb-6 opacity-50">📄</div>
                  <p className="text-xl font-medium mb-2">No Document Selected</p>
                  <p className="text-sm">Upload a PDF file to preview here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
            {/* Fullscreen Header */}
            <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-1 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div className='flex gap-2 items-center justify-center'>
                  <h3 className="text-sm font-bold text-white">
                    {typeof pdfFile === 'string' ? 'PDF Document' : pdfFile?.name}
                  </h3>
                  <p className="text-[12px] text-gray-400">(Fullscreen mode only for preview)</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={closeFullscreen}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  title="Close Fullscreen (ESC)"
                >
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Fullscreen PDF Content */}
            <div className="flex-1">
              <div 
                id="adobe-scroll-wrapper-fullscreen"
                className="w-full h-full bg-white shadow-2xl overflow-auto"
              >
                <div
                  id="adobe-dc-view-fullscreen"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

AdobePdfViewer.displayName = 'AdobePdfViewer';
export default AdobePdfViewer;

/* ---------------------- Utilities ---------------------- */

async function waitForEl(selector, tries = 60, interval = 50) {
  return await new Promise((resolve, reject) => {
    let attempts = 0;
    const tick = () => {
      attempts++;
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (attempts >= tries) return reject(new Error(`${selector} not found`));
      setTimeout(tick, interval);
    };
    tick();
  });
}

function fileToUint8Array(file) {
  return new Promise(async (resolve) => {
    const buf = await file.arrayBuffer();
    resolve(new Uint8Array(buf));
  });
}

function dispatchWindowResize() {
  try {
    window.dispatchEvent(new Event('resize'));
  } catch {
    const evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  }
}

function nudgeScrollOnce(wrapperId = 'adobe-scroll-wrapper') {
  const scroller = document.getElementById(wrapperId);
  if (!scroller) return;
  const y = scroller.scrollTop;
  scroller.scrollTop = y + 1;
  setTimeout(() => {
    scroller.scrollTop = y;
  }, 0);
}

let __debounceTimer = null;
function debouncedReflow(wrapperId = 'adobe-scroll-wrapper', delay = 180) {
  if (__debounceTimer) clearTimeout(__debounceTimer);
  __debounceTimer = setTimeout(() => {
    dispatchWindowResize();
    nudgeScrollOnce(wrapperId);
    setTimeout(() => nudgeScrollOnce(wrapperId), 80);
  }, delay);
}
