import React, { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import {
    ChevronLeft, ChevronRight, Copy, Share2, ZoomIn, ZoomOut,
    Grid, Maximize, Minimize, Printer, Download, Volume2, VolumeX,
    MoreVertical, X
} from "lucide-react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import HTMLFlipBook from 'react-pageflip';
import backImg from "../assets/Flipping book Background .jpg";
import flipback from "../assets/Flipping book Background Black.jpg";
import pageFlipSound1 from "../assets/page-flip1.mp3";
import logoBlack from "../assets/logo-black.png";
import logoWhite from "../assets/logo-white.png";

// Page component for react-pageflip
const Page = forwardRef(({ pageNumber, imageUrl, isLoading, hasError, onError }, ref) => {
    if (isLoading) {
        return (
            <div ref={ref} className="page-content">
                <div className="w-full h-full flex items-center justify-center bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div ref={ref} className="page-content">
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500">Failed to load page {pageNumber}</span>
                </div>
            </div>
        );
    }

    if (imageUrl) {
        return (
            <div ref={ref} className="page-content">
                <img
                    src={imageUrl}
                    alt={`Page ${pageNumber}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={onError}
                />
            </div>
        );
    }

    return (
        <div ref={ref} className="page-content">
            <div className="w-full h-full flex items-center justify-center bg-white">
                <span className="text-gray-500">Page {pageNumber}</span>
            </div>
        </div>
    );
});

Page.displayName = 'Page';

export default function FlipbookViewer() {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const { flipbookId, accessToken } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const locationState = location.state || {};
    const actualAccessToken = locationState.accessToken || accessToken;

    const [flipbookData, setFlipbookData] = useState({
        flipbookId: flipbookId,
        totalPages: locationState.totalPages,
        userData: locationState.userData,
        server: locationState.server,
        accessToken: actualAccessToken
    });
    const [isLoadingData, setIsLoadingData] = useState(!locationState.totalPages);
    const [currentPage, setCurrentPage] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [loadingPages, setLoadingPages] = useState({});
    const [pageImages, setPageImages] = useState({});
    const [bgLoaded, setBgLoaded] = useState(false);
    const [bgImage, setBgImage] = useState("");

    // Toolbar states
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const flipBookRef = useRef(null);
    const containerRef = useRef(null);
    const audioRefs = useRef({
        flip1: new Audio(pageFlipSound1),
    });

    const cleanupRefs = useRef({
        pdfInstances: {},
        objectUrls: {}
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        Object.values(audioRefs.current).forEach(audio => {
            audio.preload = 'auto';
            audio.volume = 0.4;
        });

        return () => {
            Object.values(cleanupRefs.current.objectUrls).forEach(url => {
                URL.revokeObjectURL(url);
            });

            Object.values(cleanupRefs.current.pdfInstances).forEach(pdf => {
                if (pdf && pdf.destroy) {
                    pdf.destroy();
                }
            });
        };
    }, []);

    useEffect(() => {
        const correctBgImage = isDarkMode ? flipback : backImg;
        const img = new Image();
        img.src = correctBgImage;

        img.onload = () => {
            setBgImage(correctBgImage);
            setBgLoaded(true);
        };

        img.onerror = () => {
            setBgLoaded(false);
        };
    }, [isDarkMode]);

    const playFlipSound = useCallback(() => {
        if (!soundEnabled) return;

        const soundKeys = Object.keys(audioRefs.current);
        const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
        const audio = audioRefs.current[randomKey];

        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }, [soundEnabled]);

    const loadPDFPageAsImage = useCallback(async (pageNumber) => {
        if (pageImages[pageNumber] || loadingPages[pageNumber]) {
            return;
        }

        const tokenToUse = flipbookData.accessToken || actualAccessToken;

        if (!tokenToUse) {
            return;
        }

        try {
            setLoadingPages(prev => ({ ...prev, [pageNumber]: true }));

            const response = await fetch(
                `${API_BASE}/api/flipbook/${tokenToUse}/page/${pageNumber}`
            );

            if (!response.ok) {
                throw new Error(`Failed to load page ${pageNumber}`);
            }

            const pdfBlob = await response.blob();
            const pdfUrl = URL.createObjectURL(pdfBlob);

            cleanupRefs.current.objectUrls[pageNumber] = pdfUrl;

            const pdfjsLib = await import('pdfjs-dist/build/pdf');
            const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker?url');
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

            const pdf = await pdfjsLib.getDocument({
                url: pdfUrl,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
            }).promise;

            cleanupRefs.current.pdfInstances[pageNumber] = pdf;

            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const imageUrl = canvas.toDataURL('image/jpeg', 0.95);

            setPageImages(prev => ({
                ...prev,
                [pageNumber]: imageUrl
            }));

            setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
                delete cleanupRefs.current.objectUrls[pageNumber];

                if (cleanupRefs.current.pdfInstances[pageNumber]) {
                    cleanupRefs.current.pdfInstances[pageNumber].destroy();
                    delete cleanupRefs.current.pdfInstances[pageNumber];
                }
            }, 1000);

        } catch (err) {
            console.error(`Error loading page ${pageNumber}:`, err);
            setImageErrors(prev => ({ ...prev, [pageNumber]: true }));
        } finally {
            setLoadingPages(prev => {
                const newState = { ...prev };
                delete newState[pageNumber];
                return newState;
            });
        }
    }, [flipbookData.accessToken, actualAccessToken, pageImages, loadingPages, API_BASE]);

    useEffect(() => {
        const fetchFlipbookData = async () => {
            if (flipbookData.totalPages && flipbookData.accessToken) {
                setIsLoadingData(false);
                return;
            }

            if (locationState.totalPages || locationState.accessToken) {
                setFlipbookData({
                    flipbookId: locationState.flipbookId || flipbookId,
                    totalPages: locationState.totalPages,
                    userData: locationState.userData,
                    server: locationState.server,
                    accessToken: locationState.accessToken || actualAccessToken
                });
                setIsLoadingData(false);
                return;
            }

            if (actualAccessToken) {
                try {
                    setIsLoadingData(true);

                    const response = await fetch(
                        `${API_BASE}/api/flipbook/${actualAccessToken}/metadata`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch flipbook data');
                    }

                    const data = await response.json();

                    setFlipbookData({
                        flipbookId: data.flipbookId || flipbookId,
                        totalPages: data.totalPages,
                        userData: data.userData,
                        server: data.server,
                        accessToken: actualAccessToken
                    });

                } catch (err) {
                    console.error('Error fetching with accessToken:', err);
                } finally {
                    setIsLoadingData(false);
                }
                return;
            }

            if (!actualAccessToken && !locationState.accessToken) {
                console.error('No access token available');
                setIsLoadingData(false);
            }
        };

        fetchFlipbookData();
    }, [flipbookId, actualAccessToken, locationState?.totalPages, locationState?.accessToken, API_BASE, flipbookData.totalPages, flipbookData.accessToken]);

    useEffect(() => {
        const tokenToUse = flipbookData.accessToken || actualAccessToken;
        if (!tokenToUse || !flipbookData.totalPages) return;

        const pagesToLoad = [];

        if (currentPage > 0 && currentPage <= flipbookData.totalPages) {
            pagesToLoad.push(currentPage);
        }

        if (currentPage + 1 <= flipbookData.totalPages) {
            pagesToLoad.push(currentPage + 1);
        }

        if (currentPage - 1 > 0) {
            pagesToLoad.push(currentPage - 1);
        }

        pagesToLoad.forEach(page => {
            if (!pageImages[page] && !loadingPages[page]) {
                loadPDFPageAsImage(page);
            }
        });
    }, [currentPage, flipbookData.accessToken, flipbookData.totalPages, pageImages, loadingPages, loadPDFPageAsImage, actualAccessToken]);

    const copyToClipboard = () => {
        const link = flipbookData?.server?.flipbookLink;
        if (!link) return;

        try {
            const textarea = document.createElement('textarea');
            textarea.value = link;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.top = '0';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            setCopySuccess(true);

            setTimeout(() => {
                setCopySuccess(false);
                setShowShareModal(false);
            }, 1200);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    const shareLink = async () => {
        const link = flipbookData?.server?.flipbookLink;
        if (!link) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this flipbook',
                    text: 'Here is a flipbook I created:',
                    url: link,
                });

                setShowShareModal(false);
                return;
            } catch {
                // user cancelled
            }
        }

        copyToClipboard();
    };

    const onFlip = useCallback((e) => {
        setCurrentPage(e.data);
        playFlipSound();
    }, [playFlipSound]);

    const nextPage = () => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flipNext();
        }
    };

    const prevPage = () => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flipPrev();
        }
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 2));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const tokenToUse = flipbookData.accessToken || actualAccessToken;
        if (!tokenToUse) return;

        try {
            setIsDownloading(true);

            const response = await fetch(
                `${API_BASE}/api/flipbook/${tokenToUse}/download`
            );

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `flipbook-${flipbookData.flipbookId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const jumpToPage = (pageNum) => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flip(pageNum - 1);
            setShowThumbnails(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
                <div className={`absolute inset-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}></div>
                <div className="relative text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Loading flipbook...
                    </h2>
                </div>
            </div>
        );
    }

    const totalPages = locationState.totalPages || flipbookData.totalPages;

    if (!flipbookData.accessToken && !actualAccessToken) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <div className="text-center">
                    <h2 className="text-2xl mb-4">Cannot load flipbook</h2>
                    <p className="mb-4">Missing access token. Please use a valid flipbook link.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white transition-colors duration-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Fixed book dimensions (original size: 450x600)
    const bookWidth = isMobile ? 280 : 450;
    const bookHeight = isMobile ? 373 : 600;

    return (
        <div
            ref={containerRef}
            className="min-h-screen w-full relative overflow-hidden"
            style={{
                backgroundImage: bgLoaded ? `url('${bgImage}')` : 'none',
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                    pointerEvents: 'none'
                }}
            ></div>

            <style>{`
        .page-content {
          width: 100%;
          height: 100%;
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .flipbook-container {
          filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.3));
          transform: scale(${zoomLevel});
          transition: transform 0.3s ease;
        }

        .stf__wrapper {
          transform-style: preserve-3d;
        }

        .stf__block {
          transform-style: preserve-3d;
        }

        .stf__item {
          transform-style: preserve-3d;
        }

        .stf__shadow {
          opacity: 0.5 !important;
        }

        .stf__hardShadow {
          background: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent) !important;
        }

        .stf__hardInnerShadow {
          background: linear-gradient(to left, rgba(0, 0, 0, 0.2), transparent) !important;
        }

        .stf__outerShadow {
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.4) !important;
        }

        .page-content img {
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .toolbar-button {
          transition: all 0.2s ease;
        }

        .toolbar-button:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .toolbar-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>

            {/* Action Buttons - Top Right */}
            <div className="no-print fixed top-3 right-3 z-50 flex gap-2">
                <button
                    onClick={handlePrint}
                    className={`toolbar-button p-2 sm:p-3 rounded-full shadow-lg backdrop-blur-sm transition-colors ${isDarkMode
                        ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white'
                        : 'bg-white/80 hover:bg-gray-100/80 text-gray-800'
                        }`}
                    title="Print"
                >
                    <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className={`toolbar-button p-2 sm:p-3 rounded-full shadow-lg backdrop-blur-sm transition-colors ${isDarkMode
                        ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white'
                        : 'bg-white/80 hover:bg-gray-100/80 text-gray-800'
                        }`}
                    title="Download PDF"
                >
                    {isDownloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-current"></div>
                    ) : (
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                </button>

                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`toolbar-button p-2 sm:p-3 rounded-full shadow-lg backdrop-blur-sm transition-colors ${isDarkMode
                        ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white'
                        : 'bg-white/80 hover:bg-gray-100/80 text-gray-800'
                        }`}
                    title={soundEnabled ? 'Mute' : 'Unmute'}
                >
                    {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
            </div>

            {/* Page counter */}
            <div className={`no-print fixed top-0 left-0 z-50 p-3 transition-colors duration-300 ${isDarkMode
                ? 'bg-gray-800 text-white'
                : 'bg-white/95 text-gray-900 shadow-md border border-gray-200'
                }`}>
                <div className="text-sm font-medium">
                    Page {currentPage + 1} / {totalPages}
                </div>
            </div>

            {/* Main Flipbook Area */}
            <div className="min-h-screen flex items-center justify-center p-4 pb-24">
                <div className="relative flex items-center gap-8">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className={`no-print toolbar-button p-3 backdrop-blur-sm rounded-full transition-all bg-gray-900/80 hover:bg-gray-800/90 text-white shadow-lg border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 ${isMobile ? 'absolute left-0 z-50' : ''}`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={isMobile ? 20 : 24} />
                    </button>

                    <div className="flipbook-container">
                        <HTMLFlipBook
                            ref={flipBookRef}
                            width={bookWidth}
                            height={bookHeight}
                            size="stretch"
                            minWidth={300}
                            maxWidth={900}
                            minHeight={400}
                            maxHeight={1200}
                            drawShadow={true}
                            flippingTime={1200}
                            usePortrait={false}
                            startZIndex={0}
                            autoSize={true}
                            maxShadowOpacity={0.8}
                            showCover={true}
                            mobileScrollSupport={true}
                            onFlip={onFlip}
                            className="flipbook"
                            style={{}}
                            startPage={0}
                            clickEventForward={true}
                            useMouseEvents={true}
                            swipeDistance={30}
                            showPageCorners={true}
                            disableFlipByClick={false}
                        >
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <Page
                                    key={pageNum}
                                    pageNumber={pageNum}
                                    imageUrl={pageImages[pageNum]}
                                    isLoading={loadingPages[pageNum]}
                                    hasError={imageErrors[pageNum]}
                                    onError={() => setImageErrors(prev => ({ ...prev, [pageNum]: true }))}
                                />
                            ))}
                        </HTMLFlipBook>
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={currentPage >= totalPages - 1}
                        className={`no-print toolbar-button p-3 backdrop-blur-sm rounded-full transition-all bg-gray-900/80 hover:bg-gray-800/90 text-white shadow-lg border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 ${isMobile ? 'absolute right-0 z-50' : ''}`}
                        aria-label="Next page"
                    >
                        <ChevronRight size={isMobile ? 20 : 24} />
                    </button>
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className={`no-print fixed bottom-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} py-3 px-4`}>
                <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.5}
                        className="toolbar-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 2}
                        className="toolbar-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                    <button
                        onClick={() => setShowThumbnails(true)}
                        className="toolbar-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        title="Thumbnails"
                    >
                        <Grid className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowShareModal(true)}
                        className="toolbar-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        title="Share"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="toolbar-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        title="More Options"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="toolbar-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>

                {/* Logo - Bottom Right */}
                <div className="absolute bottom-4 right-4">
                    <img src={isDarkMode ? logoWhite : logoBlack} alt="WeFlipPage Logo" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Thumbnail Grid Modal */}
            {showThumbnails && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-6xl max-h-[90vh] overflow-auto rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-6`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">All Pages</h3>
                            <button
                                onClick={() => setShowThumbnails(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => jumpToPage(pageNum)}
                                    className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${currentPage + 1 === pageNum
                                        ? 'border-blue-500 ring-2 ring-blue-500'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                        }`}
                                >
                                    {pageImages[pageNum] ? (
                                        <img
                                            src={pageImages[pageNum]}
                                            alt={`Page ${pageNum}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                            <span className="text-sm text-gray-500">Page {pageNum}</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                                        {pageNum}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* More Options Menu */}
            {showMoreMenu && (
                <div className={`fixed bottom-20 right-4 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-2 min-w-[200px]`}>
                    <div className={`text-sm font-semibold px-3 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        Options
                    </div>
                    <button
                        onClick={() => {
                            setSoundEnabled(!soundEnabled);
                            setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        <span>{soundEnabled ? 'Mute Sound' : 'Enable Sound'}</span>
                    </button>
                    <button
                        onClick={() => {
                            setZoomLevel(1);
                            setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        Reset Zoom
                    </button>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <>
                    <div
                        className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowShareModal(false)}
                    />
                    <div
                        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-80 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                            <h3 className="font-semibold">Share Flipbook</h3>
                            <button onClick={() => setShowShareModal(false)} className="p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={copyToClipboard}
                                    className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${copySuccess
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white transition-colors`}
                                >
                                    <Copy size={16} />
                                    {copySuccess ? 'Copied to Clipboard!' : 'Copy Link'}
                                </button>

                                <button
                                    onClick={shareLink}
                                    className="w-full py-2 px-4 rounded bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Share2 size={16} />
                                    Share via…
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
