-- Update the chat_text column to allow unlimited text
-- Run this SQL script on your MySQL database: review_generator

ALTER TABLE clients MODIFY COLUMN chat_text LONGTEXT NOT NULL;

-- Verify the change
DESCRIBE clients;
