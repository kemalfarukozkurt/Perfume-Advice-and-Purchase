<?php
/**
 * KAANI Perfume - Database Configuration
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'parfumes');

// Establish database connection
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set character set
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    error_log($e->getMessage());
    exit('Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
}

// Site configuration
define('SITE_NAME', 'KAANI Parfüm');
define('SITE_URL', 'http://localhost/parfumes');
define('UPLOAD_DIR', __DIR__ . '/uploads');
define('IMG_DIR', __DIR__ . '/img');

// Session configuration
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Time zone
date_default_timezone_set('Europe/Istanbul');

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to generate CSRF token
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Function to verify CSRF token
function verifyCSRFToken($token) {
    if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
        return false;
    }
    return true;
}

// Function to sanitize input
function sanitizeInput($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    $data = $conn->real_escape_string($data);
    return $data;
}
