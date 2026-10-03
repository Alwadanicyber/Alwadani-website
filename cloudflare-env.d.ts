declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    TEACHER_EMAIL?: string;
    BUCKET?: R2Bucket;
  }
}
