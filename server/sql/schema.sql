CREATE TABLE IF NOT EXISTS debts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creditor VARCHAR(255) NOT NULL,
  original_creditor VARCHAR(255) NULL,
  collection_agency VARCHAR(255) NULL,
  type VARCHAR(100) NOT NULL,
  original_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  interest_accrued DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('Active', 'In Settlement', 'Settled', 'Overdue') NOT NULL DEFAULT 'Active',
  last_payment DATE NULL,
  next_due DATE NULL,
  legal_status VARCHAR(50) NULL,
  legal_details JSON NULL,
  account_number VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  holder_name VARCHAR(255) NOT NULL,
  expiry_date VARCHAR(10) NULL,
  bank_name VARCHAR(255) NULL,
  account_type VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_date DATE NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  upload_date DATE NOT NULL,
  creditor VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creditor_calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  call_date DATE NOT NULL,
  creditor VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  extension VARCHAR(20) NULL,
  regarding VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_commitments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(12, 2) NOT NULL,
  available_date DATE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settlement_commitments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  debt_id INT NOT NULL,
  creditor VARCHAR(255) NOT NULL,
  settlement_amount DECIMAL(12, 2) NOT NULL,
  commitment_date DATE NOT NULL,
  signed_at DATETIME NOT NULL,
  signature VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (debt_id)
);

CREATE TABLE IF NOT EXISTS settlement_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month_label VARCHAR(10) NOT NULL,
  original_total DECIMAL(12, 2) NOT NULL,
  current_total DECIMAL(12, 2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creditor VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
