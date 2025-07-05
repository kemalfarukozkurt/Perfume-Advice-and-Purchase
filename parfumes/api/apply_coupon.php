<?php
/**
 * KAANI Perfume - Apply Coupon API
 * This API endpoint applies a coupon code to the cart
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
        'success' => false,
        'message' => 'Sepetiniz boş. Kupon kodu uygulamak için sepetinizde ürün olmalıdır.'
    ]);
    exit;
}

// Get JSON data from request
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['coupon_code']) || empty($data['coupon_code'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Kupon kodu gereklidir.'
    ]);
    exit;
}

$coupon_code = strtoupper(trim($data['coupon_code']));

// Connect to database
$conn = connectDB();

// Check if coupon exists and is valid
$stmt = $conn->prepare("SELECT * FROM coupons WHERE code = ? AND active = 1 AND (expiry_date IS NULL OR expiry_date >= CURDATE())");
$stmt->bind_param("s", $coupon_code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Geçersiz veya süresi dolmuş kupon kodu.'
    ]);
    $conn->close();
    exit;
}

$coupon = $result->fetch_assoc();

// Calculate cart subtotal
$subtotal = 0;
foreach ($_SESSION['cart'] as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

// Check minimum order amount
if ($coupon['min_order_amount'] > 0 && $subtotal < $coupon['min_order_amount']) {
    echo json_encode([
        'success' => false,
        'message' => "Bu kupon kodu en az {$coupon['min_order_amount']} TL tutarındaki siparişlerde geçerlidir."
    ]);
    $conn->close();
    exit;
}

// Calculate discount amount
$discount = 0;
if ($coupon['discount_type'] === 'percentage') {
    $discount = $subtotal * ($coupon['discount_value'] / 100);
    if ($coupon['max_discount'] > 0 && $discount > $coupon['max_discount']) {
        $discount = $coupon['max_discount'];
    }
} else {
    $discount = $coupon['discount_value'];
    if ($discount > $subtotal) {
        $discount = $subtotal;
    }
}

// Save coupon to session
$_SESSION['coupon'] = [
    'code' => $coupon_code,
    'discount' => $discount,
    'discount_type' => $coupon['discount_type'],
    'discount_value' => $coupon['discount_value']
];

// Calculate cart summary
$cart_summary = calculateCartSummary($_SESSION['cart'], $discount);

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Kupon kodu başarıyla uygulandı.',
    'cart_summary' => $cart_summary
]);

// Close connection
$conn->close();

/**
 * Calculate cart summary
 * @param array $cart Cart items
 * @param float $discount Discount amount
 * @return array Cart summary
 */
function calculateCartSummary($cart, $discount = 0) {
    $subtotal = 0;
    $shipping_fee = 0;
    
    // Calculate subtotal
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    // Calculate shipping fee (free for orders over 500 TL)
    if ($subtotal > 0 && $subtotal < 500) {
        $shipping_fee = 25;
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
