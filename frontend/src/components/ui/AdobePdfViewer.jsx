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

    const containerRef = useRef(null);
    const initTimeoutRef = useRef(null);
    const resizeTimerRef = useRef(null);
    const cleanupResizeListenerRef = useRef(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    // Stabilize onTextSelection reference to avoid changing effect deps size/order
    const memoOnTextSelection = useCallback(onTextSelection || null, [onTextSelection]);

    // Stable key to control re-initialization without racing on File identity
    const pdfKey = useMemo(() => {
      if (typeof pdfFile === 'string') return pdfFile;
      if (pdfFile instanceof File) {
        return `${pdfFile.name}:${pdfFile.size}:${pdfFile.lastModified || 0}`;
      }
      return '';
    }, [pdfFile]);

    useImperativeHandle(ref, () => ({
      navigateToPage: (pageNumber) => {
        if (adobeView?.getAPIs) {
          adobeView
            .getAPIs()
            .then((apis) => {
              // Small delay to ensure layout settled
              setTimeout(() => {
                apis
                  .gotoLocation(pageNumber + 1)
                  .catch((err) => console.error('gotoLocation failed:', err))
                  .finally(() => {
                    // Reflow after navigation to hydrate target area
                    debouncedReflow('adobe-scroll-wrapper', 120);
                  });
              }, 300);
            })
            .catch((err) => console.error('getAPIs failed:', err));
        }
      },
    }));

    // SDK ready listener
    useEffect(() => {
      const onReady = () => setIsSDKReady(true);
      if (window.AdobeDC?.View) {
        setIsSDKReady(true);
      } else {
        document.addEventListener('adobe_dc_view_sdk.ready', onReady);
        return () => document.removeEventListener('adobe_dc_view_sdk.ready', onReady);
      }
    }, []);

    // Initialize viewer on SDK ready + pdf change
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
        // Cleanup old viewer DOM
        const el = document.getElementById('adobe-dc-view');
        if (el) el.innerHTML = '';
        setAdobeView(null);

        // Remove resize handler if any
        if (cleanupResizeListenerRef.current) {
          cleanupResizeListenerRef.current();
          cleanupResizeListenerRef.current = null;
        }
      };
      // Keep deps stable and fixed-size
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSDKReady, pdfKey, memoOnTextSelection]);

    const initializePdfViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        retryCountRef.current += 1;

        if (!window.AdobeDC || !window.AdobeDC.View) {
          throw new Error('Adobe SDK not loaded');
        }

        // Ensure container has stable id for parentDivId
        const parentId = containerRef.current?.id || 'adobe-dc-container';
        if (!containerRef.current?.id && containerRef.current) {
          containerRef.current.id = parentId;
        }

        const viewerElement = await waitForEl('#adobe-dc-view', 60, 50);
        viewerElement.innerHTML = '';

        const view = new window.AdobeDC.View({
          clientId: import.meta.env.VITE_ADOBE_API_KEY || 'demo-client-id',
          divId: 'adobe-dc-view',
          parentDivId: parentId, // critical fix
        });

        // Optional: profile
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

        // unique id to avoid stale state
        const metaData = {
          fileName: typeof pdfFile === 'string' ? 'document.pdf' : pdfFile.name,
          id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        };

        const options = {
          embedMode: 'IN_LINE',
          showDownloadPDF: false,
          showPrintPDF: false,
          showLeftHandPanel: true,
          showAnnotationTools: false,
          showPageControls: true,
          showZoomControl: true,
          enableFormFilling: false,
          showBookmarks: true,
          enableTextSelection: true,
        };

        const preview = view.previewFile({ content: contentConfig, metaData }, options);

        preview
          .then(async (adobeViewer) => {
            setAdobeView(adobeViewer);

            // Reflow and hydrate lower pages (simulate Ctrl+/- effect safely)
            setTimeout(() => {
              dispatchWindowResize();
              nudgeScrollOnce('adobe-scroll-wrapper');
              setTimeout(() => nudgeScrollOnce('adobe-scroll-wrapper'), 100);
              setTimeout(() => dispatchWindowResize(), 160);
            }, 220);

            // Also listen for real resizes and reflow
            const onResize = () => debouncedReflow('adobe-scroll-wrapper', 160);
            window.addEventListener('resize', onResize);
            cleanupResizeListenerRef.current = () => window.removeEventListener('resize', onResize);

            // Selection listener (optional)
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
              },
              { listenOn: ['PREVIEW_SELECTION_END'], enableFilePreviewEvents: true }
            );
          })
          .catch((err) => {
            console.error('previewFile failed:', err);
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

    // Optional: reflow on first genuine scroll to kick lazy renderer
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

    // Cleanup timers on unmount
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

    return (
      <div
        ref={containerRef}
        id="adobe-dc-container"
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        style={{ position: 'relative' }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Adobe PDF Preview
          {isUploaded && <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded">Uploaded</span>}
          {!isSDKReady && <span className="ml-2 px-2 py-1 bg-orange-600 text-xs rounded">SDK Loading</span>}
        </h3>

        {pdfKey ? (
          <>
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

            {/* Stable scroll wrapper; viewer grows naturally inside */}
            <div id="adobe-scroll-wrapper" className="relative overflow-y-auto" style={{ height: '700px' }}>
              <div
                id="adobe-dc-view"
                className="border border-gray-600 rounded-lg bg-white"
                style={{ minHeight: '400px', width: '100%' }}
              />
            </div>
          </>
        ) : (
          <div className="border border-gray-600 rounded-lg h-96 flex items-center justify-center bg-gray-700">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium">No Document Selected</p>
              <p className="text-sm mt-2">Upload a PDF to preview here</p>
            </div>
          </div>
        )}
      </div>
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
