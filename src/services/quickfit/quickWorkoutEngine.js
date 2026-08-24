/**
 * FitVerse AI — Quick Fit Engine
 * 
 * Generates personalized, time-constrained workouts based on
 * the user's lowest Fitness DNA scores.
 */

import { createQuickWorkout } from '../../models/models';

const EXERCISE_LIBRARY = {
  strength: [
    { name: 'Squats', duration: 40 },
    { name: 'Push-ups', duration: 40 },
    { name: 'Lunges', duration: 40 },
    { name: 'Plank', duration: 30 }
  ],
  balance: [
    { name: 'Single-leg Hold', duration: 30 },
    { name: 'Airplane Pose', duration: 40 },
    { name: 'Bird Dog', duration: 40 }
  ],
  mobility: [
    { name: 'Arm Circles', duration: 30 },
    { name: 'Torso Twists', duration: 30 },
    { name: 'Hip Openers', duration: 40 }
  ],
  endurance: [
    { name: 'High Knees', duration: 40 },
    { name: 'Jumping Jacks', duration: 40 },
    { name: 'Mountain Climbers', duration: 30 }
  ],
  coordination: [
    { name: 'Cross-body Reaches', duration: 30 },
    { name: 'Reaction Targets', duration: 30 },
    { name: 'Alternating Punches', duration: 40 }
  ],
  recovery: [
    { name: 'Childs Pose', duration: 30 },
    { name: 'Deep Breathing', duration: 30 }
  ]
};

/**
 * Generate a time-boxed workout session.
 * @param {number} targetMinutes - Total duration requested (e.g. 1, 3, 5, 10, 20)
 * @param {Object} currentScores - User's latest Fitness DNA scores
 * @param {string} userId
 */
export function generateQuickFit(targetMinutes, currentScores, userId) {
  const targetSeconds = targetMinutes * 60;
  
  // 1. Identify lowest scoring areas (focus areas)
  let focusAreas = [];
  if (currentScores) {
    const scores = Object.entries(currentScores)
        .filter(([k]) => k !== 'overall' && k !== 'consistency' && k !== 'recovery')
        .sort((a, b) => a[1] - b[1]);
    
    // Pick the bottom 2
    focusAreas = [scores[0][0], scores[1][0]];
  } else {
    // Fallback if no assessment
    focusAreas = ['strength', 'endurance'];
  }

  // 2. Build the workout
  let currentDuration = 0;
  const exercises = [];
  
  // Always start with 1 mobility/warmup
  const warmup = EXERCISE_LIBRARY.mobility[Math.floor(Math.random() * EXERCISE_LIBRARY.mobility.length)];
  exercises.push({ ...warmup, type: 'warmup' });
  currentDuration += warmup.duration;

  // Add focus area exercises until we hit the time limit (minus 30s for cooldown)
  let focusIndex = 0;
  while (currentDuration < targetSeconds - 30) {
    const area = focusAreas[focusIndex % focusAreas.length];
    const availableEx = EXERCISE_LIBRARY[area];
    const ex = availableEx[Math.floor(Math.random() * availableEx.length)];
    
    // Avoid putting the exact same exercise back-to-back
    if (exercises.length > 0 && exercises[exercises.length - 1].name === ex.name) {
        focusIndex++;
        continue;
    }

    exercises.push({ ...ex, type: 'active', targetArea: area });
    currentDuration += ex.duration;
    
    // Add 10s rest between active exercises
    exercises.push({ name: 'Rest', duration: 10, type: 'rest' });
    currentDuration += 10;

    focusIndex++;
  }

  // Cap exact duration (trim the last rest or adjust last exercise)
  if (currentDuration > targetSeconds - 30) {
      const diff = currentDuration - (targetSeconds - 30);
      const lastEx = exercises[exercises.length - 1];
      if (lastEx.type === 'rest') {
          exercises.pop();
      } else {
          lastEx.duration -= diff;
      }
      currentDuration = targetSeconds - 30;
  }

  // Cooldown
  exercises.push({ 
      name: 'Recovery Breathing', 
      duration: 30, 
      type: 'cooldown' 
  });

  return createQuickWorkout({
    userId,
    totalDuration: targetSeconds,
    exercises,
    focusAreas,
    explanation: `Today's session focuses on ${focusAreas.join(' and ')} to address opportunities identified in your last assessment.`
  });
}
