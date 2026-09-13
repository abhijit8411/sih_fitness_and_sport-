import { getProfile, getSnapshots, getWorkoutLogs, getMealLogs, saveAISummary, getAISummary } from './userProfile';
import { generateAIResponse } from './api/chatService';

// Simple local analyzer that creates a delta summary and optionally asks the AI
// model for rich advice. Results are persisted via saveAISummary.

export const buildLocalSummary = (userId) => {
  const profile = getProfile(userId) || {};
  const snaps = getSnapshots(userId);
  const workouts = getWorkoutLogs(userId);
  const meals = getMealLogs(userId);

  const latest = snaps[snaps.length - 1] || null;
  const previous = snaps[snaps.length - 2] || null;

  const weightDelta = latest && previous ? (latest.weight - previous.weight) : null;
  const weeks = snaps.length;

  const summary = {
    generatedAt: new Date().toISOString(),
    profile: {
      name: profile.name || 'Athlete',
      weight: profile.weight || null,
      height: profile.height || null,
      goal: profile.goal || null,
      fitnessLevel: profile.fitnessLevel || null,
    },
    snapshotsCount: snaps.length,
    latestSnapshot: latest,
    weightDelta,
    workoutsLast7: workouts.slice(-7),
    mealLogsLast7: meals.slice(-21).slice(-7),
    quickInsights: [],
  };

  // Basic heuristics
  if (weightDelta !== null) {
    if (weightDelta < -1) summary.quickInsights.push('Significant recent weight loss');
    else if (weightDelta < 0) summary.quickInsights.push('Slight recent weight loss');
    else if (weightDelta > 1) summary.quickInsights.push('Significant recent weight gain');
    else if (weightDelta > 0) summary.quickInsights.push('Slight recent weight gain');
    else summary.quickInsights.push('Weight stable compared to previous snapshot');
  }

  if ((workouts.length || 0) < 3) summary.quickInsights.push('Low logged workout frequency — try 3+ sessions/week');
  if ((meals.length || 0) < 7) summary.quickInsights.push('Few meal logs — logging helps nutrition guidance');

  return summary;
};

export const runAnalysis = async (userId, options = { askAI: true }) => {
  try {
    // avoid re-generating if recently generated (<= 12 hours)
    const existing = getAISummary(userId);
    if (existing) {
      const ageMs = new Date() - new Date(existing.generatedAt || existing.updatedAt || 0);
      if (ageMs < 1000 * 60 * 60 * 12) return existing; // recent enough
    }

    const local = buildLocalSummary(userId);

    let aiText = `Local summary for ${local.profile.name}:\n`;
    aiText += `Weight: ${local.profile.weight||'N/A'} kg | Height: ${local.profile.height||'N/A'} cm\n`;
    aiText += `Snapshots: ${local.snapshotsCount} | Weight delta: ${local.weightDelta || 0} kg\n`;
    aiText += `Quick insights: ${local.quickInsights.join(' ; ')}\n`;

    if (options.askAI) {
      try {
        const prompt = `You are an AI fitness coach. The user data below is extracted from app storage. Provide concise, actionable suggestions, differences vs previous snapshot, and 3 improvement steps. Data:\n${aiText}`;
        const resp = await generateAIResponse(prompt);
        aiText += '\nAI Suggestions:\n' + resp;
      } catch (e) {
        aiText += '\nAI unavailable — using local heuristics only.';
      }
    }

    saveAISummary(userId, aiText);
    return { text: aiText, generatedAt: new Date().toISOString() };
  } catch (e) {
    console.error('runAnalysis error', e);
    return null;
  }
};

export default { buildLocalSummary, runAnalysis };
