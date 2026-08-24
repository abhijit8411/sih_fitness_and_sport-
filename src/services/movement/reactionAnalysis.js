/**
 * FitVerse AI — Reaction Challenge Engine
 * 
 * Interactive camera-based game where user must touch targets with their hands.
 * Measures reaction time and coordination.
 */

import { getLandmark, LANDMARKS, isVisible } from './landmarkUtils';
import { calculateDistance } from './angleCalculator';

export function createReactionAnalyzer(onTargetHit) {
  let state = 'IDLE'; // IDLE, PLAYING, FINISHED
  
  // Target properties (normalized coordinates 0-1)
  let currentTarget = null; // { x, y, radius, spawnedAt, requiredHand }
  
  let score = 0;
  let reactionTimes = [];
  let missedTargets = 0;
  let gameDuration = 30000; // 30 seconds
  let gameStartTime = 0;

  function spawnTarget(timestamp) {
    // Keep targets away from edges (0.2 to 0.8)
    const x = 0.2 + Math.random() * 0.6;
    const y = 0.2 + Math.random() * 0.6;
    
    currentTarget = {
      x, y,
      radius: 0.1, // 10% of screen
      spawnedAt: timestamp,
      // Randomly require left or right hand (or either)
      requiredHand: Math.random() > 0.5 ? 'LEFT' : 'RIGHT' 
    };
  }

  return {
    startGame(timestamp, duration = 30000) {
      state = 'PLAYING';
      score = 0;
      reactionTimes = [];
      missedTargets = 0;
      gameDuration = duration;
      gameStartTime = timestamp;
      spawnTarget(timestamp);
    },

    analyzeFrame(landmarks, timestamp) {
      if (state !== 'PLAYING') return this.getState();

      // Check game over
      if (timestamp - gameStartTime >= gameDuration) {
        state = 'FINISHED';
        currentTarget = null;
        return this.getState();
      }

      if (!landmarks || !currentTarget) return this.getState();

      const leftWrist = getLandmark(landmarks, LANDMARKS.LEFT_WRIST);
      const rightWrist = getLandmark(landmarks, LANDMARKS.RIGHT_WRIST);

      let hit = false;
      let usedHand = null;

      // Check Left Hand Hit
      if (isVisible(leftWrist) && (currentTarget.requiredHand === 'LEFT' || !currentTarget.requiredHand)) {
        const dist = calculateDistance(leftWrist, currentTarget);
        if (dist < currentTarget.radius) {
            hit = true;
            usedHand = 'LEFT';
        }
      }

      // Check Right Hand Hit
      if (!hit && isVisible(rightWrist) && (currentTarget.requiredHand === 'RIGHT' || !currentTarget.requiredHand)) {
        const dist = calculateDistance(rightWrist, currentTarget);
        if (dist < currentTarget.radius) {
            hit = true;
            usedHand = 'RIGHT';
        }
      }

      if (hit) {
        const reactionTime = timestamp - currentTarget.spawnedAt;
        reactionTimes.push(reactionTime);
        score++;
        
        if (onTargetHit) onTargetHit(usedHand, reactionTime);
        
        spawnTarget(timestamp);
      } else if (timestamp - currentTarget.spawnedAt > 3000) {
        // Target expired (3 seconds)
        missedTargets++;
        spawnTarget(timestamp);
      }

      return this.getState();
    },

    getState() {
      const avgReaction = reactionTimes.length > 0 
          ? reactionTimes.reduce((a,b)=>a+b,0) / reactionTimes.length 
          : 0;

      // Score 0-100 based on reaction time (faster is better, <500ms = 100, >2000ms = 0)
      let coordinationScore = 0;
      if (avgReaction > 0) {
          coordinationScore = Math.max(0, 100 - ((avgReaction - 500) / 1500) * 100);
      }

      return {
        state,
        score,
        target: currentTarget,
        averageReactionTime: Math.round(avgReaction),
        missedTargets,
        coordinationScore: Math.round(coordinationScore)
      };
    },

    reset() {
      state = 'IDLE';
      score = 0;
      reactionTimes = [];
      missedTargets = 0;
      currentTarget = null;
    }
  };
}
