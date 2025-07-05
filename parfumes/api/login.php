<?php
/**
 * KAANI Perfume - Login API
 * 
 * Endpoint for user login
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
if (!$data || !isset($data['email']) || !isset($data['password'])) {
    jsonResponse(['success' => false, 'message' => 'Email and password are required'], 400);
}

// Sanitize inputs
$email = sanitizeInput($data['email']);
$password = $data['password']; // Will be verified, no need to sanitize
$rememberMe = isset($data['remember_me']) ? (bool)$data['remember_me'] : false;

// Get user from database
global $conn;
$query = "SELECT id, name, email, password, created_at FROM users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        
        // Set remember me cookie if requested
        if ($rememberMe) {
            $token = bin2hex(random_bytes(32));
            $expiry = time() + (30 * 24 * 60 * 60); // 30 days
            
            // Store token in database
            $query = "INSERT INTO remember_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($query);
            $expiryDate = date('Y-m-d H:i:s', $expiry);
            $stmt->bind_param('iss', $user['id'], $token, $expiryDate);
            $stmt->execute();
            
            // Set cookie
            setcookie('remember_token', $token, $expiry, '/', '', false, true);
        }
        
        // Remove password from user data
        unset($user['password']);
        
        // Send response
        jsonResponse(['success' => true, 'message' => 'Login successful', 'user' => $user]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Invalid email or password'], 401);
    }
} else {
    jsonResponse(['success' => false, 'message' => 'Invalid email or password'], 401);
}
