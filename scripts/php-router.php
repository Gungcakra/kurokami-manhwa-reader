<?php
// Local preview only: emulates public/.htaccess + public/api/.htaccess for `php -S` (npm run preview).
$root = $_SERVER['DOCUMENT_ROOT'];
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (strpos($path, '/api/') === 0) { require $root . '/api/index.php'; return true; }
if (is_file($root . $path)) return false;
$dirIndex = $root . rtrim($path, '/') . '/index.html';
if (is_file($dirIndex)) { readfile($dirIndex); return true; }
if (preg_match('#^/(manhwa|chapter)/[^/]+/?$#', $path, $m)) { readfile("$root/{$m[1]}/_/index.html"); return true; }
http_response_code(404); echo 'Not found'; return true;
