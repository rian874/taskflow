CREATE DATABASE IF NOT EXISTS taskflow DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskflow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  status ENUM('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  due_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: activity or logs table
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  task_id INT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: admin user
INSERT INTO users (name, email, password, role) VALUES
('Rian Rodrigues','rian@example.com','$2y$12$4e.AYxCzvUO813SOV8pnPOB1LbE/agFgkpyARyOsKobRHM.siSc8S','admin')
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), updated_at=CURRENT_TIMESTAMP;

-- Seed: sample categories
INSERT INTO categories (user_id, name) VALUES
(1, 'Pessoal'),
(1, 'Trabalho')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed: sample tasks
INSERT INTO tasks (user_id, category_id, title, description, priority, status, due_date) VALUES
(1, 1, 'Estudar para prova', 'Revisar capítulos 1 a 5 e fazer exercícios', 'high', 'pending', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
(1, 2, 'Entregar relatório', 'Finalizar e enviar relatório semanal', 'medium', 'in_progress', DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
(1, NULL, 'Comprar material', 'Lista: cadernos, canetas, marcador', 'low', 'pending', NULL)
;

-- Indexes for queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- End of file
