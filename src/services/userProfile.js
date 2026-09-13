// ============================================================
// UserProfile Service — Central fitness data layer
// All data stored in localStorage keyed per user
// ============================================================

const KEY = (uid, suffix) => `fs_${suffix}_${uid}`;

// ---- Profile ----
export const getProfile = (userId) => {
  try { return JSON.parse(localStorage.getItem(KEY(userId, 'profile'))) || null; }
  catch { return null; }
};

export const saveProfile = (userId, data) => {
  const existing = getProfile(userId) || {};
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY(userId, 'profile'), JSON.stringify(updated));
  return updated;
};

// ---- Onboarding Status ----
export const isOnboarded = (userId, email = '') => {
  const byId = localStorage.getItem(KEY(userId, 'onboarded')) === 'true';
  const byEmail = email ? localStorage.getItem(`fs_onboarded_${email.toLowerCase()}`) === 'true' : false;
  return byId || byEmail;
};

export const setOnboarded = (userId, email = '') => {
  localStorage.setItem(KEY(userId, 'onboarded'), 'true');
  if (email) localStorage.setItem(`fs_onboarded_${email.toLowerCase()}`, 'true');
};

// ---- Snapshots (weekly/monthly progress) ----
export const getSnapshots = (userId) => {
  try { return JSON.parse(localStorage.getItem(KEY(userId, 'snapshots'))) || []; }
  catch { return []; }
};

export const saveSnapshot = (userId, profileData) => {
  const snaps = getSnapshots(userId);
  const snap = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    weight: profileData.weight,
    height: profileData.height,
    fitnessLevel: profileData.fitnessLevel,
    bodyFat: profileData.bodyFat || null,
    weekNumber: getWeekNumber(),
    monthNumber: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };
  snaps.push(snap);
  localStorage.setItem(KEY(userId, 'snapshots'), JSON.stringify(snaps));
  return snap;
};

const getWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
};

// ---- Workout Logs ----
export const getWorkoutLogs = (userId) => {
  try { return JSON.parse(localStorage.getItem(KEY(userId, 'workouts'))) || []; }
  catch { return []; }
};

export const logWorkout = (userId, data) => {
  const logs = getWorkoutLogs(userId);
  const entry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...data,
  };
  logs.push(entry);
  localStorage.setItem(KEY(userId, 'workouts'), JSON.stringify(logs));
  return entry;
};

// ---- Meal Logs ----
export const getMealLogs = (userId) => {
  try { return JSON.parse(localStorage.getItem(KEY(userId, 'meals'))) || []; }
  catch { return []; }
};

export const logMeal = (userId, data) => {
  const logs = getMealLogs(userId);
  const entry = { id: Date.now().toString(), date: new Date().toISOString(), ...data };
  logs.push(entry);
  localStorage.setItem(KEY(userId, 'meals'), JSON.stringify(logs));
  return entry;
};

// ---- Challenges ----
export const getChallenges = (userId) => {
  try { return JSON.parse(localStorage.getItem(KEY(userId, 'challenges'))) || generateDefaultChallenges(); }
  catch { return generateDefaultChallenges(); }
};

export const saveChallenges = (userId, challenges) => {
  localStorage.setItem(KEY(userId, 'challenges'), JSON.stringify(challenges));
};

export const markChallengeComplete = (userId, challengeId) => {
  const challenges = getChallenges(userId);
  const updated = challenges.map(c => c.id === challengeId ? { ...c, completed: true, completedAt: new Date().toISOString() } : c);
  saveChallenges(userId, updated);
  return updated;
};

const generateDefaultChallenges = () => {
  const today = new Date().toISOString().split('T')[0];
  const monthName = new Date().toLocaleString('default', { month: 'long' });
  return [
    { id: 'daily-1', type: 'daily', date: today, title: 'Active Body Day', description: 'Complete 3 sets of 15 squats + 10 push-ups + drink 8 glasses of water', emoji: '🏋️', calories: 180, completed: false },
    { id: 'daily-2', type: 'daily', date: today, title: 'Cardio Boost', description: 'Walk or jog for 20 minutes + stretch for 5 minutes', emoji: '🏃', calories: 220, completed: false },
    { id: 'monthly-1', type: 'monthly', month: monthName, title: `${monthName} Fitness Challenge`, description: 'Complete 20 workout sessions this month', emoji: '🏆', target: 20, progress: 0, completed: false },
    { id: 'monthly-2', type: 'monthly', month: monthName, title: 'Nutrition Goal', description: 'Log your meals for 25 days this month and hit your calorie target', emoji: '🥗', target: 25, progress: 0, completed: false },
  ];
};

