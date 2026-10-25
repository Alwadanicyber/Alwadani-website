CREATE TABLE IF NOT EXISTS national_initiative_glow_settings(
 initiative_id TEXT PRIMARY KEY REFERENCES national_initiatives(id),
 color TEXT NOT NULL DEFAULT '#e8c26a',
 name_effect TEXT NOT NULL DEFAULT 'pulse' CHECK(name_effect IN ('steady','pulse','shimmer')),
 frame_effect TEXT NOT NULL DEFAULT 'pulse' CHECK(frame_effect IN ('steady','pulse','orbit')),
 intensity TEXT NOT NULL DEFAULT 'medium' CHECK(intensity IN ('soft','medium','strong'))
);
