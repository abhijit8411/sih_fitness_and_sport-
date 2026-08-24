import React, { useRef, useEffect, useState } from 'react';
import { startPoseEngine, drawPoseOnCanvas } from '../../services/movement/poseEngine';
import { createLandmarkSmoother } from '../../services/movement/smoothing';

/**
 * Reusable Camera Assessment Component
 * Handles the webcam, MediaPipe integration, and generic UI overlay.
 */
const ExerciseAssessment = ({ 
    exerciseName, 
    instructions, 
    onFrame, 
    onComplete,
    durationSeconds = 0, // If > 0, auto-completes after time
    showCountdown = true
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('INITIALIZING'); // INITIALIZING, READY, COUNTDOWN, ACTIVE, FINISHED
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(durationSeconds);
    const [metrics, setMetrics] = useState(null); // Data returned from onFrame
    const [engine, setEngine] = useState(null);
    
    // Maintain a smoother instance
    const smootherRef = useRef(createLandmarkSmoother(0.5));
    const startTimeRef = useRef(0);

    // Initialization and Cleanup
    useEffect(() => {
        let poseEngine = null;

        const initCamera = async () => {
            try {
                // Request camera permission explicitly first to handle errors
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    
                    poseEngine = startPoseEngine(videoRef.current, handleResults);
                    if (poseEngine) {
                        setEngine(poseEngine);
                        setStatus(showCountdown ? 'COUNTDOWN' : 'ACTIVE');
                    } else {
                        setStatus('ERROR');
                    }
                }
            } catch (err) {
                console.error("Camera access denied or failed", err);
                setStatus('CAMERA_ERROR');
            }
        };

        initCamera();

        return () => {
            if (poseEngine) poseEngine.stop();
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Countdown Timer
    useEffect(() => {
        if (status === 'COUNTDOWN') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setStatus('ACTIVE');
                startTimeRef.current = Date.now();
            }
        }
    }, [status, countdown]);

    // Active Timer (if duration specified)
    useEffect(() => {
        if (status === 'ACTIVE' && durationSeconds > 0) {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                finishAssessment();
            }
        }
    }, [status, timeLeft, durationSeconds]);

    const handleResults = (results) => {
        if (status !== 'ACTIVE') {
            // Still draw the pose during countdown/initialization
            drawPoseOnCanvas(canvasRef, results);
            return;
        }

        // Smooth landmarks
        const smoothedLandmarks = smootherRef.current.smooth(results.poseLandmarks);
        const smoothedResults = { ...results, poseLandmarks: smoothedLandmarks };

        drawPoseOnCanvas(canvasRef, smoothedResults);

        // Pass to parent analyzer
        if (onFrame) {
            const timestamp = Date.now();
            const frameMetrics = onFrame(smoothedLandmarks, timestamp);
            if (frameMetrics) {
                setMetrics(frameMetrics);
                // Check if the analyzer itself determined the exercise is finished
                if (frameMetrics.state === 'FINISHED') {
                    finishAssessment();
                }
            }
        }
    };

    const finishAssessment = () => {
        setStatus('FINISHED');
        if (engine) engine.stop();
        if (onComplete) onComplete(metrics);
    };

    // UI Renderers
    const renderOverlay = () => {
        if (status === 'INITIALIZING') {
            return <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20">
                <div className="spinner mb-4 border-t-[#f15377]"></div>
                <p>Starting Camera & AI Engine...</p>
            </div>;
        }
        if (status === 'CAMERA_ERROR') {
            return <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-20 p-8 text-center">
                <h2 className="text-2xl text-red-500 mb-4">Camera Error</h2>
                <p>Unable to access your camera. Please ensure permissions are granted and no other app is using it.</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-[#f15377] rounded-full">Retry</button>
            </div>;
        }
        if (status === 'COUNTDOWN') {
            return <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white z-20">
                <span className="text-8xl font-bold text-[#f15377] drop-shadow-lg">{countdown}</span>
            </div>;
        }
        return null;
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto p-4">
            
            {/* Left: Camera Feed */}
            <div className="relative w-full md:w-2/3 aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <video 
                    ref={videoRef} 
                    className="absolute inset-0 w-full h-full object-cover hidden" 
                    playsInline 
                />
                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full object-cover z-10" 
                    width="640" 
                    height="480" 
                />
                
                {renderOverlay()}

                {/* In-video UI overlays */}
                {status === 'ACTIVE' && durationSeconds > 0 && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg font-mono text-xl z-20">
                        ⏱️ {timeLeft}s
                    </div>
                )}
            </div>

            {/* Right: Instructions & Real-time Metrics */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-2">{exerciseName}</h2>
                    <ul className="text-gray-300 space-y-2 mb-6 text-sm">
                        {instructions.map((inst, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-[#f15377]">•</span> {inst}
                            </li>
                        ))}
                    </ul>

                    {/* Metrics Display */}
                    {metrics && (
                        <div className="bg-white/5 rounded-xl p-4 space-y-3">
                            <h3 className="text-white font-semibold border-b border-white/10 pb-2">Live Metrics</h3>
                            
                            {metrics.repCount !== undefined && (
                                <div className="flex justify-between text-gray-200">
                                    <span>Reps</span>
                                    <span className="font-mono text-[#f15377] font-bold text-lg">{metrics.repCount}</span>
                                </div>
                            )}
                            
                            {metrics.formScore !== undefined && (
                                <div className="flex justify-between text-gray-200">
                                    <span>Form Quality</span>
                                    <span className="font-mono">{metrics.formScore}/100</span>
                                </div>
                            )}

                            {metrics.currentStability !== undefined && (
                                <div className="flex justify-between text-gray-200">
                                    <span>Stability</span>
                                    <span className="font-mono">{metrics.currentStability}/100</span>
                                </div>
                            )}

                            {metrics.state && (
                                <div className="flex justify-between text-gray-200">
                                    <span>Status</span>
                                    <span className="text-xs uppercase bg-white/10 px-2 py-1 rounded">{metrics.state}</span>
                                </div>
                            )}

                            {metrics.score !== undefined && ( // Reaction Game
                                <div className="flex justify-between text-gray-200">
                                    <span>Targets Hit</span>
                                    <span className="font-mono text-[#f15377] font-bold text-lg">{metrics.score}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button 
                    onClick={finishAssessment}
                    className="mt-auto bg-gray-800 hover:bg-[#f15377] text-white py-4 rounded-xl font-semibold transition-colors border border-white/10 hover:border-transparent"
                >
                    End Early
                </button>
            </div>
        </div>
    );
};

export default ExerciseAssessment;
