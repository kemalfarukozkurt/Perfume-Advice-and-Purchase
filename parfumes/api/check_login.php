<?php
/**
 * KAANI Perfume - Check Login API
 * 
 * Endpoint to check if user is logged in
 */

// Include helper functions
require_once '../functions.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Only GET method is allowed'], 405);
}

// Check if user is logged in
if (isLoggedIn()) {
    // Get user data
    $user = getCurrentUser();
    
    // Send response
    jsonResponse(['success' => true, 'logged_in' => true, 'user' => $user]);
} else {
    // Check for remember me cookie
    if (isset($_COOKIE['remember_token'])) {
        $token = $_COOKIE['remember_token'];
        
        // Get user from database
        global $conn;
        $query = "SELECT u.id, u.name, u.email, u.created_at 
                  FROM users u 
                  JOIN remember_tokens rt ON u.id = rt.user_id 
                  WHERE rt.token = ? AND rt.expires_at > NOW()";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('s', $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Set session
            $_SESSION['user_id'] = $user['id'];
            
            // Send response
            jsonResponse(['success' => true, 'logged_in' => true, 'user' => $user]);
        } else {
            // Invalid or expired token
            setcookie('remember_token', '', time() - 3600, '/', '', false, true);
            jsonResponse(['success' => true, 'logged_in' => false]);
        }
    } else {
        jsonResponse(['success' => true, 'logged_in' => false]);
    }
}
