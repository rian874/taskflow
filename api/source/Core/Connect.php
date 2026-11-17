<?php

namespace Source\Core;

use PDO;
use PDOException;

abstract class Connect
{
    private const OPTIONS = [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
        PDO::ATTR_CASE => PDO::CASE_NATURAL
    ];

    private static ?PDO $instance = null;

    public static function getInstance(): ?PDO
    {
        if (empty(self::$instance)) {
            try {
                self::$instance = new PDO(
                    "mysql:host=" . CONF_DB_HOST . ";port=" . CONF_DB_PORT . ";dbname=" . CONF_DB_NAME,
                    CONF_DB_USER,
                    CONF_DB_PASS,
                    self::OPTIONS
                );
            } catch (PDOException $exception) {
                // Tenta criar o banco de dados e as tabelas automaticamente se não existirem
                try {
                    $pdoInit = new PDO(
                        "mysql:host=" . CONF_DB_HOST . ";port=" . CONF_DB_PORT,
                        CONF_DB_USER,
                        CONF_DB_PASS,
                        self::OPTIONS
                    );
                    $pdoInit->exec("CREATE DATABASE IF NOT EXISTS `" . CONF_DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                    
                    self::$instance = new PDO(
                        "mysql:host=" . CONF_DB_HOST . ";port=" . CONF_DB_PORT . ";dbname=" . CONF_DB_NAME,
                        CONF_DB_USER,
                        CONF_DB_PASS,
                        self::OPTIONS
                    );

                    self::autoCreateTables(self::$instance);
                } catch (PDOException $e2) {
                    http_response_code(500);
                    header('Content-Type: application/json; charset=UTF-8');
                    echo json_encode([
                        "code" => 500,
                        "type" => "error",
                        "status" => "internal_server_error",
                        "message" => "Problemas ao conectar com o banco de dados: " . $exception->getMessage()
                    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                    exit();
                }
            }

            // Garante que as tabelas essenciais existam
            if (self::$instance) {
                self::autoCreateTables(self::$instance);
            }
        }

        return self::$instance;
    }

    private static function autoCreateTables(PDO $pdo): void
    {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `users_types` (
                  `id` int NOT NULL AUTO_INCREMENT,
                  `name` varchar(255) NOT NULL,
                  `active` tinyint(1) NOT NULL DEFAULT '1',
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `users` (
                  `id` int NOT NULL AUTO_INCREMENT,
                  `type_id` int NOT NULL DEFAULT '2',
                  `name` varchar(255) NOT NULL,
                  `email` varchar(255) NOT NULL UNIQUE,
                  `password` varchar(255) NOT NULL,
                  `photo` varchar(255) DEFAULT NULL,
                  `active` tinyint(1) NOT NULL DEFAULT '1',
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `faqs_categories` (
                  `id` int NOT NULL AUTO_INCREMENT,
                  `name` varchar(255) NOT NULL,
                  `active` tinyint(1) NOT NULL DEFAULT '1',
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `faqs` (
                  `id` int NOT NULL AUTO_INCREMENT,
                  `faqs_category_id` int NOT NULL DEFAULT '1',
                  `question` varchar(255) NOT NULL,
                  `answer` text NOT NULL,
                  `active` tinyint(1) NOT NULL DEFAULT '1',
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS `tasks` (
                  `id` int NOT NULL AUTO_INCREMENT,
                  `user_id` int NOT NULL,
                  `title` varchar(255) NOT NULL,
                  `description` text DEFAULT NULL,
                  `priority` varchar(50) NOT NULL DEFAULT 'Média',
                  `due_date` date DEFAULT NULL,
                  `status_id` int NOT NULL DEFAULT '1',
                  `active` tinyint(1) NOT NULL DEFAULT '1',
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            // Insere dados padrão de FAQs se a tabela estiver vazia
            $checkFaqs = $pdo->query("SELECT COUNT(*) as c FROM `faqs`")->fetch();
            if ($checkFaqs && (int)$checkFaqs->c === 0) {
                $pdo->exec("
                    INSERT INTO `faqs_categories` (`id`, `name`, `active`) VALUES
                    (1, 'Primeiros Passos & Geral', 1),
                    (2, 'Planos & Assinaturas', 1),
                    (3, 'Segurança & Privacidade', 1),
                    (4, 'Produtividade & Recursos', 1)
                    ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

                    INSERT INTO `faqs` (`faqs_category_id`, `question`, `answer`, `active`) VALUES
                    (1, 'O que é o TaskFlow?', 'O TaskFlow é uma plataforma inteligente e moderna para organização de tarefas, projetos e rotinas diárias com foco em máxima produtividade e colaboração.', 1),
                    (1, 'Como crio minha conta?', 'Basta clicar em \"Começar Grátis\" no menu superior, preencher seu nome, e-mail e uma senha com no mínimo 6 dígitos. O cadastro é gratuito e instantâneo.', 1),
                    (1, 'Como criar minha primeira tarefa?', 'Após fazer login no painel, clique no botão \"Nova Tarefa\", informe o título, prioridade (Baixa, Média ou Alta) e a data limite de entrega.', 1),
                    (1, 'O TaskFlow funciona em celulares e tablets?', 'Sim! O TaskFlow é 100% responsivo e foi projetado para funcionar perfeitamente em computadores, notebooks, tablets e smartphones.', 1),
                    (2, 'O TaskFlow tem versão gratuita?', 'Sim! Oferecemos o plano Starter totalmente gratuito, ideal para gerenciamento individual de tarefas e rotinas do dia a dia.', 1),
                    (2, 'Posso cancelar minha assinatura quando quiser?', 'Sim! O TaskFlow não possui contrato de fidelidade nem multas. Você pode cancelar ou alterar de plano a qualquer momento pelo painel.', 1),
                    (2, 'Quais são as formas de pagamento aceitas?', 'Aceitamos cartões de crédito (Visa, Mastercard, Elo), Pix com aprovação imediata e boleto bancário para planos anuais.', 1),
                    (3, 'Meus dados e tarefas estão seguros?', 'Absolutamente. Utilizamos criptografia de ponta a ponta, autenticação segura via tokens JWT e backups automáticos para garantir a integridade das suas informações.', 1),
                    (3, 'Como altero minha senha de acesso?', 'Você pode alterar sua senha a qualquer momento acessando a aba Configurações dentro do painel logado.', 1),
                    (3, 'Outros usuários podem ver minhas tarefas?', 'Não. Por padrão, todas as suas tarefas e projetos são estritamente privados e acessíveis apenas pela sua conta autenticada.', 1),
                    (4, 'Como funcionam as prioridades nas tarefas?', 'Você pode categorizar suas tarefas em Alta (vermelho), Média (amarelo) e Baixa (verde) prioridade, facilitando a visualização do que é mais urgente no seu dia.', 1),
                    (4, 'Existe limite de tarefas no plano Pro?', 'No plano Pro, você tem criação ilimitada de tarefas, relatórios avançados de desempenho e histórico completo de atividades.', 1),
                    (4, 'Como exportar meus relatórios de tarefas?', 'No menu lateral do painel, acesse \"Relatórios\" para visualizar gráficos de conclusão e exportar resumos em formato PDF ou CSV.', 1);
                ");
            }
        } catch (PDOException $e) {
            // Ignora se já existir
        }
    }

    final private function __construct()
    {
    }

    private function __clone()
    {
    }
}
