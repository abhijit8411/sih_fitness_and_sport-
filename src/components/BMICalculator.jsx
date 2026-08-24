import { useState } from 'react';

const BMICalculator = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState('');
    const [showResult, setShowResult] = useState(false);

    function calculateBMI() {
        if (!height || !weight || height <= 0 || weight <= 0) return;
        
        const heightInMeters = parseFloat(height) / 100;
        const weightInKg = parseFloat(weight);
        const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        
        setBmi(bmiValue);
        setShowResult(true);

        if (bmiValue < 18.5) {
            setCategory('Underweight');
        } else if (bmiValue < 25) {
            setCategory('Normal Weight');
        } else if (bmiValue < 30) {
            setCategory('Overweight');
        } else {
            setCategory('Obese');
        }
    }

    function getCategoryConfig() {
        switch(category) {
            case 'Underweight': return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', icon: '🔵', gradient: 'from-blue-500/20 to-transparent' };
            case 'Normal Weight': return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50', icon: '🟢', gradient: 'from-green-500/20 to-transparent' };
            case 'Overweight': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', icon: '🟡', gradient: 'from-yellow-500/20 to-transparent' };
            case 'Obese': return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: '🔴', gradient: 'from-red-500/20 to-transparent' };
            default: return { color: 'text-white', bg: 'bg-white/10', border: 'border-white/20', icon: '', gradient: 'from-white/10 to-transparent' };
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') calculateBMI();
    }

    function resetCalculator() {
        setHeight('');
        setWeight('');
        setBmi(null);
        setCategory('');
        setShowResult(false);
    }

    const config = getCategoryConfig();

    return (
        <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 items-center justify-between">
                
                {/* Left side: Inputs */}
                <div className="flex-1 w-full relative z-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-white mb-2">⚖️ BMI Calculator</h2>
                        <p className="text-gray-400">Calculate your Body Mass Index quickly to understand your current fitness baseline.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Height (cm)</label>
                            <input
                                type="number"
                                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f15377] transition-colors"
                                placeholder="e.g. 175"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Weight (kg)</label>
                            <input
                                type="number"
                                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f15377] transition-colors"
                                placeholder="e.g. 70"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={calculateBMI}
                            className="flex-1 bg-[#f15377] hover:bg-[#d63a5e] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(241,83,119,0.3)] hover:scale-105"
                        >
                            Calculate BMI
                        </button>
                        {showResult && (
                            <button 
                                onClick={resetCalculator}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Right side: Result Panel */}
                <div className={`flex-1 w-full min-h-[220px] border rounded-2xl p-6 relative overflow-hidden transition-all duration-500 flex flex-col justify-center items-center ${showResult ? config.border + ' bg-gradient-to-br ' + config.gradient : 'border-gray-800 bg-black'}`}>
                    {!showResult ? (
                        <div className="text-gray-500 text-center">
                            <div className="text-5xl mb-3 opacity-50">📊</div>
                            <p>Enter your details to see your result.</p>
                        </div>
                    ) : (
                        <div className="w-full text-center z-10 transition-opacity duration-500 opacity-100">
                            <h3 className="text-gray-300 text-lg mb-1">Your BMI is</h3>
                            <div className="text-6xl font-black text-white mb-2">{bmi}</div>
                            <div className={`text-xl font-bold mb-6 flex justify-center items-center gap-2 ${config.color}`}>
                                <span>{config.icon}</span> {category}
                            </div>
                            
                            {/* Scale Bar */}
                            <div className="w-full flex rounded-full overflow-hidden h-3 bg-gray-800 shadow-inner">
                                <div className={`h-full bg-blue-500 transition-all ${category === 'Underweight' ? 'opacity-100 w-[25%]' : 'opacity-30 w-[25%]'}`} title="Underweight (< 18.5)"></div>
                                <div className={`h-full bg-green-500 transition-all ${category === 'Normal Weight' ? 'opacity-100 w-[25%]' : 'opacity-30 w-[25%]'}`} title="Normal (18.5 - 24.9)"></div>
                                <div className={`h-full bg-yellow-500 transition-all ${category === 'Overweight' ? 'opacity-100 w-[25%]' : 'opacity-30 w-[25%]'}`} title="Overweight (25 - 29.9)"></div>
                                <div className={`h-full bg-red-500 transition-all ${category === 'Obese' ? 'opacity-100 w-[25%]' : 'opacity-30 w-[25%]'}`} title="Obese (≥ 30)"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono uppercase font-bold px-1">
                                <span>Under</span>
                                <span>Normal</span>
                                <span>Over</span>
                                <span>Obese</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default BMICalculator;
