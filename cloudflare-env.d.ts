declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    AI?: Ai;
    TEACHER_SETUP_KEY?: string;
    BUCKET?: R2Bucket;
  }
}
