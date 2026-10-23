CREATE TABLE IF NOT EXISTS national_initiative_identity (
 initiative_id TEXT PRIMARY KEY REFERENCES national_initiatives(id),
 coordinator_name TEXT NOT NULL DEFAULT '',
 coordinator_title TEXT NOT NULL DEFAULT 'منفذ المبادرة',
 principal_name TEXT NOT NULL DEFAULT '',
 principal_title TEXT NOT NULL DEFAULT 'مدير المدرسة',
 slogan TEXT NOT NULL DEFAULT ''
);
