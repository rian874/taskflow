CREATE DATABASE IF NOT EXISTS `db_taskflow` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `db_taskflow`;

-- ------------------------------------------------------
-- Estrutura da tabela `users_types`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `task_images`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `faqs`;
DROP TABLE IF EXISTS `faqs_categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `users_types`;

CREATE TABLE `users_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users_types` VALUES 
(1, 'ADMIN', 1),
(2, 'USER', 1);

-- ------------------------------------------------------
-- Estrutura da tabela `users`
-- ------------------------------------------------------
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_id` int NOT NULL DEFAULT '2',
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_users_users_types_idx` (`type_id`),
  CONSTRAINT `fk_users_users_types` FOREIGN KEY (`type_id`) REFERENCES `users_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Senha padrão do admin: 12345678
INSERT INTO `users` (`id`, `type_id`, `name`, `email`, `password`, `photo`, `active`) VALUES
(1, 1, 'Administrador TaskFlow', 'admin@taskflow.com', '$2y$10$4SAEgSOLVK8SBT9VP4T4lObFmZBPv48WLLMDb/Wsh5MC63zd6GBOO', NULL, 1);

-- ------------------------------------------------------
-- Estrutura da tabela `faqs_categories`
-- ------------------------------------------------------
CREATE TABLE `faqs_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `faqs_categories` VALUES
(1, 'Primeiros Passos & Geral', 1),
(2, 'Planos & Assinaturas', 1),
(3, 'Segurança & Privacidade', 1),
(4, 'Produtividade & Recursos', 1);

-- ------------------------------------------------------
-- Estrutura da tabela `faqs`
-- ------------------------------------------------------
CREATE TABLE `faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faqs_category_id` int NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_faqs_faqs_categories_idx` (`faqs_category_id`),
  CONSTRAINT `fk_faqs_faqs_categories` FOREIGN KEY (`faqs_category_id`) REFERENCES `faqs_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `faqs` VALUES
(1, 1, 'O que é o TaskFlow?', 'O TaskFlow é uma plataforma para organização de tarefas, projetos e rotinas diárias com foco em produtividade e acompanhamento de entregas.', 1),
(2, 1, 'Como crio minha conta?', 'Basta clicar em \"Começar Grátis\" no menu superior, preencher seu nome, e-mail e uma senha. O cadastro é gratuito.', 1),
(3, 1, 'Como criar minha primeira tarefa?', 'Após fazer login no painel, clique no botão \"Nova Tarefa\", informe o título, prioridade (Baixa, Média ou Alta) e a data limite de entrega.', 1),
(4, 1, 'O TaskFlow funciona em celulares e tablets?', 'Sim. O sistema é responsivo e funciona em computadores, notebooks, tablets e smartphones.', 1),
(5, 2, 'O TaskFlow tem versão gratuita?', 'Sim. O plano Starter é gratuito e voltado para organização individual de tarefas e rotinas do dia a dia.', 1),
(6, 2, 'Posso cancelar minha assinatura quando quiser?', 'Sim. Não há fidelidade e você pode alterar ou cancelar seu plano a qualquer momento pelo painel.', 1),
(7, 2, 'Quais são as formas de pagamento aceitas?', 'Aceitamos cartões de crédito, Pix e boleto bancário para planos anuais.', 1),
(8, 3, 'Meus dados e tarefas estão seguros?', 'Sim. Todas as tarefas e anexos ficam vinculados apenas à sua conta autenticada.', 1),
(9, 3, 'Como altero minha senha ou foto de perfil?', 'Você pode alterar seus dados, senha e foto de perfil a qualquer momento acessando a aba \"Meu Perfil\" dentro do painel.', 1),
(10, 3, 'Outros usuários podem ver minhas tarefas?', 'Não. Todas as tarefas e imagens anexadas são privadas e acessíveis apenas pelo próprio usuário autenticado.', 1),
(11, 4, 'Como funcionam as prioridades nas tarefas?', 'Você pode classificar suas tarefas em Alta, Média e Baixa prioridade para visualizar rapidamente o que é mais urgente.', 1),
(12, 4, 'Posso anexar imagens às minhas tarefas?', 'Sim. Cada tarefa possui uma galeria própria onde você pode enviar, visualizar e remover imagens de referência ou comprovantes.', 1),
(13, 4, 'Como filtrar minhas tarefas?', 'No painel principal, utilize a barra de busca por texto ou os filtros de status (Todas, Em Andamento e Concluídas).', 1);

-- ------------------------------------------------------
-- Estrutura da tabela `tasks`
-- ------------------------------------------------------
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` varchar(50) NOT NULL DEFAULT 'Média',
  `due_date` date DEFAULT NULL,
  `status_id` int NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_tasks_users_idx` (`user_id`),
  CONSTRAINT `fk_tasks_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tasks` VALUES
(1, 1, 'Preparar apresentação do projeto', 'Organizar os slides e revisar o cronograma de entregas da equipe', 'Alta', '2026-11-20', 1, 1),
(2, 1, 'Revisar relatório mensal', 'Conferir os indicadores concluídos da semana', 'Média', '2026-11-25', 1, 1);

-- ------------------------------------------------------
-- Estrutura da tabela `task_images` (Relação 1:N com `tasks` - Etapa 07)
-- ------------------------------------------------------
CREATE TABLE `task_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `position` smallint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task_images_task_id` (`task_id`),
  CONSTRAINT `fk_task_images_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
