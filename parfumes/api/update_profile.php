<?php
/**
 * KAANI Perfume - Update Profile API
 * This API endpoint updates user profile information
 */

// Include required files
require_once '../config.php';
require_once '../functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Check if user is logged in
session_start();
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
if (!isset($data['name']) || empty($data['name'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Ad soyad alanı boş bırakılamaz.'
    ]);
    exit;
}

if (!isset($data['current_password']) || empty($data['current_password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Mevcut şifre alanı boş bırakılamaz.'
    ]);
    exit;
}

// Verify current password
$conn = connectDB();
$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Kullanıcı bulunamadı.'
    ]);
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($data['current_password'], $user['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Mevcut şifre yanlış.'
    ]);
    $conn->close();
    exit;
}

// Prepare update data
$name = $data['name'];
$phone = isset($data['phone']) ? $data['phone'] : '';
$birth_date = isset($data['birth_date']) ? $data['birth_date'] : null;
$address = isset($data['address']) ? $data['address'] : '';

// Start transaction
$conn->begin_transaction();

try {
    // Update user information
    $stmt = $conn->prepare("UPDATE users SET name = ?, phone = ?, birth_date = ?, address = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $name, $phone, $birth_date, $address, $user_id);
    $stmt->execute();
    
    // Check if new password is provided
    if (isset($data['new_password']) && !empty($data['new_password'])) {
        // Hash new password
        $new_password_hash = password_hash($data['new_password'], PASSWORD_DEFAULT);
        
        // Update password
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param("si", $new_password_hash, $user_id);
        $stmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Update session data
    $_SESSION['user_name'] = $name;
    
    echo json_encode([
        'success' => true,
        'message' => 'Profil bilgileriniz başarıyla güncellendi.'
    ]);
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    echo json_encode([
        'success' => false,
        'message' => 'Profil güncellenirken bir hata oluştu: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
