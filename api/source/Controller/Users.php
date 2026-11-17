<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Support\Upload;

class Users extends Api
{
    public function usersList(array $data): void
    {
        $user = new User();
        $list = $user->selectAll(["active = 1"]);
        
        $sanitizedList = array_map(function($u) {
            return [
                "id" => $u->id,
                "type_id" => $u->type_id,
                "name" => $u->name,
                "email" => $u->email,
                "photo" => $this->photoUrl($u->photo)
            ];
        }, $list);

        $this->call(200, "success", "Lista de usuários", "success")->back($sanitizedList);
    }

    public function register(array $data): void
    {
        $data = $this->parseInput($data);

        if (!isset($data['name']) || empty(trim($data['name']))) {
            $this->call(400, "bad_request", "O nome é obrigatório.", "error")->back();
            return;
        }

        if (!isset($data['email']) || empty(trim($data['email'])) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "E-mail inválido ou não informado.", "error")->back();
            return;
        }

        if (!isset($data['password']) || empty($data['password']) || strlen($data['password']) < 6) {
            $this->call(400, "bad_request", "A senha é obrigatória e deve ter no mínimo 6 caracteres.", "error")->back();
            return;
        }

        $user = new User(
            null,
            2,
            trim($data['name']),
            trim($data['email']),
            $data['password'],
            $data['photo'] ?? null,
            1
        );

        if (!$user->insert()) {
            $this->call(400, "bad_request", $user->getErrorMessage() ?: "Não foi possível cadastrar o usuário.", "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail()
        ];

        $this->call(201, "created", "Cadastro realizado com sucesso!", "success")->back($response);
    }

    public function login(array $data): void
    {
        $data = $this->parseInput($data);

        if (!isset($data['email'], $data['password']) ||
            empty(trim($data['email'])) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "E-mail e senha são obrigatórios. Informe um e-mail válido.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->login(trim($data['email']), $data['password'])) {
            $this->call(401, "unauthorized", $user->getErrorMessage() ?: "Credenciais inválidas.", "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $this->photoUrl($user->getPhoto()),
            "token" => $user->getToken()
        ];

        $this->call(200, "success", "Login realizado com sucesso!", "success")->back($response);
    }

    public function auth(array $data): void
    {
        $this->login($data);
    }

    public function authAdmin(array $data): void
    {
        $data = $this->parseInput($data);

        if (!isset($data['email'], $data['password']) ||
            empty(trim($data['email'])) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "E-mail e senha são obrigatórios.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->login(trim($data['email']), $data['password'], 1)) {
            $this->call(401, "unauthorized", $user->getErrorMessage() ?: "Credenciais administrativas inválidas.", "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $this->photoUrl($user->getPhoto()),
            "token" => $user->getToken()
        ];

        $this->call(200, "success", "Administrador autenticado com sucesso!", "success")->back($response);
    }

    public function me(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil carregado com sucesso.", "success")->back([
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $this->photoUrl($user->getPhoto())
        ]);
    }

    public function update(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $data = $this->parseInput($data);

        $name = isset($data["name"]) && is_string($data["name"]) ? trim($data["name"]) : "";
        $email = isset($data["email"]) && is_string($data["email"]) ? trim($data["email"]) : "";

        if ($name === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "Informe um nome e um e-mail válido.", "error")->back();
            return;
        }

        $passwordFieldsProvided = array_key_exists("current_password", $data) || array_key_exists("new_password", $data);
        $currentPassword = null;
        $newPassword = null;

        if ($passwordFieldsProvided) {
            $currentPassword = $data["current_password"] ?? null;
            $newPassword = $data["new_password"] ?? null;
            if ($currentPassword !== "" || $newPassword !== "") {
                if (!is_string($currentPassword) || $currentPassword === "" ||
                    !is_string($newPassword) || strlen($newPassword) < 6) {
                    $this->call(400, "bad_request", "Informe a senha atual e uma nova senha com pelo menos 6 caracteres.", "error")->back();
                    return;
                }
            } else {
                $currentPassword = null;
                $newPassword = null;
            }
        }

