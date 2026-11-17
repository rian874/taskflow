<?php

namespace Source\Controller;

use Source\Models\Faqs\Faq;

class Faqs extends Api
{
    public function listAll(array $data): void
    {
        $faq = new Faq();
        $list = $faq->selectAll(["active = 1"]);
        $this->call(200, "success", "Lista de Perguntas Frequentes", "success")
            ->back($list);
    }

    public function listAllAdmin(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Acesso restrito para administradores.", "error")->back();
            return;
        }

        $faq = new Faq();
        $list = $faq->selectAll();
        $this->call(200, "success", "Lista completa de Perguntas Frequentes", "success")
            ->back($list);
    }

    public function listById(array $data): void
    {
        $faqId = $data["faqId"] ?? null;
        if (!$faqId || !filter_var($faqId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da FAQ é obrigatório e deve ser um número inteiro.", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int)$faqId)) {
            $this->call(404, "not_found", "FAQ não encontrada.", "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ encontrada", "success")->back([
            "id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ]);
    }

    public function listByCategory(array $data): void
    {
        $categoryId = $data["categoryId"] ?? null;
        if (!$categoryId || !filter_var($categoryId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da categoria é obrigatório e deve ser um número inteiro.", "error")->back();
            return;
        }

        $faq = new Faq();
        $list = $faq->selectAll(["active = 1", "faqs_category_id = " . (int)$categoryId]);
        $this->call(200, "success", "Lista de FAQs por categoria", "success")->back($list);
    }

    public function insert(array $data): void
    {
        $data = array_merge($_POST, $data);
        if (empty($data["question"]) || empty($data["answer"])) {
            $json = file_get_contents('php://input');
            $jsonData = json_decode($json, true);
            if (is_array($jsonData)) {
                $data = array_merge($data, $jsonData);
            }
        }

        if (!isset($data["faqs_category_id"]) || !filter_var($data["faqs_category_id"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "O campo faqs_category_id é obrigatório e deve ser inteiro.", "error")->back();
            return;
        }

        if (!isset($data["question"]) || empty(trim($data["question"]))) {
            $this->call(400, "bad_request", "O campo question é obrigatório.", "error")->back();
            return;
        }

        if (!isset($data["answer"]) || empty(trim($data["answer"]))) {
            $this->call(400, "bad_request", "O campo answer é obrigatório.", "error")->back();
            return;
        }

        $faq = new Faq(null, (int)$data["faqs_category_id"], trim($data["question"]), trim($data["answer"]), 1);
        if (!$faq->insert()) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage() ?: "Falha ao criar FAQ.", "error")->back();
            return;
        }

        $this->call(201, "created", "FAQ cadastrada com sucesso!", "success")->back([
            "id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ]);
    }

    public function update(array $data): void
    {
        $faqId = $data["faqId"] ?? null;
        if (!$faqId || !filter_var($faqId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da FAQ é obrigatório.", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int)$faqId)) {
            $this->call(404, "not_found", "FAQ não encontrada.", "error")->back();
            return;
        }

        if (empty($data["question"]) && empty($data["answer"]) && !isset($data["active"])) {
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

        if (isset($data["faqs_category_id"]) && filter_var($data["faqs_category_id"], FILTER_VALIDATE_INT)) {
            $faq->setFaqsCategoryId((int)$data["faqs_category_id"]);
        }

        if (isset($data["question"]) && !empty(trim($data["question"]))) {
            $faq->setQuestion(trim($data["question"]));
        }

        if (isset($data["answer"]) && !empty(trim($data["answer"]))) {
            $faq->setAnswer(trim($data["answer"]));
        }

        if (isset($data["active"])) {
            $faq->setActive((int)$data["active"]);
        }

        if (!$faq->updateById((int)$faqId)) {
            $this->call(500, "error", $faq->getErrorMessage() ?: "Falha ao atualizar FAQ.", "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ atualizada com sucesso!", "success")->back([
            "id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ]);
    }

    public function delete(array $data): void
    {
        $faqId = $data["faqId"] ?? null;
        if (!$faqId || !filter_var($faqId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da FAQ é obrigatório.", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->softDeleteById((int)$faqId)) {
            $this->call(404, "not_found", "FAQ não encontrada ou já inativa.", "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ desativada com sucesso!", "success")->back();
    }
}
