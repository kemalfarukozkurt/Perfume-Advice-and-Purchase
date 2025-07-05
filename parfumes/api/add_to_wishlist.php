<?php
/**
 * KAANI Perfume - Add to Wishlist API
 * This API endpoint adds a perfume to the user's wishlist
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

// Check if perfume exists
$stmt = $conn->prepare("SELECT id FROM perfumes WHERE id = ?");
$stmt->bind_param("s", $perfume_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Parfüm bulunamadı.'
    ]);
    $conn->close();
    exit;
}

// Check if perfume is already in wishlist
$stmt = $conn->prepare("SELECT id FROM wishlist WHERE user_id = ? AND perfume_id = ?");
$stmt->bind_param("is", $user_id, $perfume_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        'success' => true,
        'message' => 'Bu parfüm zaten istek listenizde bulunuyor.'
    ]);
    $conn->close();
    exit;
}

// Add perfume to wishlist
$stmt = $conn->prepare("INSERT INTO wishlist (user_id, perfume_id, created_at) VALUES (?, ?, NOW())");
$stmt->bind_param("is", $user_id, $perfume_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        'success' => true,
        'message' => 'Parfüm istek listenize eklendi.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Parfüm istek listenize eklenirken bir hata oluştu.'
    ]);
}

// Close connection
$conn->close();
