import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseAssessment from './ExerciseAssessment';

import { createSquatAnalyzer } from '../../services/movement/squatAnalysis';
import { createBalanceAnalyzer } from '../../services/movement/balanceAnalysis';
import { createPlankAnalyzer } from '../../services/movement/plankAnalysis';
import { createReactionAnalyzer } from '../../services/movement/reactionAnalysis';

import { createFitnessAssessment } from '../../models/models';
import { assessmentRepository, getCurrentUserId } from '../../repositories/repositories';

// The steps in our Fitness DNA assessment
const ASSESSMENT_STEPS = [
    { id: 'welcome', type: 'info', title: 'Fitness DNA Assessment' },
    { 
        id: 'squat', 
        type: 'exercise', 
        title: 'Squat Analysis', 
        instructions: ['Stand back so your full body is visible.', 'Perform 5 slow, deep squats.', 'Face the camera directly.'],
        duration: 0 // Until reps completed
    },
    { 
        id: 'balance', 
        type: 'exercise', 
        title: 'Single-Leg Balance', 
        instructions: ['Stand back so your full body is visible.', 'Lift one leg and balance.', 'Hold as long as you can (up to 30s).'],
        duration: 30
    },
    { 
        id: 'plank', 
        type: 'exercise', 
        title: 'Plank Alignment', 
        instructions: ['Place camera on the floor.', 'Get into a side-profile plank position.', 'Hold a straight line for 20 seconds.'],
        duration: 20
    },
    { 
        id: 'reaction', 
        type: 'exercise', 
        title: 'Reaction Challenge', 
        instructions: ['Stand close enough to touch the screen/air.', 'Touch the virtual targets as fast as possible.'],
        duration: 30
    },
    { id: 'results', type: 'info', title: 'Processing Results...' }
];

const AssessmentFlow = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [results, setResults] = useState({});
    const analyzerRef = useRef(null);
    const navigate = useNavigate();

    const currentStep = ASSESSMENT_STEPS[currentStepIndex];

    // Initialize the appropriate analyzer when step changes
    useEffect(() => {
        if (currentStep.type !== 'exercise') return;

        switch (currentStep.id) {
            case 'squat':
                analyzerRef.current = createSquatAnalyzer();
                break;
            case 'balance':
                analyzerRef.current = createBalanceAnalyzer();
                break;
            case 'plank':
                analyzerRef.current = createPlankAnalyzer();
                break;
            case 'reaction':
                analyzerRef.current = createReactionAnalyzer();
                analyzerRef.current.startGame(Date.now(), 30000);
                break;
            default:
                analyzerRef.current = null;
        }
    }, [currentStep.id, currentStep.type]);

    const handleFrame = (landmarks, timestamp) => {
        if (analyzerRef.current && analyzerRef.current.analyzeFrame) {
            const metrics = analyzerRef.current.analyzeFrame(landmarks, timestamp);
            
            // Custom auto-completion logic
            if (currentStep.id === 'squat' && metrics.repCount >= 5) {
                return { ...metrics, state: 'FINISHED' };
            }
            
            return metrics;
        }
        return null;
    };

    const handleComplete = (finalMetrics) => {
        // Save the result for this step
        setResults(prev => ({ ...prev, [currentStep.id]: finalMetrics || analyzerRef.current?.getState() }));
        
        // Move to next step
        if (currentStepIndex < ASSESSMENT_STEPS.length - 1) {
            setCurrentStepIndex(i => i + 1);
        }
    };

    // When we hit the results step, compile and save data
    useEffect(() => {
        if (currentStep.id === 'results') {
            processAndSaveResults();
        }
    }, [currentStep.id]);

    const processAndSaveResults = () => {
        // Mock scoring logic for Phase 2 (will be replaced by full scoring engine in Phase 4)
        
        // Squat affects Strength and Mobility
        const squatQuality = results.squat?.sessionQuality || 50;
        
        // Balance affects Balance and Coordination
        const balanceLeft = results.balance?.leftStabilityScore || 0;
        const balanceRight = results.balance?.rightStabilityScore || 0;
        const balanceAvg = (balanceLeft + balanceRight) / 2 || 50;
        
        // Plank affects Endurance and Strength
        const plankForm = results.plank?.formScore || 50;
        
        // Reaction affects Coordination
        const reactionCoord = results.reaction?.coordinationScore || 50;

        const scores = {
            strength: Math.round((squatQuality + plankForm) / 2),
            balance: Math.round(balanceAvg),
            mobility: Math.round(squatQuality), // Placeholder
            endurance: Math.round(plankForm),
            coordination: Math.round((balanceAvg + reactionCoord) / 2),
            consistency: 80, // Needs historical data
            recovery: 70     // Needs historical data
        };

        const assessment = createFitnessAssessment({
            userId: getCurrentUserId(),
            scores,
            exerciseResults: [
                { type: 'squat', data: results.squat },
                { type: 'balance', data: results.balance },
                { type: 'plank', data: results.plank },
                { type: 'reaction', data: results.reaction },
            ]
        });

        assessmentRepository.save(assessment);

        // Redirect to results page after a brief delay
        setTimeout(() => {
            navigate('/fitness-dna/results');
        }, 2000);
    };

    // Renderers
    if (currentStep.id === 'welcome') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
                <div className="max-w-2xl text-center bg-gray-900 p-10 rounded-3xl border border-gray-800 shadow-2xl">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-[#f15377] bg-clip-text text-transparent">
                        Discover Your Fitness DNA
                    </h1>
                    <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                        Complete a series of quick AI-analyzed movements to generate your unique movement fingerprint. 
                        We'll analyze your strength, balance, mobility, and coordination.
                    </p>
                    <button 
                        onClick={() => setCurrentStepIndex(1)}
                        className="px-8 py-4 bg-gradient-to-r from-[#f15377] to-[#d63a5e] rounded-full text-lg font-bold shadow-[0_0_20px_rgba(241,83,119,0.3)] hover:scale-105 transition-transform w-full mb-4"
                    >
                        Start Assessment
                    </button>
                    <button 
                        onClick={() => navigate('/main')}
                        className="px-8 py-4 bg-transparent text-gray-400 border border-gray-700 hover:text-white rounded-full text-lg font-bold transition-colors w-full"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep.id === 'results') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
                <div className="spinner mb-6 border-t-[#f15377] w-16 h-16 border-4"></div>
                <h2 className="text-3xl font-bold">Analyzing Movement Data...</h2>
                <p className="text-gray-400 mt-4">Computing your unique Fitness DNA signature</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-20 pb-10">
            {/* Progress Bar and Back Button */}
            <div className="max-w-6xl mx-auto px-4 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/main')} className="text-gray-400 hover:text-white flex items-center gap-2">
                        <span>←</span> Back to Dashboard
                    </button>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                    <span>{currentStep.title}</span>
                    <span>Step {currentStepIndex} of {ASSESSMENT_STEPS.length - 2}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-[#f15377] to-[#d63a5e] h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(currentStepIndex / (ASSESSMENT_STEPS.length - 2)) * 100}%` }}
                    ></div>
                </div>
            </div>

            <ExerciseAssessment
                key={currentStep.id} // Force remount on step change
                exerciseName={currentStep.title}
                instructions={currentStep.instructions}
                durationSeconds={currentStep.duration}
                onFrame={handleFrame}
                onComplete={handleComplete}
            />
        </div>
    );
};

export default AssessmentFlow;
