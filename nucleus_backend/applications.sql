CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incharge_id INT REFERENCES users(id) ON DELETE SET NULL,
    document_id INT REFERENCES documents(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',    
    priority VARCHAR(20) DEFAULT 'normal',  
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE applications DROP COLUMN IF EXISTS description;