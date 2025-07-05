<?php
/**
 * KAANI Perfume - Remove from Wishlist API
 * This API endpoint removes a perfume from the user's wishlist
 */

// Include required files
require_once '../config.php';
require_once '../functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Oturum açmanız gerekiyor.'
    ]);
    exit;
}

// Get user ID from session
$user_id = $_SESSION['user_id'];

// Get JSON data from request
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['perfume_id']) || empty($data['perfume_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Parfüm ID gereklidir.'
    ]);
    exit;
}

$perfume_id = $data['perfume_id'];

// Connect to database
$conn = connectDB();

// Remove perfume from wishlist
$stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ? AND perfume_id = ?");
$stmt->bind_param("is", $user_id, $perfume_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        'success' => true,
        'message' => 'Parfüm istek listenizden kaldırıldı.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Parfüm istek listenizden kaldırılırken bir hata oluştu veya parfüm istek listenizde bulunmuyor.'
    ]);
}

// Close connection
$conn->close();
