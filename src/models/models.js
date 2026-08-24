/**
 * FitVerse AI — Data Models
 * 
 * Defines all data structures used across the application.
 * These are plain JS factory functions (no class overhead).
 */

// ============================================================
// USER
// ============================================================
export function createUser({ id, name, email, role = 'student', createdAt = new Date().toISOString() }) {
  return { id, name, email, role, createdAt };
}

// ============================================================
// FITNESS ASSESSMENT — Result of a full Fitness DNA assessment
// ============================================================
export function createFitnessAssessment({
  id = generateId(),
  userId,
  assessmentDate = new Date().toISOString(),
  scores = {},
  movementMetrics = {},
  leftRightMetrics = {},
  observations = [],
  exerciseResults = [],
  version = '1.0'
} = {}) {
  return {
    id,
    userId,
    assessmentDate,
    scores: {
      strength: scores.strength || 0,
      balance: scores.balance || 0,
      mobility: scores.mobility || 0,
      endurance: scores.endurance || 0,
      coordination: scores.coordination || 0,
      consistency: scores.consistency || 0,
      recovery: scores.recovery || 0,
      overall: scores.overall || 0,
    },
    movementMetrics,
    leftRightMetrics,
    observations,
    exerciseResults,
    version,
  };
}

// ============================================================
// MOVEMENT SESSION — A single exercise session
// ============================================================
export function createMovementSession({
  id = generateId(),
  userId,
  exerciseType,
  startedAt = new Date().toISOString(),
  duration = 0,
  metrics = {},
  qualityScore = 0,
  reps = [],
  observations = [],
} = {}) {
  return {
    id, userId, exerciseType, startedAt, duration,
    metrics, qualityScore, reps, observations,
  };
}

// ============================================================
// REP DATA — Quality data for a single repetition
// ============================================================
export function createRepData({
  repNumber = 1,
  depthScore = 0,
  symmetryScore = 0,
  stabilityScore = 0,
  overallQuality = 0,
  observations = [],
  timestamps = {},
} = {}) {
  return {
    repNumber, depthScore, symmetryScore, stabilityScore,
    overallQuality, observations, timestamps,
  };
}

// ============================================================
// FITNESS MISSION — A camera-based adventure mission
// ============================================================
export function createFitnessMission({
  id = generateId(),
  name,
  description = '',
  stages = [],
  targetFitnessAreas = [],
  difficulty = 'medium',
  estimatedDuration = 300,
  requiredMovements = [],
} = {}) {
  return {
    id, name, description, stages, targetFitnessAreas,
    difficulty, estimatedDuration, requiredMovements,
  };
}

// ============================================================
// MISSION STAGE — A single stage within a mission
// ============================================================
export function createMissionStage({
  id = generateId(),
  name,
  description = '',
  exerciseType,
  targetReps = 0,
  targetDuration = 0,
  targetScore = 50,
  storyText = '',
} = {}) {
  return {
    id, name, description, exerciseType,
    targetReps, targetDuration, targetScore, storyText,
  };
}

// ============================================================
// MISSION ATTEMPT — Record of a user playing a mission
// ============================================================
export function createMissionAttempt({
  id = generateId(),
  userId,
  missionId,
  startedAt = new Date().toISOString(),
  completedAt = null,
  stageResults = [],
  totalScore = 0,
  difficultyLevel = 1,
  completed = false,
} = {}) {
  return {
    id, userId, missionId, startedAt, completedAt,
    stageResults, totalScore, difficultyLevel, completed,
  };
}

// ============================================================
// QUICK WORKOUT — A time-constrained workout session
// ============================================================
export function createQuickWorkout({
  id = generateId(),
  userId,
  totalDuration,
  exercises = [],
  focusAreas = [],
  explanation = '',
  createdAt = new Date().toISOString(),
} = {}) {
  return {
    id, userId, totalDuration, exercises,
    focusAreas, explanation, createdAt,
  };
}

// ============================================================
// CLASSROOM — Instructor's fitness classroom
// ============================================================
export function createClassroom({
  id = generateId(),
  instructorId,
  name,
  joinCode = generateJoinCode(),
  createdAt = new Date().toISOString(),
  students = [],
  challenges = [],
} = {}) {
  return {
    id, instructorId, name, joinCode,
    createdAt, students, challenges,
  };
}

// ============================================================
// CLASSROOM CHALLENGE — A challenge within a classroom
// ============================================================
export function createClassroomChallenge({
  id = generateId(),
  classroomId,
  name,
  exercises = [],
  duration = 300,
  difficulty = 'medium',
  createdAt = new Date().toISOString(),
  participations = [],
} = {}) {
  return {
    id, classroomId, name, exercises,
    duration, difficulty, createdAt, participations,
  };
}

// ============================================================
// CHALLENGE PARTICIPATION — A student's participation in a challenge
// ============================================================
export function createChallengeParticipation({
  id = generateId(),
  challengeId,
  studentId,
  studentName = '',
  scores = {},
  completedAt = null,
  improvement = 0,
} = {}) {
  return {
    id, challengeId, studentId, studentName,
    scores, completedAt, improvement,
  };
}

// ============================================================
// FITNESS SIMULATION — A future trajectory simulation
// ============================================================
export function createFitnessSimulation({
  id = generateId(),
  userId,
  currentScores = {},
  workoutDaysPerWeek = 3,
  averageSessionMinutes = 30,
  targetDays = 90,
  scenarios = [],
  createdAt = new Date().toISOString(),
  assumptions = [],
} = {}) {
  return {
    id, userId, currentScores, workoutDaysPerWeek,
    averageSessionMinutes, targetDays, scenarios,
    createdAt, assumptions,
  };
}

// ============================================================
// CORRECTIVE EXERCISE — Exercise recommended by the AI Coach
// ============================================================
export function createCorrectiveExercise({
  id,
  name,
  targetAreas = [],
  duration = 30,
  instructions = [],
  retryExercise = null,
  difficulty = 'beginner',
} = {}) {
  return {
    id, name, targetAreas, duration,
    instructions, retryExercise, difficulty,
  };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Generate a unique ID (timestamp + random suffix).
 * Good enough for localStorage-based persistence.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Generate a 6-character alphanumeric join code for classrooms.
 */
export function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
