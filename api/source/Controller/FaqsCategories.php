<?php

namespace Source\Controller;

use Source\Models\Faqs\FaqCategory;

class FaqsCategories extends Api
{
    public function listAll(array $data): void
    {
        $category = new FaqCategory();
        $list = $category->selectAll(["active = 1"]);
        $this->call(200, "success", "Lista de Categorias de FAQs", "success")->back($list);
    }

    public function listById(array $data): void
    {
        $categoryId = $data["categoryId"] ?? null;
        if (!$categoryId || !filter_var($categoryId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser inteiro.", "error")->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int)$categoryId)) {
            $this->call(404, "not_found", "Categoria não encontrada.", "error")->back();
            return;
        }

        $this->call(200, "success", "Categoria encontrada", "success")->back([
            "id" => $category->getId(),
            "name" => $category->getName(),
            "active" => $category->getActive()
        ]);
    }

    public function insert(array $data): void
    {
        if (empty($data)) {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true) ?: [];
        }

        if (!isset($data["name"]) || empty(trim($data["name"]))) {
            $this->call(400, "bad_request", "O campo name é obrigatório.", "error")->back();
            return;
        }

        $category = new FaqCategory(null, trim($data["name"]), 1);
        if (!$category->insert()) {
            $this->call(500, "internal_server_error", $category->getErrorMessage() ?: "Falha ao criar categoria.", "error")->back();
            return;
        }

        $this->call(201, "created", "Categoria criada com sucesso!", "success")->back([
            "id" => $category->getId(),
            "name" => $category->getName(),
            "active" => $category->getActive()
        ]);
    }

    public function update(array $data): void
    {
        $categoryId = $data["categoryId"] ?? null;
        if (!$categoryId || !filter_var($categoryId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório.", "error")->back();
            return;
        }

        if (empty($data["name"])) {
            $rawInput = file_get_contents('php://input');
            $jsonData = json_decode($rawInput, true);
            if (is_array($jsonData)) {
                $data = array_merge($data, $jsonData);
            } else {
                parse_str($rawInput, $parsed);
                if (is_array($parsed)) {
                    $data = array_merge($data, $parsed);
                }
            }
        }

        if (!isset($data["name"]) || empty(trim($data["name"]))) {
            $this->call(400, "bad_request", "O campo name é obrigatório.", "error")->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int)$categoryId)) {
            $this->call(404, "not_found", "Categoria não encontrada.", "error")->back();
            return;
        }

        $category->setName(trim($data["name"]));
        if (!$category->updateById((int)$categoryId)) {
            $this->call(500, "error", $category->getErrorMessage() ?: "Falha ao atualizar categoria.", "error")->back();
            return;
        }

        $this->call(200, "success", "Categoria atualizada com sucesso!", "success")->back([
            "id" => $category->getId(),
            "name" => $category->getName(),
            "active" => $category->getActive()
        ]);
    }

    public function delete(array $data): void
    {
        $categoryId = $data["categoryId"] ?? null;
        if (!$categoryId || !filter_var($categoryId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório.", "error")->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->softDeleteById((int)$categoryId)) {
            $this->call(404, "not_found", "Categoria não encontrada ou já inativa.", "error")->back();
            return;
        }

        $this->call(200, "success", "Categoria removida com sucesso!", "success")->back();
    }
}
