<?php
/**
 * KAANI Perfume - Forgot Password API
 * 
 * Endpoint to send password reset email
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
if (!$data || !isset($data['email'])) {
    jsonResponse(['success' => false, 'message' => 'Email is required'], 400);
}

// Sanitize input
$email = sanitizeInput($data['email']);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Invalid email format'], 400);
}

// Check if email exists
global $conn;
$query = "SELECT id, name FROM users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Generate reset token
    $token = bin2hex(random_bytes(32));
    $expiry = time() + (24 * 60 * 60); // 24 hours
    $expiryDate = date('Y-m-d H:i:s', $expiry);
    
    // Store token in database
    $query = "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('iss', $user['id'], $token, $expiryDate);
    $stmt->execute();
    
    // Send email (in a real application)
    // For now, we'll just return the token for testing
    $resetLink = SITE_URL . '/reset-password.html?token=' . $token;
    
    // In a real application, you would send an email here
    // For development, we'll just return the reset link
    jsonResponse([
        'success' => true, 
        'message' => 'Password reset instructions sent to your email',
        'dev_reset_link' => $resetLink // Remove this in production
    ]);
} else {
    // Don't reveal that the email doesn't exist for security reasons
    jsonResponse(['success' => true, 'message' => 'If your email exists in our system, you will receive password reset instructions']);
}
