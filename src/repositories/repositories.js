/**
 * FitVerse AI — Base Repository
 * 
 * localStorage-backed CRUD operations.
 * Designed so a real API can be swapped in later by replacing these methods.
 */

class BaseRepository {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  _getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveAll(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  getAll() {
    return this._getAll();
  }

  getById(id) {
    return this._getAll().find(item => item.id === id) || null;
  }

  getByUserId(userId) {
    return this._getAll().filter(item => item.userId === userId);
  }

  save(item) {
    const items = this._getAll();
    const existingIndex = items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    this._saveAll(items);
    return item;
  }

  delete(id) {
    const items = this._getAll().filter(item => item.id !== id);
    this._saveAll(items);
  }

  getLatestByUserId(userId) {
    const userItems = this.getByUserId(userId);
    if (userItems.length === 0) return null;
    return userItems.sort((a, b) => 
      new Date(b.assessmentDate || b.createdAt || b.startedAt) - 
      new Date(a.assessmentDate || a.createdAt || a.startedAt)
    )[0];
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

// ============================================================
// Concrete Repositories
// ============================================================

export const assessmentRepository = new BaseRepository('fitverse_assessments');
export const sessionRepository = new BaseRepository('fitverse_sessions');
export const missionRepository = new BaseRepository('fitverse_mission_attempts');
export const classroomRepository = new BaseRepository('fitverse_classrooms');
export const challengeRepository = new BaseRepository('fitverse_challenges');
export const simulationRepository = new BaseRepository('fitverse_simulations');
export const quickWorkoutRepository = new BaseRepository('fitverse_quick_workouts');

/**
 * Get the current authenticated user's ID from localStorage auth.
 */
export function getCurrentUserId() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth'));
    return auth?.user?._id || auth?.user?.id || 'local-user';
  } catch {
    return 'local-user';
  }
}

/**
 * Get the current user's name.
 */
export function getCurrentUserName() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth'));
    return auth?.user?.name || 'Athlete';
  } catch {
    return 'Athlete';
  }
}
