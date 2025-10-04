CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO department (dept_name) VALUES ('IT')

SELECT * FROM department