-- Run this in pgAdmin (Query Tool) or psql to create the TidePilot database and user.
-- Connect as the postgres superuser first.

CREATE USER tidepilot WITH PASSWORD 'tidepilot';
CREATE DATABASE tidepilot OWNER tidepilot;
GRANT ALL PRIVILEGES ON DATABASE tidepilot TO tidepilot;
