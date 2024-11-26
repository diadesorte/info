-- create databases
CREATE DATABASE IF NOT EXISTS `app`;

-- -- create root user and grant rights
-- CREATE USER 'app'@'localhost' IDENTIFIED BY 'local';
-- GRANT ALL ON *.* TO 'app'@'localhost';

GRANT ALL ON *.* TO 'app'@'%';