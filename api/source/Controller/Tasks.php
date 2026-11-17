<?php

namespace Source\Controller;

use RuntimeException;
use Source\Models\Task;
use Source\Models\TaskImage;
use Source\Support\Upload;

class Tasks extends Api
{
    public function listTasks(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $task = new Task();
        $filters = [
            "active = 1",
            "user_id = " . (int)$this->userAuthId
        ];

        $list = $task->selectAll($filters, "due_date", "ASC");
        $this->call(200, "success", "Lista de Tarefas", "success")->back($list);
    }

    public function listTaskById(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $taskId = $data["taskId"] ?? null;
        if (!$taskId || !filter_var($taskId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da tarefa é obrigatório e deve ser inteiro.", "error")->back();
            return;
        }

        $task = new Task();
        if (!$task->selectById((int)$taskId) || (int)$task->getActive() !== 1 || (int)$task->getUserId() !== (int)$this->userAuthId) {
            $this->call(404, "not_found", "Tarefa não encontrada.", "error")->back();
            return;
        }

        $this->call(200, "success", "Tarefa encontrada", "success")->back([
            "id" => $task->getId(),
            "user_id" => $task->getUserId(),
            "title" => $task->getTitle(),
            "description" => $task->getDescription(),
            "priority" => $task->getPriority(),
            "due_date" => $task->getDueDate(),
            "status_id" => $task->getStatusId(),
            "active" => $task->getActive()
        ]);
    }

    public function createTask(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $data = $this->parseInputData($data);

        if (!isset($data["title"]) || empty(trim($data["title"]))) {
            $this->call(400, "bad_request", "O título da tarefa é obrigatório.", "error")->back();
            return;
        }

        $task = new Task(
            null,
            $this->userAuthId,
            trim($data["title"]),
            $data["description"] ?? null,
            $data["priority"] ?? "Média",
            $data["due_date"] ?? null,
            (int)($data["status_id"] ?? 1),
            1
        );

        if (!$task->insert()) {
            $this->call(500, "internal_server_error", $task->getErrorMessage() ?: "Falha ao criar tarefa.", "error")->back();
            return;
        }

        $this->call(201, "created", "Tarefa criada com sucesso!", "success")->back([
            "id" => $task->getId(),
            "user_id" => $task->getUserId(),
            "title" => $task->getTitle(),
            "description" => $task->getDescription(),
            "priority" => $task->getPriority(),
            "due_date" => $task->getDueDate(),
            "status_id" => $task->getStatusId(),
            "active" => $task->getActive()
        ]);
    }

    public function updateTask(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $parsed = $this->parseInputData($data);
        $taskId = $data["taskId"] ?? $parsed["taskId"] ?? null;

        if (!$taskId || !filter_var($taskId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da tarefa é obrigatório.", "error")->back();
            return;
        }

        $task = new Task();
        if (!$task->selectById((int)$taskId) || (int)$task->getActive() !== 1) {
            $this->call(404, "not_found", "Tarefa não encontrada.", "error")->back();
            return;
        }

        if ((int)$task->getUserId() !== (int)$this->userAuthId) {
            $this->call(403, "forbidden", "Você não tem permissão para alterar esta tarefa.", "error")->back();
            return;
        }

        if (isset($parsed["title"]) && !empty(trim($parsed["title"]))) {
            $task->setTitle(trim($parsed["title"]));
        }

        if (array_key_exists("description", $parsed)) {
            $task->setDescription($parsed["description"]);
        }

        if (isset($parsed["priority"])) {
            $task->setPriority($parsed["priority"]);
        }

        if (isset($parsed["due_date"])) {
            $task->setDueDate($parsed["due_date"] ?: null);
        }

        if (isset($parsed["status_id"])) {
            $task->setStatusId((int)$parsed["status_id"]);
        }

        if (isset($parsed["active"])) {
            $task->setActive((int)$parsed["active"]);
        }

        if (!$task->updateById((int)$taskId)) {
            $this->call(500, "internal_server_error", $task->getErrorMessage() ?: "Falha ao atualizar tarefa.", "error")->back();
            return;
        }

        $this->call(200, "success", "Tarefa atualizada com sucesso!", "success")->back([
            "id" => $task->getId(),
            "user_id" => $task->getUserId(),
            "title" => $task->getTitle(),
            "description" => $task->getDescription(),
            "priority" => $task->getPriority(),
            "due_date" => $task->getDueDate(),
            "status_id" => $task->getStatusId(),
            "active" => $task->getActive()
        ]);
    }

    public function deleteTask(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $taskId = $data["taskId"] ?? null;
        if (!$taskId || !filter_var($taskId, FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da tarefa é obrigatório.", "error")->back();
            return;
        }

        $task = new Task();
        if (!$task->selectById((int)$taskId) || (int)$task->getActive() !== 1) {
            $this->call(404, "not_found", "Tarefa não encontrada ou já inativa.", "error")->back();
            return;
        }

        if ((int)$task->getUserId() !== (int)$this->userAuthId) {
            $this->call(403, "forbidden", "Você não tem permissão para remover esta tarefa.", "error")->back();
            return;
        }

        // Remove imagens associadas à tarefa para não deixar arquivos órfãos no disco
        $taskImageModel = new TaskImage();
        $images = $taskImageModel->selectByTaskId((int)$taskId);

        if (!$task->softDeleteById((int)$taskId)) {
            $this->call(404, "not_found", "Tarefa não encontrada ou já inativa.", "error")->back();
            return;
        }

        foreach ($images as $img) {
            $taskImageModel->deleteById((int)$img->id);
            $this->removePhysicalTaskImage($img->image_path ?? null);
        }

        $this->call(200, "success", "Tarefa excluída com sucesso!", "success")->back();
    }

    /* =====================================================
       ETAPA 07 — GALERIA DE IMAGENS DA TAREFA (1:N)
       ===================================================== */

    public function listImages(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $taskId = isset($data["taskId"]) ? filter_var($data["taskId"], FILTER_VALIDATE_INT) : false;
        if (!$taskId) {
            $this->call(400, "bad_request", "ID da tarefa é obrigatório e deve ser inteiro.", "error")->back();
            return;
        }

        $task = new Task();
        if (!$task->selectById($taskId) || (int)$task->getActive() !== 1) {
            $this->call(404, "not_found", "Tarefa não encontrada.", "error")->back();
            return;
        }

        if ((int)$task->getUserId() !== (int)$this->userAuthId) {
            $this->call(403, "forbidden", "Você não tem permissão para acessar as imagens desta tarefa.", "error")->back();
            return;
        }

        $imageModel = new TaskImage();
        $rows = $imageModel->selectByTaskId($taskId);

        $images = array_map(function ($row) {
            return [
                "id" => (int)$row->id,
                "task_id" => (int)$row->task_id,
                "image_path" => $row->image_path,
                "url" => url(ltrim($row->image_path, "/")),
                "alt_text" => $row->alt_text,
                "position" => (int)$row->position,
                "created_at" => $row->created_at
            ];
        }, $rows);

        $this->call(200, "success", "Galeria de imagens da tarefa", "success")->back($images);
    }

    public function uploadImages(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $taskId = isset($data["taskId"]) ? filter_var($data["taskId"], FILTER_VALIDATE_INT) : false;
        if (!$taskId) {
            $this->call(400, "bad_request", "ID da tarefa é obrigatório e deve ser inteiro.", "error")->back();
            return;
        }

        $task = new Task();
        if (!$task->selectById($taskId) || (int)$task->getActive() !== 1) {
            $this->call(404, "not_found", "Tarefa não encontrada.", "error")->back();
            return;
        }

        if ((int)$task->getUserId() !== (int)$this->userAuthId) {
            $this->call(403, "forbidden", "Você não tem permissão para enviar imagens nesta tarefa.", "error")->back();
            return;
        }

        $normalizedFiles = $this->normalizeUploadedFiles();
        if (empty($normalizedFiles)) {
            $this->call(400, "bad_request", "Selecione ao menos uma imagem válida para enviar.", "error")->back();
            return;
        }

        $altText = isset($_POST["alt_text"]) && is_string($_POST["alt_text"])
            ? trim($_POST["alt_text"])
            : null;
        if ($altText === "") {
            $altText = null;
        }

        $uploadDirectory = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "tasks";
        $uploader = new Upload($uploadDirectory);

        $imageModel = new TaskImage();
        $existing = $imageModel->selectByTaskId($taskId);
        $position = count($existing);

        $savedRecords = [];

        foreach ($normalizedFiles as $fileUpload) {
            try {
                $filename = $uploader->image($fileUpload);
            } catch (RuntimeException $exception) {
                $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
                return;
            }

            $relativePath = "uploads/tasks/" . $filename;
            $position++;

            $newImage = new TaskImage(
                null,
                $taskId,
                $relativePath,
                $altText ?? $task->getTitle(),
                $position
            );

            if (!$newImage->insert()) {
                // Remove o arquivo recém-gravado caso a persistência no banco falhe
                $fullSavedPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
                if (is_file($fullSavedPath)) {
                    @unlink($fullSavedPath);
                }
                $this->call(500, "internal_server_error", $newImage->getErrorMessage() ?: "Não foi possível salvar os metadados da imagem no banco.", "error")->back();
                return;
            }

            $savedRecords[] = [
                "id" => $newImage->getId(),
                "task_id" => $taskId,
                "image_path" => $relativePath,
                "url" => url($relativePath),
                "alt_text" => $newImage->getAltText(),
                "position" => $position
            ];
        }

        $this->call(201, "created", "Imagem(ns) enviada(s) com sucesso!", "success")->back($savedRecords);
    }

    public function deleteImage(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $taskId = isset($data["taskId"]) ? filter_var($data["taskId"], FILTER_VALIDATE_INT) : false;
        $imageId = isset($data["imageId"]) ? filter_var($data["imageId"], FILTER_VALIDATE_INT) : false;

        if (!$taskId || !$imageId) {
            $this->call(400, "bad_request", "Os identificadores da tarefa e da imagem são obrigatórios.", "error")->back();
            return;
        }

        $task = new Task();
        if (!$task->selectById($taskId) || (int)$task->getActive() !== 1) {
            $this->call(404, "not_found", "Tarefa não encontrada.", "error")->back();
            return;
        }

        if ((int)$task->getUserId() !== (int)$this->userAuthId) {
            $this->call(403, "forbidden", "Você não tem permissão para remover imagens desta tarefa.", "error")->back();
            return;
        }

        $imageModel = new TaskImage();
        $imageRow = $imageModel->selectByIdAndTask($imageId, $taskId);
        if (!$imageRow) {
            $this->call(404, "not_found", "Imagem não encontrada para esta tarefa.", "error")->back();
            return;
        }

        if (!$imageModel->deleteById($imageId)) {
            $this->call(500, "internal_server_error", $imageModel->getErrorMessage() ?: "Não foi possível remover a imagem.", "error")->back();
            return;
        }

        $this->removePhysicalTaskImage($imageRow->image_path ?? null);

        $this->call(200, "success", "Imagem removida com sucesso!", "success")->back([
            "id" => $imageId,
            "task_id" => $taskId
        ]);
    }

    private function normalizeUploadedFiles(): array
    {
        $files = [];
        $source = $_FILES["images"] ?? $_FILES["image"] ?? null;

        if (!$source || !is_array($source)) {
            return [];
        }

        if (is_array($source["name"])) {
            $count = count($source["name"]);
            for ($i = 0; $i < $count; $i++) {
                if (($source["error"][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                    continue;
                }
                $files[] = [
                    "name" => $source["name"][$i],
                    "type" => $source["type"][$i] ?? "",
                    "tmp_name" => $source["tmp_name"][$i],
                    "error" => (int)$source["error"][$i],
                    "size" => (int)$source["size"][$i]
                ];
            }
        } else {
            if (($source["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $files[] = [
                    "name" => $source["name"],
                    "type" => $source["type"] ?? "",
                    "tmp_name" => $source["tmp_name"],
                    "error" => (int)$source["error"],
                    "size" => (int)$source["size"]
                ];
            }
        }

        return $files;
    }

    private function removePhysicalTaskImage(?string $imagePath): void
    {
        if (!$imagePath) {
            return;
        }

        $filename = basename($imagePath);
        if (!preg_match('/\A[a-f0-9]{32}\.(?:jpg|png|webp)\z/', $filename)) {
            return;
        }

        $fullPath = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "tasks" . DIRECTORY_SEPARATOR . $filename;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    private function parseInputData(array $initial): array
    {
        $result = $initial;
        $raw = file_get_contents('php://input');

        if (!empty($raw)) {
            $decodedJson = json_decode($raw, true);
            if (is_array($decodedJson)) {
                $result = array_merge($result, $decodedJson);
            } else {
                parse_str($raw, $formValues);
                if (is_array($formValues)) {
                    $result = array_merge($result, $formValues);
                }
            }
        }

        if (!empty($_POST)) {
            $result = array_merge($result, $_POST);
        }

        return $result;
    }
}
