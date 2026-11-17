<?php

require __DIR__ . "/api/vendor/autoload.php";

use Source\Core\JWTToken;

$jwt = new JWTToken();

echo "=== Teste de JWT do TaskFlow ===\n";

$payload = [
    "id" => 1,
    "name" => "Administrador TaskFlow",
    "email" => "admin@taskflow.com",
    "type_id" => 1
];

echo "\n1. Payload original:\n";
print_r($payload);

$token = $jwt->encode($payload);
echo "\n2. Token gerado (encode):\n" . $token . "\n";

$decoded = $jwt->decode($token);
echo "\n3. Token decodificado (decode):\n";
print_r($decoded);

echo "\n=== Teste Concluído com Sucesso! ===\n";
