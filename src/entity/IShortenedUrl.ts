interface IShortenedUrl {
  id: string;
  original: string;
  short: string;
  created: Date;
  lastAccessed: Date;
}

export default IShortenedUrl;
