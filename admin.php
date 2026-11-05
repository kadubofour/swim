<?php
// Password-protected view of data/registrations.csv. Read-only.
declare(strict_types=1);

$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('swimadmin');
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Strict']);
session_start();
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');

$h = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$cfg = __DIR__ . '/admin-config.php';
if (is_file($cfg)) require $cfg;

$configured = (defined('ADMIN_PASSWORD_HASH') && ADMIN_PASSWORD_HASH !== '')
    || (defined('ADMIN_PASSWORD') && ADMIN_PASSWORD !== '' && ADMIN_PASSWORD !== 'change-me');

function page(string $title, string $body): void {
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
       . '<meta name="robots" content="noindex"><title>' . $title . '</title><link rel="stylesheet" href="assets/style.css">'
       . '<style>.wrap{max-width:1200px}.tw{overflow-x:auto;border:1px solid var(--line);border-radius:10px}'
       . 'table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}'
       . 'th{background:var(--aqua);white-space:nowrap}.bar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:16px 0}.bar input,.bar select{width:auto}'
       . '.err{background:#fde8e8;color:#8a1c1c;border-radius:10px;padding:10px 14px}</style></head><body><section><div class="wrap">'
       . $body . '</div></section></body></html>';
    exit;
}

// Login throttling: 5 failed attempts per IP per 15 minutes.
function attempts_file(): string { return __DIR__ . '/data/login-attempts.json'; }
function load_attempts(): array {
    $a = is_file(attempts_file()) ? json_decode((string)file_get_contents(attempts_file()), true) : [];
    return is_array($a) ? $a : [];
}
function recent_failures(string $ip): int {
    $cut = time() - 900;
    return count(array_filter(load_attempts()[$ip] ?? [], fn($t) => $t > $cut));
}
function record_failure(string $ip): void {
    $a = load_attempts(); $cut = time() - 900;
    foreach ($a as $k => $v) { $a[$k] = array_values(array_filter($v, fn($t) => $t > $cut)); if (!$a[$k]) unset($a[$k]); }
    $a[$ip][] = time();
    if (is_dir(__DIR__ . '/data')) file_put_contents(attempts_file(), json_encode($a), LOCK_EX);
}

if (!$configured) {
    page('Admin setup', '<h2>Admin not set up</h2><p>Copy <code>admin-config.sample.php</code> to <code>admin-config.php</code> and set a password, then reload this page.</p>');
}

if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) { http_response_code(400); exit('Bad request'); }
    if (($_POST['action'] ?? '') === 'logout') {
        $_SESSION = []; session_destroy(); header('Location: admin.php'); exit;
    }
    if (($_POST['action'] ?? '') === 'login') {
        if (recent_failures($ip) >= 5) {
            $error = 'Too many attempts. Try again in 15 minutes.';
        } else {
            $pw = (string)($_POST['password'] ?? '');
            $ok = defined('ADMIN_PASSWORD_HASH') && ADMIN_PASSWORD_HASH !== ''
                ? password_verify($pw, ADMIN_PASSWORD_HASH)
                : (defined('ADMIN_PASSWORD') && hash_equals(ADMIN_PASSWORD, $pw));
            if ($ok) {
                session_regenerate_id(true);
                $_SESSION['auth'] = true; $_SESSION['csrf'] = bin2hex(random_bytes(16));
                header('Location: admin.php'); exit;
            }
            record_failure($ip);
            $error = 'Wrong password.';
        }
    }
}

if (empty($_SESSION['auth'])) {
    page('Admin login', '<h2>Admin login</h2>' . ($error ? '<p class="err">' . $h($error) . '</p>' : '')
        . '<form method="post"><input type="hidden" name="csrf" value="' . $h($_SESSION['csrf']) . '"><input type="hidden" name="action" value="login">'
        . '<label>Password<input type="password" name="password" autocomplete="current-password" required autofocus></label>'
        . '<button class="btn" type="submit">Log in</button></form>');
}

$file = __DIR__ . '/data/registrations.csv';

if (isset($_GET['download'])) {
    if (!is_file($file)) { http_response_code(404); exit('No registrations yet'); }
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="registrations-' . date('Y-m-d') . '.csv"');
    readfile($file); exit;
}

$rows = []; $head = [];
if (is_file($file) && ($fh = fopen($file, 'rb'))) {
    flock($fh, LOCK_SH);
    $head = fgetcsv($fh, 0, ',', '"', '') ?: [];
    while (($r = fgetcsv($fh, 0, ',', '"', '')) !== false) { if ($r !== [null]) $rows[] = $r; }
    flock($fh, LOCK_UN); fclose($fh);
}
$rows = array_reverse($rows); // newest first
$col = array_flip($head);
$unq = fn(string $s): string => preg_match("/^'[=+\-@\t\r]/", $s) ? substr($s, 1) : $s; // undo CSV formula guard for display

$counts = [];
foreach ($rows as $r) { $p = $r[$col['program'] ?? 1] ?? ''; $counts[$p] = ($counts[$p] ?? 0) + 1; }
ksort($counts);

$body = '<div class="bar"><h2 style="margin:0;flex:1">Registrations (' . count($rows) . ')</h2>'
      . ($rows ? '<a class="btn alt" href="admin.php?download=1">Download CSV</a>' : '')
      . '<form method="post" style="display:block"><input type="hidden" name="csrf" value="' . $h($_SESSION['csrf']) . '"><input type="hidden" name="action" value="logout"><button class="btn alt" type="submit">Log out</button></form></div>';

if (!$rows) {
    $body .= '<p class="note">No registrations yet.</p>';
} else {
    $body .= '<p>';
    foreach ($counts as $p => $n) $body .= '<span class="tag">' . $h($p) . ': ' . $n . '</span>';
    $body .= '</p><div class="bar"><input id="q" type="search" placeholder="Search name, phone, email…" aria-label="Search">'
           . '<select id="prog" aria-label="Filter by program"><option value="">All programs</option>';
    foreach (array_keys($counts) as $p) $body .= '<option>' . $h($p) . '</option>';
    $body .= '</select></div><div class="tw"><table id="t"><thead><tr>';
    foreach ($head as $c) $body .= '<th>' . $h(str_replace('_', ' ', $c)) . '</th>';
    $body .= '</tr></thead><tbody>';
    foreach ($rows as $r) {
        $body .= '<tr data-p="' . $h($r[$col['program'] ?? 1] ?? '') . '">';
        foreach ($head as $i => $_) $body .= '<td>' . $h($unq($r[$i] ?? '')) . '</td>';
        $body .= '</tr>';
    }
    $body .= '</tbody></table></div>'
           . '<script>(function(){var q=document.getElementById("q"),p=document.getElementById("prog"),rs=document.querySelectorAll("#t tbody tr");'
           . 'function f(){var s=q.value.toLowerCase(),g=p.value;rs.forEach(function(r){r.hidden=(g&&r.dataset.p!==g)||(s&&r.textContent.toLowerCase().indexOf(s)<0)})}'
           . 'q.oninput=f;p.onchange=f})();</script>';
}
page('Registrations', $body);
