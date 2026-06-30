CREATE TABLE IF NOT EXISTS Setting (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` TEXT,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO Setting (`key`, `value`) VALUES
('paystack_public_key', ''),
('paystack_secret_key', ''),
('paynecta_api_key', ''),
('paynecta_email', ''),
('paynecta_payment_code', ''),
('paynecta_base_url', 'https://paynecta.co.ke/api/v1'),
('site_name', 'CinemaKE'),
('site_currency', 'KES');
