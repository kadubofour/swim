<?php
// Saves a swim registration to data/registrations.csv. Works on standard Hostinger PHP hosting.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'POST only');

// Same-site requests only.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$hostOnly = fn(string $h): string => strtolower(preg_replace('/:\d+$/', '', $h));
if ($origin !== '' && $hostOnly((string)parse_url($origin, PHP_URL_HOST)) !== $hostOnly($_SERVER['HTTP_HOST'] ?? '')) fail(403, 'Forbidden');

// Honeypot: real users leave this empty.
if (!empty($_POST['website'])) { echo json_encode(['ok' => true]); exit; }

function field(string $k, int $max): string {
    $v = trim((string)($_POST[$k] ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
}

$d = [
    'program'   => field('program', 40),
    'swimmer'   => field('swimmer', 100),
    'age'       => field('age', 3),
    'parent'    => field('parent', 100),
    'phone'     => field('phone', 30),
    'email'     => field('email', 120),
    'emergency' => field('emergency', 150),
    'medical'   => field('medical', 1000),
];

foreach (['program','swimmer','age','parent','phone','email','emergency'] as $req) {
    if ($d[$req] === '') fail(422, "Missing field: $req");
}
if (!preg_match('/^[a-z0-9_-]+$/i', $d['program'])) fail(422, 'Invalid program');
if (!ctype_digit($d['age']) || (int)$d['age'] < 1 || (int)$d['age'] > 99) fail(422, 'Invalid age');
if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) fail(422, 'Invalid email');
if (empty($_POST['waiver'])) fail(422, 'Waiver must be accepted');

// Stop spreadsheet formula injection (=, +, -, @ at the start of a cell).
$safe = fn(string $s): string => preg_match('/^[=+\-@\t\r]/', $s) ? "'" . $s : $s;

$dir = __DIR__ . '/data';
if (!is_dir($dir) && !mkdir($dir, 0750, true)) fail(500, 'Storage unavailable');
// Block web access to the data folder (Apache/LiteSpeed, which Hostinger uses).
if (!file_exists("$dir/.htaccess")) file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n");

$file = "$dir/registrations.csv";
$new = !file_exists($file);
$fh = fopen($file, 'ab');
if (!$fh || !flock($fh, LOCK_EX)) fail(500, 'Could not save');

if ($new) fputcsv($fh, ['received_at','program','swimmer','age','parent','phone','email','emergency','medical','waiver','ip'], ',', '"', '');
fputcsv($fh, array_merge(
    [gmdate('Y-m-d H:i:s') . ' UTC'],
    array_map($safe, array_values($d)),
    ['yes', $_SERVER['REMOTE_ADDR'] ?? '']
), ',', '"', '');
fflush($fh); flock($fh, LOCK_UN); fclose($fh);

echo json_encode(['ok' => true]);
