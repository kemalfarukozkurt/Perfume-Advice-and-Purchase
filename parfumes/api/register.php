<?php
/**
 * KAANI Perfume - Register API
 * 
 * Endpoint for user registration
 */

// Include helper functions
require_once '../functions.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate data
if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    jsonResponse(['success' => false, 'message' => 'Name, email, and password are required'], 400);
}

// Sanitize inputs
$name = sanitizeInput($data['name']);
$email = sanitizeInput($data['email']);
$password = $data['password']; // Will be hashed, no need to sanitize

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Invalid email format'], 400);
}

// Validate password
if (strlen($password) < 6) {
    jsonResponse(['success' => false, 'message' => 'Password must be at least 6 characters'], 400);
}

// Check if email already exists
global $conn;
$query = "SELECT id FROM users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    jsonResponse(['success' => false, 'message' => 'Email already exists'], 409);
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user into database
$query = "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($query);
$currentDateTime = getCurrentDateTime();
$stmt->bind_param('ssss', $name, $email, $hashedPassword, $currentDateTime);

if ($stmt->execute()) {
    // Get user ID
    $userId = $stmt->insert_id;
    
    // Set session
    $_SESSION['user_id'] = $userId;
    
    // Get user data
    $user = [
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'created_at' => $currentDateTime
    ];
    
    // Send response
    jsonResponse(['success' => true, 'message' => 'Registration successful', 'user' => $user]);
} else {
    jsonResponse(['success' => false, 'message' => 'Registration failed: ' . $stmt->error], 500);
}
