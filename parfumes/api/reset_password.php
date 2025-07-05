<?php
/**
 * KAANI Perfume - Reset Password API
 * 
 * Endpoint to reset user password with token
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
if (!$data || !isset($data['token']) || !isset($data['password']) || !isset($data['confirm_password'])) {
    jsonResponse(['success' => false, 'message' => 'Token, password, and confirm password are required'], 400);
}

// Sanitize inputs
$token = sanitizeInput($data['token']);
$password = $data['password']; // Will be hashed, no need to sanitize
$confirmPassword = $data['confirm_password'];

// Validate passwords
if (strlen($password) < 6) {
    jsonResponse(['success' => false, 'message' => 'Password must be at least 6 characters'], 400);
}

if ($password !== $confirmPassword) {
    jsonResponse(['success' => false, 'message' => 'Passwords do not match'], 400);
}

// Verify token
global $conn;
$query = "SELECT pr.user_id FROM password_resets pr WHERE pr.token = ? AND pr.expires_at > NOW()";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $userId = $result->fetch_assoc()['user_id'];
    
    // Hash new password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Update user password
    $query = "UPDATE users SET password = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('si', $hashedPassword, $userId);
    
    if ($stmt->execute()) {
        // Delete used token
        $query = "DELETE FROM password_resets WHERE token = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('s', $token);
        $stmt->execute();
        
        // Send response
        jsonResponse(['success' => true, 'message' => 'Password has been reset successfully']);
    } else {
        jsonResponse(['success' => false, 'message' => 'Failed to reset password: ' . $stmt->error], 500);
    }
} else {
    jsonResponse(['success' => false, 'message' => 'Invalid or expired token'], 400);
}
