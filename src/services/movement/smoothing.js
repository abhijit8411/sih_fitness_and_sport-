/**
 * FitVerse AI — Temporal Smoothing
 * 
 * Smooths noisy landmark data over time to prevent
 * single-frame jitter from affecting analysis.
 * Uses exponential moving average (EMA).
 */

/**
 * Creates a landmark smoother that maintains state across frames.
 * Uses Exponential Moving Average for each landmark coordinate.
 * 
 * EMA formula: smoothed = alpha * current + (1 - alpha) * previous
 * 
 * @param {number} alpha - Smoothing factor (0-1). Higher = less smoothing. Default 0.4
 * @returns {Object} Smoother with smooth() method
 */
export function createLandmarkSmoother(alpha = 0.4) {
  let previousLandmarks = null;

  return {
    /**
     * Smooth the current frame's landmarks using EMA.
     * @param {Array} landmarks - Current frame landmarks
     * @returns {Array} Smoothed landmarks
     */
    smooth(landmarks) {
      if (!landmarks) return landmarks;
      
      if (!previousLandmarks) {
        previousLandmarks = landmarks.map(lm => ({ ...lm }));
        return landmarks;
      }

      const smoothed = landmarks.map((lm, i) => {
        if (!previousLandmarks[i]) return lm;
        return {
          ...lm,
          x: alpha * lm.x + (1 - alpha) * previousLandmarks[i].x,
          y: alpha * lm.y + (1 - alpha) * previousLandmarks[i].y,
          z: lm.z !== undefined 
            ? alpha * lm.z + (1 - alpha) * (previousLandmarks[i].z || 0)
            : undefined,
          visibility: lm.visibility, // Don't smooth visibility
        };
      });

      previousLandmarks = smoothed.map(lm => ({ ...lm }));
      return smoothed;
    },

    /**
     * Reset the smoother state.
     */
    reset() {
      previousLandmarks = null;
    },
  };
}

/**
 * Creates a value smoother for a single numeric value (e.g., an angle).
 * @param {number} alpha - Smoothing factor
 * @returns {Object} Smoother with smooth() method
 */
export function createValueSmoother(alpha = 0.3) {
  let previous = null;

  return {
    smooth(value) {
      if (previous === null) {
        previous = value;
        return value;
      }
      const smoothed = alpha * value + (1 - alpha) * previous;
      previous = smoothed;
      return smoothed;
    },
    reset() {
      previous = null;
    },
    getValue() {
      return previous;
    },
  };
}

/**
 * Creates a windowed average smoother.
 * Keeps the last N values and returns their average.
 * Better for detecting trends than EMA.
 * 
 * @param {number} windowSize - Number of values to keep
 * @returns {Object} Smoother with add() and getAverage() methods
 */
export function createWindowedSmoother(windowSize = 10) {
  const values = [];

  return {
    add(value) {
      values.push(value);
      if (values.length > windowSize) {
        values.shift();
      }
    },
    getAverage() {
      if (values.length === 0) return 0;
      return values.reduce((s, v) => s + v, 0) / values.length;
    },
    getValues() {
      return [...values];
    },
    getLength() {
      return values.length;
    },
    reset() {
      values.length = 0;
    },
  };
}
