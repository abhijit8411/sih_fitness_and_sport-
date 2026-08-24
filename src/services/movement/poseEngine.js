/**
 * FitVerse AI — Pose Engine
 * 
 * Manages the MediaPipe Pose lifecycle.
 * Extracted from TrainGround.js to make it reusable across all AI assessments.
 */

import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";

/**
 * Initialize and start the MediaPipe Pose engine.
 * 
 * @param {HTMLVideoElement} videoElement - The webcam video element
 * @param {Function} onResultsCallback - Callback fired on every processed frame
 * @returns {Object} { pose, camera, stop } Controller object
 */
export function startPoseEngine(videoElement, onResultsCallback) {
  if (!videoElement) {
    console.error("PoseEngine: No video element provided");
    return null;
  }

  // Initialize MediaPipe Pose
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1624666670/${file}`;
    },
  });

  pose.setOptions({
    modelComplexity: 1, // 0=fast/less accurate, 1=balanced, 2=slow/accurate
    smoothLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });

  // Attach the callback
  pose.onResults(onResultsCallback);

  // Initialize the Camera helper
  const camera = new cam.Camera(videoElement, {
    onFrame: async () => {
      // Feed the video frame to the Pose model
      if (videoElement && videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
        await pose.send({ image: videoElement });
      }
    },
    width: 640,
    height: 480,
  });

  // Start the camera
  camera.start();

  return {
    pose,
    camera,
    /**
     * Stop the engine and clean up resources to prevent memory leaks.
     */
    stop: () => {
      if (camera && typeof camera.stop === 'function') {
        try { camera.stop(); } catch(e) { console.warn('Camera stop error:', e); }
      }
      // Force cleanup of the internal video track if possible
      if (videoElement && videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach(track => {
              try { track.stop(); } catch(e) {}
          });
          videoElement.srcObject = null;
      }
      if (pose && !pose.isClosedFlag) {
        try {
            pose.close();
            pose.isClosedFlag = true;
        } catch (e) {
            console.warn('Ignored pose.close() error:', e);
        }
      }
    }
  };
}

/**
 * Helper to draw pose landmarks on a canvas.
 * Uses the existing utilities structure from the project.
 */
export function drawPoseOnCanvas(canvasRef, results, drawSkeleton = true) {
  if (!canvasRef.current || !results.poseLandmarks) return;

  const canvasElement = canvasRef.current;
  const canvasCtx = canvasElement.getContext("2d");
  
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  const landmarks = results.poseLandmarks;
  const width = canvasElement.width;
  const height = canvasElement.height;

  // Draw skeleton lines (simple implementation for now)
  if (drawSkeleton) {
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";

    // Simple skeleton connections
    const connections = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 12], // Shoulders
      [23, 24], // Hips
      [11, 23], [12, 24], // Torso
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28], // Right leg
    ];

    connections.forEach(([i, j]) => {
      const lm1 = landmarks[i];
      const lm2 = landmarks[j];
      
      // Only draw if both are visible
      if (lm1 && lm2 && lm1.visibility > 0.5 && lm2.visibility > 0.5) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(lm1.x * width, lm1.y * height);
        canvasCtx.lineTo(lm2.x * width, lm2.y * height);
        canvasCtx.stroke();
      }
    });
  }

  // Draw points
  landmarks.forEach((landmark) => {
    if (landmark.visibility > 0.5) {
      canvasCtx.beginPath();
      canvasCtx.arc(landmark.x * width, landmark.y * height, 4, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "#A13951"; // Brand color
      canvasCtx.fill();
      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = "#FFFFFF";
      canvasCtx.stroke();
    }
  });

  canvasCtx.restore();
}
