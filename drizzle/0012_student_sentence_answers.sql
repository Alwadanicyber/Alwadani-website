CREATE TABLE IF NOT EXISTS student_sentence_answers (
  student TEXT NOT NULL REFERENCES students(id),
  attempt INTEGER NOT NULL,
  question INTEGER NOT NULL,
  response TEXT NOT NULL,
  PRIMARY KEY (student, attempt, question)
);
