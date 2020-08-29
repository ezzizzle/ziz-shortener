interface IShortenedUrl {
  id: string;
  original: string;
  short: string;
  created: Date;
  lastAccessed: Date;
  accessCount: number;
}

export default IShortenedUrl;
