<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
date_default_timezone_set('America/Sao_Paulo');

ob_start();

require __DIR__ . "/vendor/autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;

$route = new Router(url("api"), ":");

$route->namespace("Source\Controller");

// Exercícios - Produtos
$route->get("/products/list", "Products:productsList");
$route->get("/products/list/{productId}", "Products:productsListById");
$route->post("/products", "Products:create");
$route->get("/products-categories/list", "ProductsCategories:productsCategoryList");

// Rotas de Usuários e Autenticação
$route->get("/hello", "Api:hello");
$route->group("/users");
$route->get("/list", "Users:usersList");
$route->get("/me", "Users:me");
$route->post("/register", "Users:register");
$route->post("/login", "Users:login");
$route->post("/login-admin", "Users:authAdmin");
$route->post("/auth", "Users:auth");
$route->put("/update", "Users:update");
$route->post("/photo", "Users:uploadPhoto");
$route->group(null);

// Rotas de FAQs (Perguntas Frequentes)
$route->group("/faqs");
$route->get("/", "Faqs:listAll");
$route->get("/admin/list", "Faqs:listAllAdmin");
$route->get("/{faqId}", "Faqs:listById");
$route->get("/category/{categoryId}", "Faqs:listByCategory");
$route->post("/", "Faqs:insert");
$route->put("/{faqId}", "Faqs:update");
$route->delete("/{faqId}", "Faqs:delete");
$route->group(null);

// Rotas de Categorias de FAQs
$route->group("/faqs-categories");
$route->get("/", "FaqsCategories:listAll");
$route->get("/{categoryId}", "FaqsCategories:listById");
$route->post("/", "FaqsCategories:insert");
$route->put("/{categoryId}", "FaqsCategories:update");
$route->delete("/{categoryId}", "FaqsCategories:delete");
$route->group(null);

// Rotas de Tasks (Entidade Principal) & Galeria de Imagens (1:N - Etapa 07)
$route->get("/tasks/list", "Tasks:listTasks");
$route->get("/tasks/list/{taskId}", "Tasks:listTaskById");
$route->post("/tasks", "Tasks:createTask");
$route->put("/tasks/{taskId}", "Tasks:updateTask");
$route->delete("/tasks/{taskId}", "Tasks:deleteTask");

$route->get("/tasks/{taskId}/images", "Tasks:listImages");
$route->post("/tasks/{taskId}/images", "Tasks:uploadImages");
$route->delete("/tasks/{taskId}/images/{imageId}", "Tasks:deleteImage");

$route->dispatch();

if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(404);

    echo json_encode([
        "code" => 404,
        "type" => "error",
        "status" => "not_found",
        "message" => "O recurso solicitado não existe na API."
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

ob_end_flush();
