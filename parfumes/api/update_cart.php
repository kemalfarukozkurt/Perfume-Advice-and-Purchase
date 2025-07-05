<?php
/**
 * KAANI Perfume - Update Cart API
 * This API endpoint updates quantities of items in the cart
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
if (!isset($data['items']) || !is_array($data['items'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Geçersiz veri formatı.'
    ]);
    exit;
}

// Update cart items
foreach ($data['items'] as $updateItem) {
    if (!isset($updateItem['perfume_id']) || !isset($updateItem['quantity'])) {
        continue;
    }
    
    $perfume_id = $updateItem['perfume_id'];
    $quantity = intval($updateItem['quantity']);
    
    // Ensure quantity is at least 1
    if ($quantity < 1) {
        $quantity = 1;
    }
    
    // Update quantity in cart
    foreach ($_SESSION['cart'] as &$item) {
        if ($item['perfume_id'] === $perfume_id) {
            $item['quantity'] = $quantity;
            break;
        }
    }
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
    'message' => 'Sepetiniz güncellendi.',
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
