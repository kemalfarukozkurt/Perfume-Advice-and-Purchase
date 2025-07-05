<?php
/**
 * KAANI Perfume - Add to Cart API
 * This API endpoint adds a perfume to the cart
 */

// Include required files
require_once '../config.php';
require_once '../functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Start session
session_start();

// Initialize cart if not exists
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

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
$quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;
$size = isset($data['size']) ? $data['size'] : '50ml';

// Validate quantity
if ($quantity < 1) {
    $quantity = 1;
}

// Get perfume details from database
$conn = connectDB();
$perfume = getPerfumeById($conn, $perfume_id);

if (!$perfume) {
    echo json_encode([
        'success' => false,
        'message' => 'Parfüm bulunamadı.'
    ]);
    $conn->close();
    exit;
}

// Check if perfume already exists in cart
$found = false;
foreach ($_SESSION['cart'] as &$item) {
    if ($item['perfume_id'] === $perfume_id && $item['size'] === $size) {
        // Update quantity
        $item['quantity'] += $quantity;
        $found = true;
        break;
    }
}

// If not found, add new item to cart
if (!$found) {
    // Get price based on size
    $price = ($size === '30ml') ? $perfume['price_of_30ml'] : $perfume['price_of_50ml'];
    
    $_SESSION['cart'][] = [
        'perfume_id' => $perfume_id,
        'name' => $perfume['name'],
        'brand' => $perfume['brand'],
        'image_url' => $perfume['image_url'],
        'price' => $price,
        'size' => $size,
        'quantity' => $quantity
    ];
}

// Calculate cart count
$cart_count = 0;
foreach ($_SESSION['cart'] as $item) {
    $cart_count += $item['quantity'];
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Ürün sepete eklendi.',
    'cart_count' => $cart_count
]);

// Close connection
$conn->close();
