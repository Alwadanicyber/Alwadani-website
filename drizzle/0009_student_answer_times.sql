CREATE TABLE IF NOT EXISTS student_answer_times (
  student TEXT NOT NULL REFERENCES students(id),
  attempt INTEGER NOT NULL,
  stage TEXT NOT NULL CHECK(stage IN ('quiz','dictation')),
  question INTEGER NOT NULL,
  elapsed_ms INTEGER NOT NULL CHECK(elapsed_ms BETWEEN 1 AND 86400000),
  PRIMARY KEY(student,attempt,stage,question)
);
