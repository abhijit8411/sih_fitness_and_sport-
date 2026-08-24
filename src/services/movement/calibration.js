/**
 * FitVerse AI — Body Calibration
 * 
 * Estimates body proportions from an initial standing pose.
 * Used to normalize measurements (e.g. squat depth) across different users.
 */

import { getLandmark, LANDMARKS, isVisible, getShoulderWidth, getBodyHeight } from './landmarkUtils';
import { calculateDistance } from './angleCalculator';

/**
 * Perform a static calibration from a single frame of landmarks.
 * @param {Array} landmarks - Full landmarks array
 * @returns {Object|null} Calibration data or null if poor visibility
 */
export function calibrateBody(landmarks) {
  // We need basic visibility of shoulders, hips, and at least one ankle
  const reqLms = [
    LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER,
    LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP
  ];
  
  if (!reqLms.every(idx => isVisible(getLandmark(landmarks, idx)))) {
    return null;
  }
  
  const leftAnkle = getLandmark(landmarks, LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getLandmark(landmarks, LANDMARKS.RIGHT_ANKLE);
  if (!isVisible(leftAnkle) && !isVisible(rightAnkle)) {
    return null; // Need legs to calibrate full body
  }

  const shoulderWidth = getShoulderWidth(landmarks);
  const bodyHeight = getBodyHeight(landmarks);
  
  const leftHip = getLandmark(landmarks, LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(landmarks, LANDMARKS.RIGHT_HIP);
  const hipCenterY = (leftHip.y + rightHip.y) / 2;
  
  const leftKnee = getLandmark(landmarks, LANDMARKS.LEFT_KNEE);
  const rightKnee = getLandmark(landmarks, LANDMARKS.RIGHT_KNEE);
  
  // Estimate leg length
  let legLength = 0;
  if (isVisible(leftKnee) && isVisible(leftAnkle)) {
    const femur = calculateDistance(leftHip, leftKnee);
    const tibia = calculateDistance(leftKnee, leftAnkle);
    legLength = femur + tibia;
  } else if (isVisible(rightKnee) && isVisible(rightAnkle)) {
    const femur = calculateDistance(rightHip, rightKnee);
    const tibia = calculateDistance(rightKnee, rightAnkle);
    legLength = femur + tibia;
  }

  return {
    shoulderWidth,
    bodyHeight,
    hipCenterY, // The starting Y position of the hips (useful for squat depth)
    legLength,
    calibratedAt: Date.now(),
    isValid: true
  };
}

/**
 * Check if the user is standing in a relatively neutral pose.
 * @param {Array} landmarks 
 * @returns {boolean}
 */
export function isStandingNeutral(landmarks) {
  const leftShoulder = getLandmark(landmarks, LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(landmarks, LANDMARKS.RIGHT_SHOULDER);
  const leftHip = getLandmark(landmarks, LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(landmarks, LANDMARKS.RIGHT_HIP);
  const leftAnkle = getLandmark(landmarks, LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getLandmark(landmarks, LANDMARKS.RIGHT_ANKLE);
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || (!leftAnkle && !rightAnkle)) {
    return false;
  }

  // Shoulders roughly level?
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  if (shoulderTilt > 0.1) return false; // 10% screen height tilt tolerance
  
  // Standing straight? (Ankles below hips)
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  const avgAnkleY = ((leftAnkle?.y || rightAnkle.y) + (rightAnkle?.y || leftAnkle.y)) / 2;
  
  if (avgAnkleY < avgHipY) return false; // Ankles are somehow above hips
  
  // Distance between hip and ankle should be substantial
  if (Math.abs(avgAnkleY - avgHipY) < 0.2) return false;

  return true;
}
