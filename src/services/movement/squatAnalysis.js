/**
 * FitVerse AI — Squat Analysis Engine
 * 
 * Analyzes squat mechanics using MediaPipe landmarks.
 * Tracks depth, knee alignment, symmetry, and rep counts.
 */

import { getLandmark, LANDMARKS, isVisible } from './landmarkUtils';
import { calculateAngle, calculateSymmetry, calculateStability, calculateRepQuality } from './angleCalculator';
import { createRepData } from '../../models/models';

export function createSquatAnalyzer(calibrationData) {
  // State
  let state = 'STANDING'; // STANDING, DESCENDING, BOTTOM, ASCENDING
  let repCount = 0;
  let currentRepData = null;
  let allReps = [];
  
  // Buffers for current rep analysis
  let kneeAngles = [];
  let hipAngles = [];
  let depthBuffer = [];
  let leftKneeDrift = [];
  let rightKneeDrift = [];

  return {
    /**
     * Process a single frame of landmarks
     */
    analyzeFrame(landmarks, timestamp) {
      if (!landmarks) return this.getState();

      const leftHip = getLandmark(landmarks, LANDMARKS.LEFT_HIP);
      const leftKnee = getLandmark(landmarks, LANDMARKS.LEFT_KNEE);
      const leftAnkle = getLandmark(landmarks, LANDMARKS.LEFT_ANKLE);
      const rightHip = getLandmark(landmarks, LANDMARKS.RIGHT_HIP);
      const rightKnee = getLandmark(landmarks, LANDMARKS.RIGHT_KNEE);
      const rightAnkle = getLandmark(landmarks, LANDMARKS.RIGHT_ANKLE);

      // Need both legs visible for full analysis
      if (!isVisible(leftHip) || !isVisible(leftKnee) || !isVisible(leftAnkle) ||
          !isVisible(rightHip) || !isVisible(rightKnee) || !isVisible(rightAnkle)) {
        return this.getState();
      }

      // Calculate angles
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

      // Track lateral knee drift (valgus/varus)
      // Drift = distance between knee x and ankle x (normalized)
      const leftDrift = Math.abs(leftKnee.x - leftAnkle.x);
      const rightDrift = Math.abs(rightKnee.x - rightAnkle.x);

      // State Machine Logic
      if (state === 'STANDING' && avgKneeAngle < 150) {
        // Started descending
        state = 'DESCENDING';
        currentRepData = { startTime: timestamp };
        kneeAngles = [avgKneeAngle];
        depthBuffer = [avgKneeAngle];
        leftKneeDrift = [leftDrift];
        rightKneeDrift = [rightDrift];
      } 
      else if (state === 'DESCENDING' || state === 'BOTTOM') {
        kneeAngles.push(avgKneeAngle);
        depthBuffer.push(avgKneeAngle);
        leftKneeDrift.push(leftDrift);
        rightKneeDrift.push(rightDrift);

        // Detect bottom of squat (angle stops decreasing and starts increasing)
        // Require angle < 100 to count as a bottom
        if (state === 'DESCENDING' && avgKneeAngle < 100) {
           const lastFew = depthBuffer.slice(-5);
           if (lastFew.length === 5 && lastFew[0] < lastFew[4]) {
             state = 'BOTTOM'; // Or transition straight to ASCENDING
           }
        }
        
        // Started ascending
        if (state === 'BOTTOM' && avgKneeAngle > 110) {
           state = 'ASCENDING';
        }
        // Ascending without explicitly hitting our bottom threshold (shallow squat)
        else if (state === 'DESCENDING' && avgKneeAngle > 130 && depthBuffer.length > 10) {
            const minAngle = Math.min(...depthBuffer);
            if (avgKneeAngle > minAngle + 20) {
                state = 'ASCENDING'; // They gave up and stood up
            }
        }
      }
      else if (state === 'ASCENDING' && avgKneeAngle > 160) {
        // Completed rep
        state = 'STANDING';
        repCount++;
        
        // Analyze the completed rep
        const minAngle = Math.min(...depthBuffer);
        
        // Score Depth (90 degrees is ideal, 0-100 score)
        // 90 deg or less = 100 score. > 140 = 0 score.
        let depthScore = 100;
        if (minAngle > 90) {
            depthScore = Math.max(0, 100 - ((minAngle - 90) / (140 - 90)) * 100);
        }

        // Score Symmetry (difference in left vs right knee drift)
        const avgLeftDrift = leftKneeDrift.reduce((a,b)=>a+b,0)/leftKneeDrift.length;
        const avgRightDrift = rightKneeDrift.reduce((a,b)=>a+b,0)/rightKneeDrift.length;
        const symmetryScore = calculateSymmetry(avgLeftDrift, avgRightDrift);

        // Score Stability (consistency of movement)
        const stabilityScore = calculateStability(depthBuffer);

        const repRecord = createRepData({
            repNumber: repCount,
            depthScore,
            symmetryScore,
            stabilityScore,
            overallQuality: calculateRepQuality({ depthScore, symmetryScore, stabilityScore }),
            timestamps: { start: currentRepData.startTime, end: timestamp }
        });

        // Add observations based on scores
        if (depthScore < 50) repRecord.observations.push("Squat was shallow.");
        if (symmetryScore < 70) repRecord.observations.push("Uneven weight distribution or knee tracking.");
        
        allReps.push(repRecord);
        currentRepData = null;
      }

      return this.getState(avgKneeAngle);
    },

    getState(currentAngle = 180) {
      return {
        state,
        repCount,
        currentAngle: Math.round(currentAngle),
        reps: [...allReps],
        // Compute overall session stats if reps exist
        sessionQuality: allReps.length > 0 
          ? Math.round(allReps.reduce((sum, r) => sum + r.overallQuality, 0) / allReps.length)
          : 0
      };
    },

    reset() {
      state = 'STANDING';
      repCount = 0;
      currentRepData = null;
      allReps = [];
    }
  };
}
