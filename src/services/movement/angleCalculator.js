/**
 * FitVerse AI — Angle Calculator
 * 
 * Core math utilities for movement analysis.
 * Extracted and expanded from the existing TrainGround.js angleBetweenThreePoints().
 */

/**
 * Calculate the angle (in degrees) between three points.
 * This is the core function used for joint angle measurement.
 * 
 * Formula: Uses the law of cosines to find the angle at point B
 * given three points A, B, C where B is the vertex.
 * 
 * cos(angle) = (BA² + BC² - AC²) / (2 * BA * BC)
 * 
 * @param {Object} a - First point {x, y}
 * @param {Object} b - Vertex point {x, y} (the joint)
 * @param {Object} c - Third point {x, y}
 * @returns {number} Angle in degrees (0-180)
 */
export function calculateAngle(a, b, c) {
  const ba = Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2);
  const bc = Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2);
  const ac = Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2);

  const cosAngle = (ba + bc - ac) / Math.sqrt(4 * ba * bc);
  // Clamp to [-1, 1] to handle floating point errors
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));
  return (Math.acos(clampedCos) * 180) / Math.PI;
}

/**
 * Calculate Euclidean distance between two points.
 * @param {Object} a - Point {x, y}
 * @param {Object} b - Point {x, y}
 * @returns {number} Distance
 */
export function calculateDistance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * Normalize a distance value relative to a reference length (e.g., shoulder width).
 * This makes measurements scale-invariant across different camera distances.
 * 
 * @param {number} distance - Raw distance
 * @param {number} reference - Reference distance (e.g., shoulder width)
 * @returns {number} Normalized distance (ratio)
 */
export function normalizeDistance(distance, reference) {
  if (reference === 0) return 0;
  return distance / reference;
}

/**
 * Calculate left-right symmetry score.
 * Returns 100 for perfect symmetry, lower for asymmetry.
 * 
 * Formula: 100 - |leftValue - rightValue| / max(leftValue, rightValue) * 100
 * 
 * @param {number} leftValue - Left side measurement
 * @param {number} rightValue - Right side measurement
 * @returns {number} Symmetry score (0-100)
 */
export function calculateSymmetry(leftValue, rightValue) {
  const maxVal = Math.max(Math.abs(leftValue), Math.abs(rightValue));
  if (maxVal === 0) return 100;
  const diff = Math.abs(leftValue - rightValue);
  return Math.max(0, Math.round(100 - (diff / maxVal) * 100));
}

/**
 * Calculate the stability score from a series of position samples.
 * Lower variance = higher stability.
 * 
 * Uses coefficient of variation (CV) mapped to 0-100 scale.
 * CV < 0.05 → score ~100 (very stable)
 * CV > 0.30 → score ~0 (very unstable)
 * 
 * @param {number[]} values - Array of position values over time
 * @returns {number} Stability score (0-100)
 */
export function calculateStability(values) {
  if (values.length < 2) return 100;
  
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  if (mean === 0) return 100;
  
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / Math.abs(mean); // Coefficient of variation
  
  // Map CV to score: CV=0 → 100, CV=0.3 → 0
  const score = Math.max(0, Math.min(100, Math.round(100 - (cv / 0.3) * 100)));
  return score;
}

/**
 * Calculate the range of motion from a series of angle measurements.
 * Returns the difference between max and min angles observed.
 * 
 * @param {number[]} angles - Array of angle measurements (degrees)
 * @returns {number} Range of motion in degrees
 */
export function calculateMovementRange(angles) {
  if (angles.length === 0) return 0;
  return Math.max(...angles) - Math.min(...angles);
}

/**
 * Calculate overall rep quality from individual metrics.
 * Weighted average of depth, symmetry, and stability.
 * 
 * @param {Object} metrics - { depthScore, symmetryScore, stabilityScore }
 * @returns {number} Overall quality score (0-100)
 */
export function calculateRepQuality({ depthScore = 0, symmetryScore = 0, stabilityScore = 0 }) {
  // Weights: depth matters most, then stability, then symmetry
  const weights = { depth: 0.4, stability: 0.35, symmetry: 0.25 };
  return Math.round(
    depthScore * weights.depth +
    stabilityScore * weights.stability +
    symmetryScore * weights.symmetry
  );
}

/**
 * Calculate the midpoint between two points.
 * Useful for finding body center, hip midpoint, etc.
 * 
 * @param {Object} a - Point {x, y}
 * @param {Object} b - Point {x, y}
 * @returns {Object} Midpoint {x, y}
 */
export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Calculate the vertical displacement between two points.
 * Positive = point a is above point b.
 * 
 * @param {Object} a - Point {x, y}
 * @param {Object} b - Point {x, y}
 * @returns {number} Vertical displacement (a.y - b.y, in screen coords lower y = higher)
 */
export function verticalDisplacement(a, b) {
  return b.y - a.y; // In screen coordinates, lower y = higher position
}
