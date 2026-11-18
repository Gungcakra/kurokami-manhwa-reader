<?php
/**
 * Kurokami session API for PHP-only hosting (Hostinger shared hosting etc.).
 * Replaces the Astro routes that used to live in src/pages/api/auth — same
 * paths, same JSON. api/.htaccess sends every /api/* request here.
 *
 *   POST /api/auth/import   { session }  → import a Shinigami `__session_v2`
 *   GET  /api/auth/me                     → restore it from the httpOnly cookie
 *   POST /api/auth/logout                 → drop the cookie
 *
 * Shinigami's own login sits behind a Cloudflare challenge, so the user copies
 * their `__session_v2` cookie instead. It decodes to { user_id, token (PASETO
 * v4.public, issuer izanami-api), username, email, avatar_image_url,
 * is_premium, access_token, refresh_token }; only what Kurokami needs (no
 * Supabase tokens) is kept.
 */

ini_set('display_errors', '0');

const COOKIE = 'kurokami_session';
const FALLBACK_TTL = 60 * 60 * 23; // the izanami token lives ~24h
const UUID_RE = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
}

function session_cookie(string $value, int $maxAge): void
{
    setcookie(COOKIE, $value, [
        'expires' => $maxAge > 0 ? time() + $maxAge : time() - 3600,
        'path' => '/',
        'secure' => is_https(), // allow http://localhost during preview
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

/** Accept the raw cookie value (URL-encoded) or the already-decoded JSON. */
function parse_session(string $input): ?array
{
    $text = preg_replace('/;.*$/s', '', preg_replace('/^__session_v2=/', '', trim($input)));
    if (strpos($text, '{') !== 0) $text = rawurldecode($text);
    $data = json_decode($text, true);
    return is_array($data) ? $data : null;
}

function b64url_decode(string $s): string
{
    $s = strtr($s, '-_', '+/');
    return (string) base64_decode($s . str_repeat('=', (4 - strlen($s) % 4) % 4));
}

/** `exp` (ms) from a PASETO v4.public token's unsigned-but-readable payload. */
function paseto_expiry(string $token): ?int
{
    if (!preg_match('/^v4\.public\.([A-Za-z0-9_-]+)/', $token, $m)) return null;
    $bytes = b64url_decode($m[1]);
    // payload = message || 64-byte Ed25519 signature
    if (strlen($bytes) <= 64) return null;
    $claims = json_decode(substr($bytes, 0, -64), true);
    $exp = is_array($claims) && isset($claims['exp']) ? strtotime((string) $claims['exp']) : false;
    return $exp === false ? null : $exp * 1000;
}

function public_user(array $s): array
{
    return [
        'user_id' => $s['user_id'] ?? null,
        'username' => $s['username'] ?? null,
        'email' => $s['email'] ?? null,
        'avatar_image_url' => $s['avatar_image_url'] ?? null,
        'is_premium' => !empty($s['is_premium']),
        'token' => $s['token'] ?? null,
        'expiresAt' => $s['expiresAt'] ?? null,
    ];
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$pos = strpos($path, '/api/');
$route = trim($pos === false ? '' : substr($path, $pos + 5), '/');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($route === 'auth/import' && $method === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($body)) {
        json_out(['error' => 'Body harus JSON { session }'], 400);
        return;
    }
    $input = (string) ($body['session'] ?? '');
    if (trim($input) === '') {
        json_out(['error' => 'Tempel nilai cookie __session_v2'], 400);
        return;
    }
    $session = parse_session($input);
    if (!$session) {
        json_out(['error' => 'Format tidak dikenali — pastikan menyalin seluruh nilai __session_v2'], 400);
        return;
    }
    if (!preg_match(UUID_RE, (string) ($session['user_id'] ?? '')) || !is_string($session['token'] ?? null)) {
        json_out(['error' => 'Sesi tidak lengkap (user_id / token tidak ditemukan)'], 400);
        return;
    }
    $now = (int) floor(microtime(true) * 1000);
    $expiresAt = paseto_expiry($session['token']) ?? $now + FALLBACK_TTL * 1000;
    $maxAge = (int) floor(($expiresAt - $now) / 1000);
    if ($maxAge <= 0) {
        json_out(['error' => 'Sesi sudah kedaluwarsa — login ulang di Shinigami lalu salin lagi'], 401);
        return;
    }
    $user = public_user(array_merge($session, ['expiresAt' => $expiresAt]));
    session_cookie(json_encode($user, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $maxAge);
    json_out($user);
    return;
}

if ($route === 'auth/me' && $method === 'GET') {
    $raw = $_COOKIE[COOKIE] ?? '';
    if ($raw === '') {
        json_out(['error' => 'Tidak ada sesi'], 401);
        return;
    }
    $session = json_decode($raw, true);
    if (!is_array($session)) {
        json_out(['error' => 'Sesi rusak'], 401);
        return;
    }
    json_out(public_user($session));
    return;
}

if ($route === 'auth/logout' && $method === 'POST') {
    session_cookie('', 0);
    json_out(['ok' => true]);
    return;
}

json_out(['error' => 'Not found'], 404);
