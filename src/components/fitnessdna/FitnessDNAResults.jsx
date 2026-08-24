import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentRepository, getCurrentUserId } from '../../repositories/repositories';
import DNARadarChart from './DNARadarChart';

const FitnessDNAResults = () => {
    const [assessment, setAssessment] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load the latest assessment
        const latest = assessmentRepository.getLatestByUserId(getCurrentUserId());
        if (latest) {
            setAssessment(latest);
        } else {
            // No assessment found, redirect to start
            navigate('/fitness-dna');
        }
    }, [navigate]);

    if (!assessment) return null;

    const scores = assessment.scores;
    
    // Find highest and lowest scores for insights
    const scoreEntries = Object.entries(scores).filter(([k]) => k !== 'overall' && k !== 'consistency' && k !== 'recovery');
    scoreEntries.sort((a, b) => b[1] - a[1]);
    
    const highest = scoreEntries[0];
    const lowest = scoreEntries[scoreEntries.length - 1];

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 text-white">
            <div className="max-w-5xl mx-auto px-6">
                
                {/* Header */}
                <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#f15377] bg-clip-text text-transparent mb-2">
                            Your Fitness DNA
                        </h1>
                        <p className="text-gray-400">
                            Assessment Date: {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/main')}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* Left: Radar Chart */}
                    <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
                        <div className="w-full h-80 mb-6">
                            <DNARadarChart scores={scores} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {scoreEntries.map(([key, val]) => (
                                <div key={key} className="bg-black/40 rounded-xl p-3 border border-gray-800/50 flex justify-between items-center">
                                    <span className="text-gray-400 capitalize">{key}</span>
                                    <span className={`font-mono font-bold ${val > 70 ? 'text-green-400' : val < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Insights */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-gradient-to-br from-[#f15377]/20 to-transparent border border-[#f15377]/30 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span>🧠</span> AI Movement Insights
                            </h2>
                            
                            <div className="space-y-4">
                                <p className="text-lg leading-relaxed text-gray-200">
                                    Based on your camera movement analysis, your strongest area is <strong className="text-white capitalize">{highest[0]}</strong> with a score of {highest[1]}.
                                </p>
                                <p className="text-lg leading-relaxed text-gray-200">
                                    Currently, your lowest assessment area is <strong className="text-white capitalize">{lowest[0]}</strong> ({lowest[1]}).
                                </p>
                            </div>

                            <button 
                                onClick={() => navigate('/movement-coach')}
                                className="mt-8 w-full py-4 bg-[#f15377] hover:bg-[#d63a5e] rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1"
                            >
                                Get Personalized Coaching
                            </button>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center">
                            <h3 className="text-xl font-semibold mb-2">Short on time?</h3>
                            <p className="text-gray-400 mb-6">Generate a time-boxed workout specifically targeting your {lowest[0]} weaknesses.</p>
                            <button 
                                onClick={() => navigate('/quick-fit')}
                                className="px-6 py-2 bg-transparent border border-[#f15377] text-[#f15377] hover:bg-[#f15377]/10 rounded-full transition-colors"
                            >
                                Launch Quick Fit
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FitnessDNAResults;
