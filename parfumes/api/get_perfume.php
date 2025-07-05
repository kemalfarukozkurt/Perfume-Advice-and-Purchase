<?php
/**
 * KAANI Perfume - Get Perfume API
 * 
 * Endpoint to get a single perfume by ID
 */

// Hata raporlamaını devre dışı bırak (JSON yanıtı bozmaması için)
error_reporting(0);

try {
    // Include helper functions
    require_once '../functions.php';
    
    // Set headers
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    
    // Check if request method is GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        jsonResponse(['success' => false, 'message' => 'Only GET method is allowed'], 405);
    }
    
    // Get perfume ID from query parameter
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    
    // Validate ID
    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Perfume ID is required'], 400);
    }
    
    // ID formatını kontrol et (md5 hash 32 karakter olmalı)
    if (strlen($id) !== 32 || !ctype_xdigit($id)) {
        jsonResponse(['success' => false, 'message' => 'Invalid perfume ID format'], 400);
    }
    
    // Get perfume
    $perfume = getPerfumeById($id);
    
    // Check if perfume exists
    if (!$perfume) {
        jsonResponse(['success' => false, 'message' => 'Perfume not found'], 404);
    }
    
    // Send response
    jsonResponse(['success' => true, 'perfume' => $perfume]);
    
} catch (Exception $e) {
    // Hata durumunda log tut ve kullanıcıya genel bir hata mesajı gönder
    error_log('get_perfume.php error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'message' => 'An error occurred while processing your request'], 500);
}
