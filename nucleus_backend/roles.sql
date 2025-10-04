CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (role_name) VALUES ('student') , ('in_charge'),('higher_authority');

SELECT * FROM roles

INSERT INTO roles (role_name) VALUES ('alumni');

