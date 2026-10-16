CREATE TABLE IF NOT EXISTS student_exam_writing (
  student TEXT NOT NULL REFERENCES students(id),
  attempt INTEGER NOT NULL,
  response TEXT NOT NULL,
  updated TEXT NOT NULL,
  PRIMARY KEY (student, attempt)
);
