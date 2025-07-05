<?php
/**
 * KAANI Perfume - Get Similar Perfumes API
 * 
 * Endpoint to get similar perfumes based on a perfume ID
 */

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
$id = isset($_GET['id']) ? $_GET['id'] : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 4;

// Validate ID
if (!$id) {
    jsonResponse(['success' => false, 'message' => 'Perfume ID is required'], 400);
}

// Validate limit
if ($limit < 1 || $limit > 12) {
    jsonResponse(['success' => false, 'message' => 'Limit must be between 1 and 12'], 400);
}

// Get similar perfumes
$similarPerfumes = getSimilarPerfumes($id, $limit);

// Send response
jsonResponse(['success' => true, 'perfumes' => $similarPerfumes]);
