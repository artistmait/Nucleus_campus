CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    moodle_id VARCHAR(8) UNIQUE NOT NULL,
    password CHAR(60) NOT NULL,
    role_id INT REFERENCES roles(id),
    department_id INT REFERENCES department(id),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (moodle_id, password, role_id, department_id)
VALUES
('22104011','hashed_pass1', 1, 1),
('22104008', 'hashed_pass2', 2, 1),     
('22104202', 'hashed_pass3', 3, 1),
('22104126', 'hashed_pass4', 1, 1);

SELECT * FROM users;