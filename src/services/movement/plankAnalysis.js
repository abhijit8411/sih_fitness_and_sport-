/**
 * FitVerse AI — Plank Analysis Engine
 * 
 * Analyzes plank form. Checks shoulder-hip-ankle alignment and hold duration.
 */

import { getLandmark, LANDMARKS, isVisible } from './landmarkUtils';
import { calculateAngle, calculateStability } from './angleCalculator';

export function createPlankAnalyzer() {
  let state = 'IDLE'; // IDLE, HOLDING, RESTING
  let startTime = 0;
  let totalTime = 0;
  
  let alignmentBuffer = []; // Store body alignment angles
  let hipDriftBuffer = [];  // Store Y-axis movement of hips

  return {
    analyzeFrame(landmarks, timestamp) {
      if (!landmarks) return this.getState();

      const shoulder = getLandmark(landmarks, LANDMARKS.LEFT_SHOULDER) || getLandmark(landmarks, LANDMARKS.RIGHT_SHOULDER);
      const hip = getLandmark(landmarks, LANDMARKS.LEFT_HIP) || getLandmark(landmarks, LANDMARKS.RIGHT_HIP);
      const ankle = getLandmark(landmarks, LANDMARKS.LEFT_ANKLE) || getLandmark(landmarks, LANDMARKS.RIGHT_ANKLE);

      if (!isVisible(shoulder) || !isVisible(hip) || !isVisible(ankle)) {
        return this.getState();
      }

      // Check alignment (Shoulder - Hip - Ankle)
      // Ideal plank is 180 degrees (straight line).
      const alignmentAngle = calculateAngle(shoulder, hip, ankle);

      // Check horizontal posture (shoulders and ankles at roughly same Y level)
      const isHorizontal = Math.abs(shoulder.y - ankle.y) < 0.2;

      const isHoldingPlank = isHorizontal && alignmentAngle > 150;

      if (state === 'IDLE' && isHoldingPlank) {
        state = 'HOLDING';
        startTime = timestamp;
        alignmentBuffer = [alignmentAngle];
        hipDriftBuffer = [hip.y];
      }
      else if (state === 'HOLDING') {
        if (isHoldingPlank) {
            totalTime = timestamp - startTime;
            alignmentBuffer.push(alignmentAngle);
            hipDriftBuffer.push(hip.y);
        } else {
            // Broke form
            state = 'RESTING';
        }
      }
      else if (state === 'RESTING' && isHoldingPlank) {
        // Resumed
        state = 'HOLDING';
        // Continue counting time (optional: could reset if we want strict continuous holds)
      }

      return this.getState(alignmentAngle);
    },

    getState(currentAngle = 0) {
      // Form quality: 180 is perfect, 150 is poor. Map to 0-100.
      let formScore = 0;
      if (alignmentBuffer.length > 0) {
          const avgAngle = alignmentBuffer.reduce((a,b)=>a+b,0)/alignmentBuffer.length;
          formScore = Math.max(0, Math.min(100, ((avgAngle - 150) / 30) * 100));
      }

      const stabilityScore = hipDriftBuffer.length > 5 ? calculateStability(hipDriftBuffer) : 100;

      return {
        state,
        durationSeconds: Math.floor(totalTime / 1000),
        currentAlignment: Math.round(currentAngle),
        formScore: Math.round(formScore),
        stabilityScore: Math.round(stabilityScore)
      };
    },

    reset() {
      state = 'IDLE';
      startTime = 0;
      totalTime = 0;
      alignmentBuffer = [];
      hipDriftBuffer = [];
    }
  };
}
