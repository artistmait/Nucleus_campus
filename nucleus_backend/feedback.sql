CREATE TABLE feedback (
  id INT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) on DELETE CASCADE,
  feedback TEXT NOT NULL,
  sentiment INT NOT NULL,
  sentiment_text VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_sentiment CHECK (sentiment IN (-1, 0, 1))
);
