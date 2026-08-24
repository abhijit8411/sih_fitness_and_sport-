import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentRepository, getCurrentUserId } from '../../repositories/repositories';
import { createCorrectiveExercise } from '../../models/models';

// Simple rule-based recommendation engine for Phase 5
const generateRecommendations = (scores) => {
    const recs = [];
    
    if (!scores) return recs;

    if (scores.balance < 60) {
        recs.push(createCorrectiveExercise({
            id: 'balance-01',
            name: 'Single-Leg Holds',
            targetAreas: ['balance', 'stability'],
            duration: 60,
            instructions: ['Stand on one leg', 'Keep eyes focused forward', 'Hold for 30s per leg'],
            difficulty: 'beginner'
        }));
    }

    if (scores.strength < 60) {
        recs.push(createCorrectiveExercise({
            id: 'strength-01',
            name: 'Tempo Squats',
            targetAreas: ['strength', 'control'],
            duration: 120,
            instructions: ['3 seconds down', '1 second pause at bottom', '1 second up'],
            difficulty: 'intermediate'
        }));
    }

    if (scores.coordination < 60) {
        recs.push(createCorrectiveExercise({
            id: 'coord-01',
            name: 'Cross-Body Reaches',
            targetAreas: ['coordination', 'mobility'],
            duration: 90,
            instructions: ['Reach right hand to left foot', 'Return to standing', 'Alternate sides'],
            difficulty: 'beginner'
        }));
    }

    // New beginner task requested by user
    if (scores.mobility < 60 || recs.length < 2) {
        recs.push(createCorrectiveExercise({
            id: 'mob-02',
            name: 'Seated Reach',
            targetAreas: ['mobility', 'recovery'],
            duration: 60,
            instructions: ['Sit on floor with legs extended', 'Reach slowly for your toes', 'Hold and breathe deeply'],
            difficulty: 'beginner'
        }));
    }

    // Default if they scored high on everything
    if (recs.length === 0) {
        recs.push(createCorrectiveExercise({
            id: 'maint-01',
            name: 'Full Body Flow',
            targetAreas: ['mobility', 'recovery'],
            duration: 180,
            instructions: ['Deep squat', 'Walk hands out to plank', 'Return to standing'],
            difficulty: 'advanced'
        }));
    }

    return recs;
};

const MovementCoach = () => {
    const [assessment, setAssessment] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const latest = assessmentRepository.getLatestByUserId(getCurrentUserId());
        if (latest) {
            setAssessment(latest);
            setRecommendations(generateRecommendations(latest.scores));
        }
    }, []);

    if (!assessment) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="text-6xl mb-6">🤖</div>
                <h1 className="text-3xl font-bold mb-4">Your AI Coach is Waiting</h1>
                <p className="text-gray-400 mb-8 max-w-md">
                    Complete a Fitness DNA assessment first so I can analyze your movement patterns and provide personalized recommendations.
                </p>
                <button 
                    onClick={() => navigate('/fitness-dna')}
                    className="px-8 py-3 bg-[#f15377] hover:bg-[#d63a5e] rounded-full font-bold transition-colors"
                >
                    Start Assessment
                </button>
            </div>
        );
    }

    // Extract real observations from the latest assessment data
    const observations = assessment.exerciseResults?.flatMap(res => {
        if (!res.data || !res.data.reps) return [];
        return res.data.reps.flatMap(rep => rep.observations || []);
    }) || [];

    // Filter unique observations
    const uniqueObservations = [...new Set(observations)];

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 text-white">
            <div className="max-w-5xl mx-auto px-6">
                
                <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-4 mb-2">
                            <span className="text-5xl">🤖</span> AI Movement Coach
                        </h1>
                        <p className="text-gray-400">
                            Personalized corrective strategies based on your specific movement patterns.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/main')}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors hidden sm:block"
                    >
                        Dashboard
                    </button>
                </div>

                {/* Observations Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <span className="text-[#f15377]">👁️</span> What I Observed
                    </h2>
                    
                    {uniqueObservations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {uniqueObservations.map((obs, i) => (
                                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500 shrink-0"></div>
                                    <p className="text-gray-300 leading-relaxed">
                                        <span className="text-gray-500 font-mono text-sm block mb-1">POSSIBLE PATTERN DETECTED</span>
                                        {obs}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-900 border border-green-900/50 rounded-xl p-6 text-center">
                            <p className="text-green-400">Your movement patterns look solid! No critical form breakdowns observed.</p>
                        </div>
                    )}
                </div>

                {/* Recommendations Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <span className="text-[#f15377]">🛠️</span> Suggested Micro-Exercises
                    </h2>
                    <p className="text-gray-400 mb-6">
                        These exercises are selected to address the specific patterns observed in your assessment.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {recommendations.map(rec => (
                            <div key={rec.id} className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-6 flex flex-col shadow-xl hover:border-gray-600 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white">{rec.name}</h3>
                                    <span className="text-xs font-mono px-2 py-1 bg-white/10 rounded text-gray-300 capitalize">
                                        {rec.difficulty}
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {rec.targetAreas.map(area => (
                                        <span key={area} className="text-xs px-2 py-1 bg-[#f15377]/20 text-[#f15377] rounded-full capitalize">
                                            {area}
                                        </span>
                                    ))}
                                </div>

                                <ul className="text-gray-400 text-sm space-y-2 mb-8 flex-grow">
                                    {rec.instructions.map((inst, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-gray-600">•</span> {inst}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                                    <span className="text-gray-400 text-sm">⏱️ {rec.duration}s</span>
                                    <button 
                                        onClick={() => navigate('/quick-fit')}
                                        className="text-[#f15377] font-semibold hover:text-white transition-colors"
                                    >
                                        Try it →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MovementCoach;
