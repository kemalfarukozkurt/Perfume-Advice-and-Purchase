<?php
/**
 * KAANI Perfume - Remove from Cart API
 * This API endpoint removes a perfume from the cart
 */

// Include required files
require_once '../config.php';
require_once '../functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Start session
session_start();

// Check if cart exists
if (!isset($_SESSION['cart'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Sepetiniz boş.'
    ]);
    exit;
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

// Find and remove item from cart
$found = false;
foreach ($_SESSION['cart'] as $key => $item) {
    if ($item['perfume_id'] === $perfume_id) {
        unset($_SESSION['cart'][$key]);
        $found = true;
        break;
    }
}

// Reindex array
$_SESSION['cart'] = array_values($_SESSION['cart']);

// If item not found
if (!$found) {
    echo json_encode([
        'success' => false,
        'message' => 'Ürün sepetinizde bulunamadı.'
    ]);
    exit;
}

// Calculate cart summary
$cart_summary = calculateCartSummary($_SESSION['cart']);

// Calculate cart count
$cart_count = 0;
foreach ($_SESSION['cart'] as $item) {
    $cart_count += $item['quantity'];
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Ürün sepetten kaldırıldı.',
    'cart_summary' => $cart_summary,
    'cart_count' => $cart_count
]);

/**
 * Calculate cart summary
 * @param array $cart Cart items
 * @return array Cart summary
 */
function calculateCartSummary($cart) {
    $subtotal = 0;
    $shipping_fee = 0;
    $discount = 0;
    
    // Calculate subtotal
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    // Calculate shipping fee (free for orders over 500 TL)
    if ($subtotal > 0 && $subtotal < 500) {
        $shipping_fee = 25;
    }
    
    // Apply discount if coupon exists in session
    if (isset($_SESSION['coupon']) && isset($_SESSION['coupon']['discount'])) {
        $discount = $_SESSION['coupon']['discount'];
    }
    
    // Calculate total
    $total = $subtotal + $shipping_fee - $discount;
    
    return [
        'subtotal' => $subtotal,
        'shipping_fee' => $shipping_fee,
        'discount' => $discount,
        'total' => $total
    ];
}
