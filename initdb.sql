-- Create databases if they don't exist
SELECT 'CREATE DATABASE auth_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec
SELECT 'CREATE DATABASE shipment_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shipment_db')\gexec
SELECT 'CREATE DATABASE driver_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'driver_db')\gexec
SELECT 'CREATE DATABASE vehicle_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vehicle_db')\gexec
SELECT 'CREATE DATABASE tracking_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tracking_db')\gexec
SELECT 'CREATE DATABASE notification_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_db')\gexec
SELECT 'CREATE DATABASE logistics_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'logistics_db')\gexec
