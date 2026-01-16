/**
 * Scorecard Scanner Component
 *
 * Allows users to:
 * - Take photo of a scorecard with phone camera
 * - Upload an existing image
 * - Auto-populate course data via OCR
 *
 * Uses the existing /api/scorecard-ocr endpoint.
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Upload,
    X,
    Check,
    Loader2,
    AlertCircle,
    Sparkles,
    Image as ImageIcon,
    RotateCcw,
    ZoomIn,
} from 'lucide-react';
import { useUIStore } from '@/lib/stores';
import { useHaptic } from '@/lib/hooks/useHaptic';

// Types from the OCR API
interface HoleData {
    par: number;
    handicap: number;
    yardage: number | null;
}

interface TeeSetData {
    name: string;
    color?: string;
    rating?: number;
    slope?: number;
    yardages: (number | null)[];
}

interface ScorecardData {
    courseName?: string;
    teeName?: string;
    rating?: number;
    slope?: number;
    holes: HoleData[];
    teeSets?: TeeSetData[];
}

interface ScorecardScannerProps {
    onScanComplete: (data: ScorecardData) => void;
    onCancel?: () => void;
}

export function ScorecardScanner({ onScanComplete, onCancel }: ScorecardScannerProps) {
    const { showToast } = useUIStore();
    const { trigger } = useHaptic();

    const [mode, setMode] = useState<'select' | 'camera' | 'preview' | 'processing' | 'result'>('select');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string>('image/jpeg');
    const [scanResult, setScanResult] = useState<ScorecardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Back camera for scanning
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setMode('camera');
        } catch (err) {
            console.error('Camera access denied:', err);
            showToast('error', 'Camera access denied. Please allow camera access or upload an image.');
        }
    }, [showToast]);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Capture photo
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedImage(imageData);
            setMimeType('image/jpeg');
            stopCamera();
            setMode('preview');
            trigger('success');
        }
    }, [stopCamera, trigger]);

    // Handle file upload
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('error', 'Please upload an image file (JPG, PNG, etc.)');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCapturedImage(reader.result as string);
            setMimeType(file.type);
            setMode('preview');
        };
        reader.readAsDataURL(file);
    }, [showToast]);

    // Process image with OCR
    const processImage = useCallback(async () => {
        if (!capturedImage) return;

        setIsLoading(true);
        setMode('processing');
        setError(null);

        try {
            // Extract base64 data (remove data URL prefix)
            const base64Data = capturedImage.split(',')[1];

            const response = await fetch('/api/scorecard-ocr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Data,
                    mimeType: mimeType,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to process scorecard');
            }

            if (result.success && result.data) {
                setScanResult(result.data);
                setMode('result');
                trigger('success');
            } else {
                throw new Error('No data extracted from scorecard');
            }
        } catch (err) {
            console.error('OCR error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process scorecard');
            setMode('preview');
            showToast('error', 'Failed to read scorecard. Try a clearer image.');
        } finally {
            setIsLoading(false);
        }
    }, [capturedImage, mimeType, trigger, showToast]);

    // Reset scanner
    const reset = useCallback(() => {
        stopCamera();
        setCapturedImage(null);
        setScanResult(null);
        setError(null);
        setMode('select');
    }, [stopCamera]);

    // Confirm and use result
    const confirmResult = useCallback(() => {
        if (scanResult) {
            onScanComplete(scanResult);
        }
    }, [scanResult, onScanComplete]);

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b border-border"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
            >
                <button onClick={onCancel || reset} className="p-2 rounded-full hover:bg-muted">
                    <X size={24} />
                </button>
                <h1 className="font-semibold">Scan Scorecard</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* Mode: Select */}
                    {mode === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center p-6 gap-6"
                        >
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                style={{ background: 'var(--masters-subtle)' }}
                            >
                                <Sparkles size={40} style={{ color: 'var(--masters)' }} />
                            </div>

                            <div className="text-center">
                                <h2 className="text-xl font-bold mb-2">Quick Course Setup</h2>
                                <p className="text-muted-foreground">
                                    Take a photo of a scorecard to auto-populate
                                    par, handicap, and yardage for all 18 holes
                                </p>
                            </div>

                            <div className="w-full max-w-sm space-y-3">
                                <button
                                    onClick={startCamera}
                                    className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium"
                                    style={{ background: 'var(--masters)', color: 'white' }}
                                >
                                    <Camera size={20} />
                                    Take Photo
                                </button>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium bg-muted hover:bg-muted/80"
                                >
                                    <Upload size={20} />
                                    Upload Image
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground text-center max-w-xs">
                                Works best with clear, well-lit photos of printed scorecards
                            </p>
                        </motion.div>
                    )}

                    {/* Mode: Camera */}
                    {mode === 'camera' && (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full relative bg-black"
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />

                            {/* Capture guide overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-8 border-2 border-white/50 rounded-2xl" />
                                <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 text-center text-white text-sm bg-black/50 py-2 rounded-lg">
                                    Align scorecard within frame
                                </div>
                            </div>

                            {/* Capture button */}
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                                <button
                                    onClick={capturePhoto}
                                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center"
                                    style={{ boxShadow: '0 0 0 4px rgba(255,255,255,0.3)' }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-full"
                                        style={{ background: 'var(--masters)' }}
                                    />
                                </button>
                            </div>

                            <canvas ref={canvasRef} className="hidden" />
                        </motion.div>
                    )}

                    {/* Mode: Preview */}
                    {mode === 'preview' && capturedImage && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                        >
                            {/* Image preview */}
                            <div className="flex-1 relative bg-black overflow-hidden">
                                <img
                                    src={capturedImage}
                                    alt="Captured scorecard"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Actions */}
                            <div className="p-4 space-y-3">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500">
                                        <AlertCircle size={16} />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={processImage}
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium disabled:opacity-50"
                                    style={{ background: 'var(--masters)', color: 'white' }}
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <ZoomIn size={20} />
                                    )}
                                    Extract Course Data
                                </button>

                                <button
                                    onClick={reset}
                                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-muted hover:bg-muted/80"
                                >
                                    <RotateCcw size={18} />
                                    Retake Photo
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Mode: Processing */}
                    {mode === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center p-6 gap-4"
                        >
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                style={{ background: 'var(--masters-subtle)' }}
                            >
                                <Loader2
                                    size={40}
                                    className="animate-spin"
                                    style={{ color: 'var(--masters)' }}
                                />
                            </div>

                            <div className="text-center">
                                <h2 className="text-lg font-semibold mb-1">Reading Scorecard...</h2>
                                <p className="text-sm text-muted-foreground">
                                    AI is extracting hole data
                                </p>
                            </div>

                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: 'var(--masters)' }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Mode: Result */}
                    {mode === 'result' && scanResult && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                        >
                            {/* Success header */}
                            <div className="p-4 flex items-center gap-3 border-b border-border">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--success-subtle)' }}
                                >
                                    <Check size={20} style={{ color: 'var(--success)' }} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">Data Extracted!</h2>
                                    {scanResult.courseName && (
                                        <p className="text-sm text-muted-foreground">
                                            {scanResult.courseName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Data preview */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Holes summary */}
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <h3 className="font-medium mb-3">
                                        {scanResult.holes.length} Holes Detected
                                    </h3>

                                    {/* Front 9 */}
                                    <div className="mb-4">
                                        <p className="text-xs text-muted-foreground mb-2">Front 9</p>
                                        <div className="grid grid-cols-9 gap-1">
                                            {scanResult.holes.slice(0, 9).map((hole, i) => (
                                                <div
                                                    key={i}
                                                    className="text-center bg-card rounded p-1"
                                                >
                                                    <div className="text-xs text-muted-foreground">
                                                        {i + 1}
                                                    </div>
                                                    <div className="font-medium text-sm">
                                                        {hole.par}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Back 9 */}
                                    {scanResult.holes.length > 9 && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">Back 9</p>
                                            <div className="grid grid-cols-9 gap-1">
                                                {scanResult.holes.slice(9, 18).map((hole, i) => (
                                                    <div
                                                        key={i}
                                                        className="text-center bg-card rounded p-1"
                                                    >
                                                        <div className="text-xs text-muted-foreground">
                                                            {i + 10}
                                                        </div>
                                                        <div className="font-medium text-sm">
                                                            {hole.par}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 flex gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Total Par:</span>{' '}
                                            <span className="font-medium">
                                                {scanResult.holes.reduce((sum, h) => sum + h.par, 0)}
                                            </span>
                                        </div>
                                        {scanResult.rating && (
                                            <div>
                                                <span className="text-muted-foreground">Rating:</span>{' '}
                                                <span className="font-medium">{scanResult.rating}</span>
                                            </div>
                                        )}
                                        {scanResult.slope && (
                                            <div>
                                                <span className="text-muted-foreground">Slope:</span>{' '}
                                                <span className="font-medium">{scanResult.slope}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tee sets */}
                                {scanResult.teeSets && scanResult.teeSets.length > 0 && (
                                    <div className="bg-muted/50 rounded-xl p-4">
                                        <h3 className="font-medium mb-3">
                                            {scanResult.teeSets.length} Tee Sets Found
                                        </h3>
                                        <div className="space-y-2">
                                            {scanResult.teeSets.map((tee, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            background: getTeeColor(tee.name || tee.color),
                                                        }}
                                                    />
                                                    <span className="font-medium">{tee.name}</span>
                                                    {tee.rating && (
                                                        <span className="text-muted-foreground">
                                                            {tee.rating}/{tee.slope}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-border space-y-2">
                                <button
                                    onClick={confirmResult}
                                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-medium"
                                    style={{ background: 'var(--masters)', color: 'white' }}
                                >
                                    <Check size={20} />
                                    Use This Data
                                </button>
                                <button
                                    onClick={reset}
                                    className="w-full py-3 rounded-xl bg-muted hover:bg-muted/80"
                                >
                                    Scan Again
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Safe area */}
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
    );
}

// Helper to get tee color
function getTeeColor(teeName?: string): string {
    const name = teeName?.toLowerCase() || '';
    if (name.includes('black')) return '#1a1a1a';
    if (name.includes('blue')) return '#2563eb';
    if (name.includes('white')) return '#e5e5e5';
    if (name.includes('gold') || name.includes('yellow')) return '#eab308';
    if (name.includes('red')) return '#dc2626';
    if (name.includes('green')) return '#16a34a';
    return '#6b7280';
}

// Quick action button to trigger scanner
interface ScanScorecardButtonProps {
    onScanComplete: (data: ScorecardData) => void;
    variant?: 'default' | 'compact';
}

export function ScanScorecardButton({ onScanComplete, variant = 'default' }: ScanScorecardButtonProps) {
    const [showScanner, setShowScanner] = useState(false);

    return (
        <>
            {variant === 'default' ? (
                <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                    <Camera size={18} />
                    <span className="font-medium">Scan Scorecard</span>
                </button>
            ) : (
                <button
                    onClick={() => setShowScanner(true)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80"
                    title="Scan Scorecard"
                >
                    <Camera size={18} />
                </button>
            )}

            {showScanner && (
                <ScorecardScanner
                    onScanComplete={(data) => {
                        onScanComplete(data);
                        setShowScanner(false);
                    }}
                    onCancel={() => setShowScanner(false)}
                />
            )}
        </>
    );
}
