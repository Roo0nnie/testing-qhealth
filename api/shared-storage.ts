// Shared storage for serverless functions
// In production, use Vercel KV, Redis, or a database instead
interface StoredResult {
  vitalSigns: any;
  timestamp: number;
}

const resultsStore = new Map<string, StoredResult>();

// Clean up expired sessions (older than 1 hour)
export const cleanupExpiredSessions = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [sessionId, data] of resultsStore.entries()) {
    if (data.timestamp < oneHourAgo) {
      resultsStore.delete(sessionId);
    }
  }
};

export const setResult = (sessionId: string, vitalSigns: any): void => {
  cleanupExpiredSessions();
  resultsStore.set(sessionId, {
    vitalSigns,
    timestamp: Date.now(),
  });
};

export const getResult = (sessionId: string): StoredResult | null => {
  cleanupExpiredSessions();
  return resultsStore.get(sessionId) || null;
};

export const deleteResult = (sessionId: string): void => {
  resultsStore.delete(sessionId);
};

