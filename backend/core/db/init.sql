-- We don't need to create the database or user as they're created by Docker

-- Create the portfolio table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolio (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL
);

-- Grant all privileges on the portfolio table to the user
-- This is not strictly necessary as the user is already the owner of the database,
-- but it's included for completeness and in case of future changes
GRANT ALL PRIVILEGES ON TABLE portfolio TO "user";
GRANT USAGE, SELECT ON SEQUENCE portfolio_id_seq TO "user";

