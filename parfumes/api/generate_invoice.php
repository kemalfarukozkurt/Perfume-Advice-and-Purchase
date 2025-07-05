<?php
/**
 * KAANI Perfume - Generate Invoice API
 * This API endpoint generates a PDF invoice for a specific order
 */

// Include required files
require_once '../config.php';
require_once '../functions.php';

// Check if TCPDF is installed
if (!class_exists('TCPDF')) {
    // If not installed, use a fallback method
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'TCPDF kütüphanesi yüklü değil. Fatura oluşturulamadı.'
    ]);
    exit;
}

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
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
    header('Content-Type: application/json');
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
$stmt = $conn->prepare("
    SELECT o.*, u.name as user_name, u.email, u.phone, u.address
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ? AND o.user_id = ?
");
$stmt->bind_param("si", $order_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Sipariş bulunamadı veya bu siparişi görüntüleme yetkiniz yok.'
    ]);
    $conn->close();
    exit;
}

$order = $result->fetch_assoc();

// Get order items
$stmt = $conn->prepare("
    SELECT oi.*, p.name, p.brand
    FROM order_items oi
    JOIN perfumes p ON oi.perfume_id = p.id
    WHERE oi.order_id = ?
");
$stmt->bind_param("s", $order_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

// Close database connection
$conn->close();

// Create new PDF document
$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

// Set document information
$pdf->SetCreator('KAANI Perfume');
$pdf->SetAuthor('KAANI Perfume');
$pdf->SetTitle('Fatura #' . $order_id);
$pdf->SetSubject('KAANI Perfume Fatura');
$pdf->SetKeywords('KAANI, Perfume, Fatura, Sipariş');

// Set default header data
$pdf->SetHeaderData('', 0, 'KAANI Perfume', 'Fatura #' . $order_id);

// Set header and footer fonts
$pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
$pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));

// Set default monospaced font
$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

// Set margins
$pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
$pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
$pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

// Set auto page breaks
$pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

// Set image scale factor
$pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

// Add a page
$pdf->AddPage();

// Set font
$pdf->SetFont('dejavusans', '', 10);

// Format order date
$orderDate = date('d.m.Y', strtotime($order['created_at']));

// Get payment method text
$paymentMethod = '';
switch ($order['payment_method']) {
    case 'credit_card':
        $paymentMethod = 'Kredi Kartı';
        break;
    case 'bank_transfer':
        $paymentMethod = 'Banka Havalesi';
        break;
    case 'cash_on_delivery':
        $paymentMethod = 'Kapıda Ödeme';
        break;
    default:
        $paymentMethod = $order['payment_method'];
}

// Get status text
$statusText = '';
switch ($order['status']) {
    case 'pending':
        $statusText = 'Beklemede';
        break;
    case 'processing':
        $statusText = 'İşleniyor';
        break;
    case 'shipped':
        $statusText = 'Kargoya Verildi';
        break;
    case 'delivered':
        $statusText = 'Teslim Edildi';
        break;
    case 'cancelled':
        $statusText = 'İptal Edildi';
        break;
    default:
        $statusText = $order['status'];
}

// Write invoice content
$html = '
<h1 style="text-align:center;">KAANI Perfume</h1>
<h2 style="text-align:center;">Fatura</h2>

<table cellspacing="0" cellpadding="5" border="0">
    <tr>
        <td width="50%"><strong>Fatura No:</strong> ' . $order_id . '</td>
        <td width="50%"><strong>Tarih:</strong> ' . $orderDate . '</td>
    </tr>
    <tr>
        <td><strong>Ödeme Yöntemi:</strong> ' . $paymentMethod . '</td>
        <td><strong>Durum:</strong> ' . $statusText . '</td>
    </tr>
</table>

<h3>Müşteri Bilgileri</h3>
<table cellspacing="0" cellpadding="5" border="0">
    <tr>
        <td width="50%"><strong>Ad Soyad:</strong> ' . $order['user_name'] . '</td>
        <td width="50%"><strong>E-posta:</strong> ' . $order['email'] . '</td>
    </tr>
    <tr>
        <td><strong>Telefon:</strong> ' . $order['phone'] . '</td>
        <td></td>
    </tr>
    <tr>
        <td colspan="2"><strong>Adres:</strong> ' . $order['address'] . '</td>
    </tr>
</table>

<h3>Sipariş Detayları</h3>
<table cellspacing="0" cellpadding="5" border="1">
    <tr style="background-color:#f2f2f2;">
        <th width="5%">#</th>
        <th width="45%">Ürün</th>
        <th width="10%">Boyut</th>
        <th width="15%">Fiyat</th>
        <th width="10%">Adet</th>
        <th width="15%">Toplam</th>
    </tr>
';

$i = 1;
$subtotal = 0;

foreach ($items as $item) {
    $total = $item['price'] * $item['quantity'];
    $subtotal += $total;
    
    $html .= '
    <tr>
        <td>' . $i . '</td>
        <td>' . $item['name'] . ' (' . $item['brand'] . ')</td>
        <td>' . $item['size'] . '</td>
        <td align="right">' . number_format($item['price'], 2, ',', '.') . ' TL</td>
        <td align="center">' . $item['quantity'] . '</td>
        <td align="right">' . number_format($total, 2, ',', '.') . ' TL</td>
    </tr>
    ';
    
    $i++;
}

$shipping = $order['shipping_fee'];
$discount = $order['discount'];
$total = $subtotal + $shipping - $discount;

$html .= '
    <tr>
        <td colspan="5" align="right"><strong>Ara Toplam:</strong></td>
        <td align="right">' . number_format($subtotal, 2, ',', '.') . ' TL</td>
    </tr>
    <tr>
        <td colspan="5" align="right"><strong>Kargo Ücreti:</strong></td>
        <td align="right">' . number_format($shipping, 2, ',', '.') . ' TL</td>
    </tr>
';

if ($discount > 0) {
    $html .= '
    <tr>
        <td colspan="5" align="right"><strong>İndirim:</strong></td>
        <td align="right">-' . number_format($discount, 2, ',', '.') . ' TL</td>
    </tr>
    ';
}

$html .= '
    <tr>
        <td colspan="5" align="right"><strong>Genel Toplam:</strong></td>
        <td align="right"><strong>' . number_format($total, 2, ',', '.') . ' TL</strong></td>
    </tr>
</table>

<p style="text-align:center; margin-top:30px;">Bu bir bilgisayar çıktısıdır, imza gerektirmez.</p>
<p style="text-align:center;">KAANI Perfume - Teşekkür Ederiz</p>
';

// Print HTML content
$pdf->writeHTML($html, true, false, true, false, '');

// Close and output PDF document
$pdf->Output('fatura-' . $order_id . '.pdf', 'I');
