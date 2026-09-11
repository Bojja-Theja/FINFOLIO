-- Dataset attachments for CAPSTACK
CREATE TABLE dataset_salary (
    id SERIAL PRIMARY KEY,
    years_experience DECIMAL(5, 2) NOT NULL,
    salary DECIMAL(12, 2) NOT NULL
);

CREATE TABLE dataset_turnover (
    id SERIAL PRIMARY KEY,
    stag DECIMAL(10, 2),
    event INTEGER,
    gender VARCHAR(10),
    age DECIMAL(5, 2),
    industry VARCHAR(100),
    profession VARCHAR(100),
    traffic VARCHAR(50),
    coach VARCHAR(50),
    head_gender VARCHAR(10),
    greywage VARCHAR(20),
    way VARCHAR(50),
    extraversion DECIMAL(5, 2),
    independ DECIMAL(5, 2),
    selfcontrol DECIMAL(5, 2),
    anxiety DECIMAL(5, 2),
    novator DECIMAL(5, 2)
);

CREATE TABLE dataset_stock (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amzn DECIMAL(12, 2),
    dpz DECIMAL(12, 2),
    btc DECIMAL(12, 2),
    nflx DECIMAL(12, 2)
);

CREATE TABLE dataset_benefits (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(100),
    inferred INTEGER,
    type VARCHAR(255)
);

CREATE INDEX idx_dataset_salary_years ON dataset_salary(years_experience);
CREATE INDEX idx_dataset_turnover_profile ON dataset_turnover(industry, age);
CREATE INDEX idx_dataset_stock_date ON dataset_stock(date);
CREATE INDEX idx_dataset_benefits_job ON dataset_benefits(job_id);