// ---- AI Summary (stored after onboarding) ----
export const getAISummary = (userId) => {
  try { return JSON.parse(localStorage.getItem(KEY(userId, 'ai_summary'))) || null; }
  catch { return null; }
};

export const saveAISummary = (userId, summary) => {
  localStorage.setItem(KEY(userId, 'ai_summary'), JSON.stringify({ text: summary, generatedAt: new Date().toISOString() }));
};

// ---- Helpers ----
export const getTodayWorkouts = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return getWorkoutLogs(userId).filter(w => w.date.startsWith(today));
};

export const getStreakDays = (userId) => {
  const logs = getWorkoutLogs(userId);
  if (!logs.length) return 0;
  const dates = [...new Set(logs.map(l => l.date.split('T')[0]))].sort().reverse();
  let streak = 0;
  let expected = new Date();
  for (const d of dates) {
    const dateStr = expected.toISOString().split('T')[0];
    if (d === dateStr) { streak++; expected.setDate(expected.getDate() - 1); }
    else break;
  }
  return streak;
};

export const getTotalCaloriesBurned = (userId) => {
  return getWorkoutLogs(userId).reduce((sum, w) => sum + (w.calories || 0), 0);
};

// ---- Generate personalized challenges based on profile ----
export const generatePersonalizedChallenges = (userId, profile) => {
  const today = new Date().toISOString().split('T')[0];
  const monthName = new Date().toLocaleString('default', { month: 'long' });
  const level = profile?.fitnessLevel || 'Beginner';
  const sport = profile?.sports?.[0] || 'General';
  const goal = profile?.goal || 'Improve Overall Fitness';

  const dailyChallenges = {
    Beginner: [
      { title: 'Starter Strength', description: '2 sets of 10 squats + 8 push-ups + 15 min walk', emoji: '🌱', calories: 150 },
      { title: 'Flexibility Day', description: '20 min yoga flow + drink 8 glasses of water', emoji: '🧘', calories: 100 },
    ],
    Intermediate: [
      { title: 'Power Circuit', description: '3 sets of 15 squats + 12 push-ups + 10 lunges + 20 min run', emoji: '⚡', calories: 280 },
      { title: 'Core & Cardio', description: '3 sets of crunches + 15 min HIIT + 5 min plank hold total', emoji: '🔥', calories: 250 },
    ],
    Athlete: [
      { title: 'Elite Training', description: '4 sets of 20 squats + 15 pull-ups + 30 min intense cardio', emoji: '🏆', calories: 450 },
      { title: 'Sport-Specific Drill', description: `${sport} agility drills for 45 min + 10 min cool down stretch`, emoji: '🎯', calories: 380 },
    ],
  };

  const challenges = (dailyChallenges[level] || dailyChallenges.Beginner).map((c, i) => ({
    id: `daily-${i + 1}-${today}`,
    type: 'daily',
    date: today,
    ...c,
    completed: false,
  }));

  challenges.push({
    id: `monthly-1-${monthName}`,
    type: 'monthly',
    month: monthName,
    title: `${monthName} ${goal.split(' ')[0]} Challenge`,
    description: level === 'Beginner' ? 'Complete 15 workout sessions this month' : level === 'Intermediate' ? 'Complete 20 workout sessions this month' : 'Complete 25 workout sessions this month',
    emoji: '🏅',
    target: level === 'Beginner' ? 15 : level === 'Intermediate' ? 20 : 25,
    progress: 0,
    completed: false,
  });

  challenges.push({
    id: `monthly-2-${monthName}`,
    type: 'monthly',
    month: monthName,
    title: 'Nutrition Consistency',
    description: 'Log your meals for 20+ days and stay within your calorie budget',
    emoji: '🥗',
    target: 20,
    progress: 0,
    completed: false,
  });

  saveChallenges(userId, challenges);
  return challenges;
};
