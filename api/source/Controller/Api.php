<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Core\JWTToken;

class Api
{
    protected int $userAuthId = 0;
    protected ?object $userAuthData = null;
    protected array $response = [];

    public function hello(array $data): void
    {
        $this->call(200, "success", "Bem-vindo à API do TaskFlow!", "success")
            ->back([
                "app" => "TaskFlow API",
                "version" => "1.0.0",
                "status" => "online"
            ]);
    }

    public function authToken(?int $typeId = null): bool
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];

        // Normalização de chaves para suportar diferentes servidores web
        $normalizedHeaders = [];
        foreach ($headers as $key => $value) {
            $normalizedHeaders[strtolower($key)] = $value;
        }

        $token = $normalizedHeaders["token"] ?? $normalizedHeaders["authorization"] ?? null;

        if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (!$token) {
            return false;
        }

        if (str_starts_with($token, 'Bearer ')) {
            $token = substr($token, 7);
        }

        $jwt = new JWTToken();
        $jwtToken = $jwt->decode($token);

        if (!$jwtToken || empty($jwtToken->data)) {
            return false;
        }

        $tokenTypeId = $jwtToken->data->type_id ?? null;
        if ($typeId !== null && $tokenTypeId !== null && (int)$tokenTypeId !== $typeId) {
            return false;
        }

        $user = new User();
        if (empty($jwtToken->data->id) || empty($jwtToken->data->email)) {
            return false;
        }

        if ($typeId !== null && !$user->permissionVerify($jwtToken->data->email, $typeId)) {
            return false;
        }

        $this->userAuthId = (int)$jwtToken->data->id;
        $this->userAuthData = $jwtToken->data;

        return true;
    }

    protected function call(int $code, ?string $status = null, ?string $message = null, ?string $type = null): Api
    {
        http_response_code($code);
        $this->response = [
            "code" => $code,
            "type" => $type ?? ($code >= 200 && $code < 300 ? "success" : "error"),
            "status" => $status ?? ($code >= 200 && $code < 300 ? "success" : "error"),
            "message" => $message
        ];
        return $this;
    }

    protected function back(object|array|null $data = null): Api
    {
        header('Content-Type: application/json; charset=UTF-8');
        if ($data !== null) {
            $this->response["data"] = $data;
        }
        echo json_encode($this->response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $this;
    }
}
