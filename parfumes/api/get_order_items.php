<?php
/**
 * KAANI Perfume - Get Order Items API
 * This API endpoint retrieves items for a specific order
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

// Validate required parameters
if (!isset($_GET['order_id']) || empty($_GET['order_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Sipariş ID gereklidir.'
    ]);
    exit;
}

$order_id = $_GET['order_id'];

// Connect to database
$conn = connectDB();

// Check if order belongs to user
$stmt = $conn->prepare("SELECT id FROM orders WHERE id = ? AND user_id = ?");
$stmt->bind_param("si", $order_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Sipariş bulunamadı veya bu siparişi görüntüleme yetkiniz yok.'
    ]);
    $conn->close();
    exit;
}

// Get order items
$stmt = $conn->prepare("
    SELECT oi.*, p.name, p.brand, p.image_url 
    FROM order_items oi
    JOIN perfumes p ON oi.perfume_id = p.id
    WHERE oi.order_id = ?
");
$stmt->bind_param("s", $order_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = [
        'id' => $row['id'],
        'perfume_id' => $row['perfume_id'],
        'name' => $row['name'],
        'brand' => $row['brand'],
        'image_url' => $row['image_url'],
        'price' => $row['price'],
        'quantity' => $row['quantity'],
        'size' => $row['size']
    ];
}

// Return order items
echo json_encode([
    'success' => true,
    'items' => $items
]);

// Close connection
$conn->close();
