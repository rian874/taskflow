<?php

// Autoloader PSR-4 para o TaskFlow API

spl_autoload_register(function ($class) {
    // Prefixos e diretórios correspondentes
    $prefixes = [
        'Source\\' => __DIR__ . '/../source/',
        'CoffeeCode\\Router\\' => __DIR__ . '/coffeecode/router/src/'
    ];

    foreach ($prefixes as $prefix => $baseDir) {
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) === 0) {
            $relativeClass = substr($class, $len);
            $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

            if (file_exists($file)) {
                require_once $file;
                return;
            }
        }
    }
});

// Arquivos auxiliares e configurações globais
if (file_exists(__DIR__ . '/../source/Config/Config.php')) {
    require_once __DIR__ . '/../source/Config/Config.php';
}

if (file_exists(__DIR__ . '/../source/Support/Helpers.php')) {
    require_once __DIR__ . '/../source/Support/Helpers.php';
}
