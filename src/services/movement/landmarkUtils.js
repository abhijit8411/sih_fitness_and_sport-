/**
 * FitVerse AI — Landmark Utilities
 * 
 * Helper functions for working with MediaPipe Pose landmarks.
 * MediaPipe returns 33 landmarks. This module provides named access
 * and visibility filtering.
 * 
 * Reference: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
 */

// MediaPipe Pose landmark indices
export const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

/**
 * Get a specific landmark from the pose results.
 * @param {Array} landmarks - MediaPipe pose landmarks array
 * @param {number} index - Landmark index from LANDMARKS enum
 * @returns {Object|null} { x, y, z, visibility } or null
 */
export function getLandmark(landmarks, index) {
  if (!landmarks || index < 0 || index >= landmarks.length) return null;
  return landmarks[index];
}

/**
 * Check if a landmark is visible enough for reliable analysis.
 * 
 * @param {Object} landmark - { visibility }
 * @param {number} threshold - Minimum visibility (default 0.6)
 * @returns {boolean}
 */
export function isVisible(landmark, threshold = 0.6) {
  return landmark && landmark.visibility >= threshold;
}

/**
 * Check if all specified landmarks are visible.
 * @param {Array} landmarks - Full landmarks array
 * @param {number[]} indices - Array of landmark indices to check
 * @param {number} threshold - Minimum visibility
 * @returns {boolean}
 */
export function areAllVisible(landmarks, indices, threshold = 0.6) {
  return indices.every(idx => {
    const lm = getLandmark(landmarks, idx);
    return isVisible(lm, threshold);
  });
}

/**
 * Get the minimum visibility score across a set of landmarks.
 * @param {Array} landmarks - Full landmarks array
 * @param {number[]} indices - Landmark indices to check
 * @returns {number} Minimum visibility (0-1)
 */
export function getMinVisibility(landmarks, indices) {
  let minVis = 1;
  for (const idx of indices) {
    const lm = getLandmark(landmarks, idx);
    if (lm) {
      minVis = Math.min(minVis, lm.visibility);
    } else {
      return 0;
    }
  }
  return minVis;
}

/**
 * Convert normalized landmark coordinates (0-1) to pixel coordinates.
 * @param {Object} landmark - { x, y }
 * @param {number} width - Canvas/video width in pixels
 * @param {number} height - Canvas/video height in pixels
 * @returns {Object} { x, y } in pixels
 */
export function toPixelCoords(landmark, width, height) {
  return {
    x: landmark.x * width,
    y: landmark.y * height,
  };
}

/**
 * Calculate the shoulder width from landmarks (used for normalization).
 * @param {Array} landmarks - Full landmarks array
 * @returns {number} Shoulder width in normalized coordinates
 */
export function getShoulderWidth(landmarks) {
  const leftShoulder = getLandmark(landmarks, LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(landmarks, LANDMARKS.RIGHT_SHOULDER);
  if (!leftShoulder || !rightShoulder) return 0;
  
  return Math.sqrt(
    Math.pow(leftShoulder.x - rightShoulder.x, 2) +
    Math.pow(leftShoulder.y - rightShoulder.y, 2)
  );
}

/**
 * Get body center point (midpoint of hips).
 * @param {Array} landmarks - Full landmarks array
 * @returns {Object|null} { x, y } or null
 */
export function getBodyCenter(landmarks) {
  const leftHip = getLandmark(landmarks, LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(landmarks, LANDMARKS.RIGHT_HIP);
  if (!leftHip || !rightHip) return null;
  return {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };
}

/**
 * Get the approximate body height from landmarks.
 * Uses the distance from nose to average ankle position.
 * @param {Array} landmarks - Full landmarks array
 * @returns {number} Approximate body height in normalized coordinates
 */
export function getBodyHeight(landmarks) {
  const nose = getLandmark(landmarks, LANDMARKS.NOSE);
  const leftAnkle = getLandmark(landmarks, LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getLandmark(landmarks, LANDMARKS.RIGHT_ANKLE);
  
  if (!nose || !leftAnkle || !rightAnkle) return 0;
  
  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  return Math.abs(avgAnkleY - nose.y);
}
