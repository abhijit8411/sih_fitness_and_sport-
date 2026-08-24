/**
 * FitVerse AI — Balance Analysis Engine
 * 
 * Analyzes single-leg balance stability.
 * Measures body sway, shoulder/hip movement, and hold duration.
 */

import { getLandmark, LANDMARKS, isVisible, getBodyCenter } from './landmarkUtils';
import { calculateDistance, calculateStability, calculateSymmetry } from './angleCalculator';

export function createBalanceAnalyzer() {
  let state = 'IDLE'; // IDLE, BALANCING, FALLEN
  let activeLeg = null; // 'LEFT' or 'RIGHT'
  let startTime = 0;
  let totalTime = 0;
  
  // Buffers for sway tracking (store X coordinate of body center)
  let swayBuffer = [];
  
  let leftStabilityScore = null;
  let rightStabilityScore = null;

  return {
    analyzeFrame(landmarks, timestamp) {
      if (!landmarks) return this.getState();

      const leftAnkle = getLandmark(landmarks, LANDMARKS.LEFT_ANKLE);
      const rightAnkle = getLandmark(landmarks, LANDMARKS.RIGHT_ANKLE);
      
      const leftVis = isVisible(leftAnkle);
      const rightVis = isVisible(rightAnkle);

      // Determine which leg is planted (the lower one on screen / higher Y value)
      // and if the other leg is lifted (significant Y difference)
      let currentlyBalancing = false;
      let currentActiveLeg = null;

      if (leftVis && rightVis) {
        const heightDiff = Math.abs(leftAnkle.y - rightAnkle.y);
        // If difference is > 10% of screen height, one leg is lifted
        if (heightDiff > 0.10) {
            currentlyBalancing = true;
            // The leg with the HIGHER y value is lower on the screen (planted)
            currentActiveLeg = leftAnkle.y > rightAnkle.y ? 'LEFT' : 'RIGHT';
        }
      }

      // State Machine
      if (state === 'IDLE' && currentlyBalancing) {
          state = 'BALANCING';
          activeLeg = currentActiveLeg;
          startTime = timestamp;
          swayBuffer = [];
      } 
      else if (state === 'BALANCING') {
          // Are they still balancing on the same leg?
          if (currentlyBalancing && currentActiveLeg === activeLeg) {
              const bodyCenter = getBodyCenter(landmarks);
              if (bodyCenter) {
                  swayBuffer.push(bodyCenter.x);
              }
              totalTime = timestamp - startTime;
          } else {
              // They put their foot down or switched legs
              state = 'FALLEN';
              
              // Compute final score for this attempt
              const score = calculateStability(swayBuffer);
              if (activeLeg === 'LEFT') leftStabilityScore = score;
              if (activeLeg === 'RIGHT') rightStabilityScore = score;
          }
      }
      else if (state === 'FALLEN') {
          // Reset to IDLE when they stand on two feet again
          if (leftVis && rightVis && Math.abs(leftAnkle.y - rightAnkle.y) < 0.05) {
              state = 'IDLE';
              activeLeg = null;
              totalTime = 0;
              swayBuffer = [];
          }
      }

      return this.getState();
    },

    getState() {
      // Calculate active stability if currently balancing
      let currentStability = 100;
      if (state === 'BALANCING' && swayBuffer.length > 5) {
          currentStability = calculateStability(swayBuffer.slice(-30)); // Look at last 30 frames
      }

      const symmetry = (leftStabilityScore !== null && rightStabilityScore !== null) 
          ? calculateSymmetry(leftStabilityScore, rightStabilityScore)
          : null;

      return {
        state,
        activeLeg,
        durationSeconds: Math.floor(totalTime / 1000),
        currentStability,
        leftStabilityScore,
        rightStabilityScore,
        symmetry
      };
    },

    reset() {
      state = 'IDLE';
      activeLeg = null;
      startTime = 0;
      totalTime = 0;
      swayBuffer = [];
      leftStabilityScore = null;
      rightStabilityScore = null;
    }
  };
}
