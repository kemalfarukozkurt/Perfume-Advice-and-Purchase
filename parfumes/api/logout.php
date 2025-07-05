<?php
/**
 * KAANI Perfume - Logout API
 * 
 * Endpoint for user logout
 */

// Include helper functions
require_once '../functions.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Accept both GET and POST methods for logout
// This ensures compatibility with both direct links and JavaScript fetch calls

// Remove session
session_unset();
session_destroy();

// Remove remember me cookie if exists
if (isset($_COOKIE['remember_token'])) {
    // Delete token from database
    global $conn;
    $token = $_COOKIE['remember_token'];
    $query = "DELETE FROM remember_tokens WHERE token = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $token);
    $stmt->execute();
    
    // Delete cookie
    setcookie('remember_token', '', time() - 3600, '/', '', false, true);
}

// Send response
jsonResponse(['success' => true, 'message' => 'Logout successful']);
