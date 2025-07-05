<?php
/**
 * KAANI Perfume - Get Perfumes by Aroma API
 * 
 * Endpoint to get perfumes filtered by aroma notes
 */

// Include helper functions
require_once '../functions.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate data
if (!$data || !isset($data['aromas']) || !is_array($data['aromas'])) {
    jsonResponse(['success' => false, 'message' => 'Aromas array is required'], 400);
}

// Get page and per_page parameters
$page = isset($data['page']) ? (int)$data['page'] : 1;
$perPage = isset($data['per_page']) ? (int)$data['per_page'] : 12;

// Validate pagination parameters
if ($page < 1) {
    jsonResponse(['success' => false, 'message' => 'Page must be greater than 0'], 400);
}

if ($perPage < 1 || $perPage > 50) {
    jsonResponse(['success' => false, 'message' => 'Per page must be between 1 and 50'], 400);
}

// Get perfumes by aroma
$result = getPerfumesByAroma($data['aromas'], $page, $perPage);

// Prepare response
$response = [
    'success' => true,
    'perfumes' => $result['perfumes'],
    'pagination' => $result['pagination'],
    'has_more' => $result['pagination']['has_more']
];

// Send response
jsonResponse($response);
