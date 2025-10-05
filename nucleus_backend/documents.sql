CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,       -- e.g. 'correction', 'revaluation
    cloudinary_url TEXT NOT NULL,             
    uploaded_at TIMESTAMP DEFAULT NOW()
);

