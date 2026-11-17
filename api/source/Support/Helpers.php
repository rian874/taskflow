<?php

function url(?string $path = null): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    $dirName = str_replace('\\', '/', dirname($scriptName));
    $basePath = preg_replace('#/api(/.*)?$#i', '', $dirName);
    
    if ($basePath === '/' || $basePath === '.') {
        $basePath = '';
    }
    
    $baseUrl = "{$scheme}://{$host}" . ($basePath ? $basePath : "/rian/taskflow");

    if ($path) {
        return $baseUrl . "/" . ($path[0] === "/" ? mb_substr($path, 1) : $path);
    }
    return $baseUrl;
}
