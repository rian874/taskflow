<?php

namespace Source\Core;

use DateTimeImmutable;
use Exception;

class JWTToken
{
    private string $secretKey = JWT_SECRET_KEY;
    private string $algorithm = "sha256";
    private string $url = CONF_URL_BASE;

    public function encode(array $payLoad): string
    {
        // Se a classe Firebase\JWT\JWT existir, utiliza ela
        if (class_exists('\\Firebase\\JWT\\JWT')) {
            $tokenId  = base64_encode(random_bytes(16));
            $issuedAt = new DateTimeImmutable();
            $expire   = $issuedAt->modify('+90 minutes')->getTimestamp();

            $data = [
                'iat'  => $issuedAt->getTimestamp(),
                'jti'  => $tokenId,
                'iss'  => $this->url,
                'nbf'  => $issuedAt->getTimestamp(),
                'exp'  => $expire,
                'data' => $payLoad
            ];

            return \Firebase\JWT\JWT::encode($data, $this->secretKey, "HS256");
        }

        // Implementação nativa compatível com JWT RFC 7519
        $issuedAt = time();
        $expire   = $issuedAt + (90 * 60);

        $header = [
            "typ" => "JWT",
            "alg" => "HS256"
        ];

        $payloadData = [
            "iat"  => $issuedAt,
            "jti"  => bin2hex(random_bytes(8)),
            "iss"  => $this->url,
            "nbf"  => $issuedAt,
            "exp"  => $expire,
            "data" => $payLoad
        ];

        $base64UrlHeader = $this->base64UrlEncode(json_encode($header));
        $base64UrlPayload = $this->base64UrlEncode(json_encode($payloadData));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secretKey, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function decode(string $token): bool | object
    {
        try {
            if (class_exists('\\Firebase\\JWT\\JWT') && class_exists('\\Firebase\\JWT\\Key')) {
                $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($this->secretKey, 'HS256'));
                $now = time();
                if ($decoded->iss !== $this->url || $decoded->nbf > $now || $decoded->exp < $now) {
                    return false;
                }
                return $decoded;
            }

            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;
            }

            [$header64, $payload64, $signature64] = $parts;

            $validSignature = hash_hmac('sha256', $header64 . "." . $payload64, $this->secretKey, true);
            $validSignature64 = $this->base64UrlEncode($validSignature);

            if (!hash_equals($validSignature64, $signature64)) {
                return false;
            }

            $payload = json_decode($this->base64UrlDecode($payload64));
            if (!$payload) {
                return false;
            }

            $now = time();
            if (isset($payload->exp) && $payload->exp < $now) {
                return false;
            }
            if (isset($payload->nbf) && $payload->nbf > $now) {
                return false;
            }

            return $payload;
        } catch (Exception) {
            return false;
        }
    }

    private function base64UrlEncode(string $data): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $data .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
