import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuickFit } from '../../services/quickfit/quickWorkoutEngine';
import { assessmentRepository, quickWorkoutRepository, getCurrentUserId } from '../../repositories/repositories';

// Added 30, 60 (1 hr), 120 (2 hr) options as requested
const DURATION_OPTIONS = [1, 5, 10, 20, 30, 60, 120];

const QuickFit = () => {
    const [selectedMinutes, setSelectedMinutes] = useState(3);
    const [session, setSession] = useState(null);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(-1);
    const [timer, setTimer] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    const navigate = useNavigate();

    // Generate session
    const handleGenerate = () => {
        const latestAssessment = assessmentRepository.getLatestByUserId(getCurrentUserId());
        const scores = latestAssessment ? latestAssessment.scores : null;
        const newSession = generateQuickFit(selectedMinutes, scores, getCurrentUserId());
        setSession(newSession);
        setActiveExerciseIndex(-1); // Waiting to start
    };

    // Start Session
    const handleStart = () => {
        setActiveExerciseIndex(0);
        setTimer(session.exercises[0].duration);
        setIsPaused(false);
    };

    // Timer logic
    useEffect(() => {
        let interval;
        if (activeExerciseIndex >= 0 && activeExerciseIndex < session?.exercises.length && !isPaused) {
            if (timer > 0) {
                interval = setInterval(() => {
                    setTimer(t => t - 1);
                }, 1000);
            } else {
                // Move to next exercise
                const nextIdx = activeExerciseIndex + 1;
                if (nextIdx < session.exercises.length) {
                    setActiveExerciseIndex(nextIdx);
                    setTimer(session.exercises[nextIdx].duration);
                } else {
                    // Finished
                    setActiveExerciseIndex(session.exercises.length);
                    quickWorkoutRepository.save({ ...session, completedAt: new Date().toISOString() });
                }
            }
        }
        return () => clearInterval(interval);
    }, [activeExerciseIndex, timer, isPaused, session]);

    // Renderers
    if (!session) {
        return (
            <div className="min-h-screen bg-black pt-24 pb-12 text-white flex flex-col items-center">
                <div className="max-w-2xl w-full px-6">
                    <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-5xl">⚡</span> Quick Fit
                    </h1>
                    <p className="text-gray-400 mb-10 text-lg">
                        Short on time? Let the AI generate a personalized micro-session based on your Fitness DNA weaknesses.
                    </p>

                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-xl font-semibold mb-6">How much time do you have?</h2>
                        
                        <div className="flex flex-wrap gap-4 mb-10">
                            {DURATION_OPTIONS.map(min => (
                                <button
                                    key={min}
                                    onClick={() => setSelectedMinutes(min)}
                                    className={`flex-1 py-4 px-2 rounded-xl text-lg font-bold transition-all border-2 ${
                                        selectedMinutes === min 
                                        ? 'bg-[#f15377]/20 border-[#f15377] text-[#f15377]' 
                                        : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'
                                    }`}
                                >
                                    {min >= 60 ? `${min / 60} hr` : `${min} min`}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleGenerate}
                            className="w-full py-4 bg-[#f15377] hover:bg-[#d63a5e] rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(241,83,119,0.3)] transition-transform hover:-translate-y-1"
                        >
                            Generate Session
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeExerciseIndex === session.exercises.length) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                <span className="text-6xl mb-6">🎉</span>
                <h2 className="text-4xl font-bold mb-4">Mission Accomplished!</h2>
                <p className="text-xl text-gray-400 mb-8">You crushed your {selectedMinutes}-minute Quick Fit.</p>
                <button 
                    onClick={() => navigate('/main')}
                    className="px-8 py-3 bg-[#f15377] rounded-full font-bold"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const activeExercise = activeExerciseIndex >= 0 ? session.exercises[activeExerciseIndex] : null;

    return (
        <div className="min-h-screen bg-black pt-20 pb-12 text-white">
            <div className="max-w-4xl mx-auto px-6">
                
                {activeExerciseIndex === -1 ? (
                    // PREVIEW STATE
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Your {selectedMinutes}-Minute Mission</h2>
                                <p className="text-[#f15377] font-medium">{session.explanation}</p>
                            </div>
                            <button onClick={() => setSession(null)} className="text-gray-500 hover:text-white">Cancel</button>
                        </div>

                        <div className="space-y-3 mb-8">
                            {session.exercises.map((ex, i) => (
                                <div key={i} className={`flex justify-between items-center p-4 rounded-xl border ${ex.type === 'rest' ? 'bg-black border-gray-800 text-gray-500' : 'bg-gray-800/50 border-gray-700'}`}>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-500 font-mono w-6">{i+1}</span>
                                        <span className="font-semibold">{ex.name}</span>
                                    </div>
                                    <span className="font-mono">{ex.duration}s</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleStart}
                            className="w-full py-4 bg-[#f15377] hover:bg-[#d63a5e] rounded-xl font-bold text-lg shadow-lg"
                        >
                            START MISSION
                        </button>
                    </div>
                ) : (
                    // ACTIVE STATE
                    <div className="flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-12">
                            <span className="text-gray-400 font-mono">EXERCISE {activeExerciseIndex + 1}/{session.exercises.length}</span>
                            <button onClick={() => navigate('/main')} className="text-red-400 hover:text-red-300">Abort</button>
                        </div>

                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-bold mb-4">{activeExercise.name}</h2>
                            {activeExercise.type === 'rest' 
                                ? <p className="text-2xl text-yellow-500">Catch your breath!</p>
                                : <p className="text-xl text-[#f15377] capitalize">{activeExercise.targetArea} Focus</p>
                            }
                        </div>

                        {/* Huge Timer */}
                        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle 
                                    cx="128" cy="128" r="120" 
                                    className="stroke-gray-800" fill="none" strokeWidth="8"
                                />
                                <circle 
                                    cx="128" cy="128" r="120" 
                                    className={`stroke-[#f15377] transition-all duration-1000 ease-linear ${activeExercise.type === 'rest' ? 'stroke-yellow-500' : ''}`}
                                    fill="none" strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 120}
                                    strokeDashoffset={2 * Math.PI * 120 * (1 - timer / activeExercise.duration)}
                                />
                            </svg>
                            <span className="text-7xl font-mono font-bold z-10">{timer}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-6">
                            <button 
                                onClick={() => setIsPaused(!isPaused)}
                                className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                            >
                                {isPaused ? <span className="text-2xl">▶️</span> : <span className="text-2xl">⏸️</span>}
                            </button>
                            
                            <button 
                                onClick={() => setTimer(0)}
                                className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                            >
                                <span className="text-2xl">⏭️</span>
                            </button>
                        </div>

                        {/* Next Up */}
                        {activeExerciseIndex < session.exercises.length - 1 && (
                            <div className="mt-12 text-gray-500">
                                Next: {session.exercises[activeExerciseIndex + 1].name}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default QuickFit;
