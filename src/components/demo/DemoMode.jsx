import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentRepository, getCurrentUserId } from '../../repositories/repositories';
import { createFitnessAssessment, createRepData } from '../../models/models';

const DemoMode = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('IDLE');

    const loadDemoData = () => {
        setStatus('LOADING');

        // Create a realistic sample assessment
        const sampleAssessment = createFitnessAssessment({
            userId: getCurrentUserId(),
            assessmentDate: new Date().toISOString(),
            scores: {
                strength: 72,
                balance: 45,
                mobility: 82,
                endurance: 61,
                coordination: 39,
                consistency: 55,
                recovery: 70,
                overall: 61
            },
            exerciseResults: [
                {
                    type: 'squat',
                    data: {
                        reps: [
                            createRepData({
                                repNumber: 1, depthScore: 90, symmetryScore: 85, stabilityScore: 80,
                                observations: []
                            }),
                            createRepData({
                                repNumber: 2, depthScore: 85, symmetryScore: 80, stabilityScore: 75,
                                observations: []
                            }),
                            createRepData({
                                repNumber: 3, depthScore: 60, symmetryScore: 70, stabilityScore: 60,
                                observations: ["Squat depth decreased during later repetitions."]
                            }),
                            createRepData({
                                repNumber: 4, depthScore: 50, symmetryScore: 65, stabilityScore: 50,
                                observations: ["Squat depth decreased during later repetitions.", "Movement control became less consistent as repetitions increased."]
                            })
                        ]
                    }
                },
                {
                    type: 'balance',
                    data: {
                        leftStabilityScore: 78,
                        rightStabilityScore: 52,
                        reps: [
                            { observations: ["Your right-side stability was lower than your left during the balance assessment."] }
                        ]
                    }
                }
            ]
        });

        // Save to local storage
        assessmentRepository.save(sampleAssessment);

        // Fake loading delay for effect
        setTimeout(() => {
            setStatus('DONE');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="max-w-2xl bg-gray-900 border border-gray-800 p-10 rounded-3xl shadow-2xl">
                <h1 className="text-4xl font-bold mb-6 text-[#f15377]">Smart India Hackathon Demo</h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    This will populate your local storage with sample Fitness DNA data, realistic movement observations, and historical trends. 
                    This allows you to demonstrate the AI Coach, Quick Fit, and Dashboards immediately without requiring the judges to perform a 5-minute camera assessment.
                </p>

                {status === 'IDLE' && (
                    <button 
                        onClick={loadDemoData}
                        className="px-8 py-4 bg-[#f15377] hover:bg-[#d63a5e] rounded-xl font-bold w-full transition-colors"
                    >
                        Load Sample Data
                    </button>
                )}

                {status === 'LOADING' && (
                    <div className="flex flex-col items-center text-[#f15377]">
                        <div className="spinner border-t-[#f15377] mb-4"></div>
                        <p>Generating sample movement fingerprint...</p>
                    </div>
                )}

                {status === 'DONE' && (
                    <div className="space-y-4">
                        <div className="text-green-400 font-bold text-xl mb-6">✅ Demo Data Loaded Successfully!</div>
                        <button 
                            onClick={() => navigate('/main')}
                            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold w-full transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button 
                            onClick={() => navigate('/fitness-dna/results')}
                            className="px-8 py-3 bg-transparent border border-[#f15377] text-[#f15377] hover:bg-[#f15377]/10 rounded-xl font-bold w-full transition-colors"
                        >
                            View DNA Results Directly
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DemoMode;
