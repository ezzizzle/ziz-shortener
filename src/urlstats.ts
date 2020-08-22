export interface URLStats {
  id: string,
  url: string,
  shortenedUrl: string,
  created: Date,
  lastAccessed: Date,
  accessCount: number,
}

export interface URLStatsResponse {
  id: string,
  url: string,
  shortenedUrl: string,
  created: string,
  lastAccessed: string,
  accessCount: number,
}

type URLStatsResponseBuilder = (urlStats: URLStats) => URLStatsResponse;
export const urlStatsResponseBuilder: URLStatsResponseBuilder = (urlStats) => ({
  ...urlStats,
  created: urlStats.created.toISOString(),
  lastAccessed: urlStats.lastAccessed.toISOString(),
});