        $user = new User();
        if (!$user->updateProfile($this->userAuthId, $name, $email, $currentPassword, $newPassword)) {
            $message = $user->getErrorMessage() ?? "Não foi possível atualizar o perfil.";
            $code = match ($message) {
                "Perfil não encontrado." => 404,
                "Este e-mail já está cadastrado." => 409,
                "A senha atual está incorreta." => 400,
                default => 500,
            };
            $status = match ($code) {
                400 => "bad_request",
                404 => "not_found",
                409 => "conflict",
                default => "internal_server_error",
            };
            $this->call($code, $status, $message, "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil atualizado com sucesso!", "success")->back([
            "id" => $user->getId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $this->photoUrl($user->getPhoto()),
            "token" => $user->getToken()
        ]);
    }

    public function uploadPhoto(array $data): void
    {
        if (!$this->authToken()) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        if (!isset($_FILES["photo"]) || !is_array($_FILES["photo"])) {
            $this->call(400, "bad_request", "Selecione uma imagem para enviar.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }
        $oldPhoto = $user->getPhoto();

        $uploadDirectory = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "users";
        $uploader = new Upload($uploadDirectory);
        try {
            $filename = $uploader->image($_FILES["photo"]);
        } catch (\RuntimeException $exception) {
            $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
            return;
        }

        $photoPath = "uploads/users/" . $filename;
        $photoUrl = $this->photoUrl($photoPath);
        if (!$user->updatePhoto($this->userAuthId, $photoPath)) {
            $savedPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
            if (is_file($savedPath) && !unlink($savedPath)) {
                error_log("Não foi possível remover a foto enviada após falha ao atualizar o perfil.");
            }
            $this->call(500, "internal_server_error", $user->getErrorMessage() ?? "Não foi possível atualizar a foto.", "error")->back();
            return;
        }

        $this->deletePreviousPhoto($oldPhoto, $uploadDirectory);

        $this->call(200, "success", "Foto atualizada com sucesso.", "success")->back([
            "photo" => $photoUrl,
            "photo_path" => $photoPath
        ]);
    }

    private function photoUrl(?string $photoPath): ?string
    {
        if ($photoPath === null || trim($photoPath) === "") {
            return null;
        }

        if (filter_var($photoPath, FILTER_VALIDATE_URL)) {
            return $photoPath;
        }

        return url(ltrim($photoPath, "/"));
    }

    private function deletePreviousPhoto(?string $photoUrl, string $uploadDirectory): void
    {
        if ($photoUrl === null || $photoUrl === "") {
            return;
        }

        $photoPath = parse_url($photoUrl, PHP_URL_PATH);
        $uploadsUrlPath = parse_url(url("uploads/users/"), PHP_URL_PATH);
        if (!is_string($photoPath) || !is_string($uploadsUrlPath)) {
            return;
        }

        $normalizedPath = ltrim($photoPath, "/");
        $managedPrefixes = ["uploads/users/", ltrim(rtrim($uploadsUrlPath, "/") . "/", "/")];
        $filename = null;
        foreach ($managedPrefixes as $managedPrefix) {
            if ($managedPrefix !== "" && str_starts_with($normalizedPath, $managedPrefix)) {
                $candidate = substr($normalizedPath, strlen($managedPrefix));
                if (preg_match('/\A[a-f0-9]{32}\.(?:jpg|png|webp)\z/', $candidate)) {
                    $filename = $candidate;
                    break;
                }
            }
        }

        if ($filename === null) {
            return;
        }

        $oldFilePath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
        if (is_file($oldFilePath) && !unlink($oldFilePath)) {
            error_log("Não foi possível remover a foto antiga do perfil.");
        }
    }

    private function parseInput(array $initial): array
    {
        $result = array_merge($_POST, $initial);
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

        return $result;
    }
}
