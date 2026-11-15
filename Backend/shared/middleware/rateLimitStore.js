// In-memory store for express-rate-limit that needs no background timer.
//
// The library's default MemoryStore starts a cleanup setInterval() as soon as
// it is created. Cloudflare Workers forbid timers at module load time, so that
// crashes the Worker on startup. This store behaves the same (fixed window per
// key) but cleans up expired entries lazily instead. Works on Node too.
export class LazyMemoryStore {
  // Tells express-rate-limit that counts are local to this process/instance.
  localKeys = true;

  init(options) {
    this.windowMs = options.windowMs;
    this.hits = new Map();
  }

  async get(key) {
    const entry = this.#current(key, Date.now());
    return entry && { totalHits: entry.totalHits, resetTime: new Date(entry.resetTime) };
  }

  async increment(key) {
    const now = Date.now();
    let entry = this.#current(key, now);
    if (!entry) {
      entry = { totalHits: 0, resetTime: now + this.windowMs };
      this.hits.set(key, entry);
      if (this.hits.size > 10_000) this.#prune(now);
    }
    entry.totalHits += 1;
    return { totalHits: entry.totalHits, resetTime: new Date(entry.resetTime) };
  }

  async decrement(key) {
    const entry = this.#current(key, Date.now());
    if (entry && entry.totalHits > 0) entry.totalHits -= 1;
  }

  async resetKey(key) {
    this.hits.delete(key);
  }

  async resetAll() {
    this.hits.clear();
  }

  #current(key, now) {
    const entry = this.hits.get(key);
    if (entry && entry.resetTime <= now) {
      this.hits.delete(key);
      return undefined;
    }
    return entry;
  }

  #prune(now) {
    for (const [key, entry] of this.hits) if (entry.resetTime <= now) this.hits.delete(key);
  }
}
