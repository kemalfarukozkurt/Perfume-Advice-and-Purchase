<?php
/**
 * KAANI Perfume - Clear Cart API
 * This API endpoint clears all items from the cart
 */

// Include required files
require_once '../config.php';
require_once '../functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Start session
session_start();

// Check if cart exists
if (!isset($_SESSION['cart']) || empty($_SESSION['cart'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Sepetiniz zaten boş.'
    ]);
    exit;
}

// Clear cart
$_SESSION['cart'] = [];

// Clear coupon if exists
if (isset($_SESSION['coupon'])) {
    unset($_SESSION['coupon']);
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Sepetiniz temizlendi.'
]);
