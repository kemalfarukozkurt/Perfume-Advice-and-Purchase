<?php
/**
 * KAANI Perfume - Get Popular Perfumes API
 * 
 * Endpoint to get popular perfumes
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

// Get parameters
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 8;
$type = isset($_GET['type']) ? $_GET['type'] : 'most_liked';

// Validate limit
if ($limit < 1 || $limit > 20) {
    jsonResponse(['success' => false, 'message' => 'Limit must be between 1 and 20'], 400);
}

// Validate type
$validTypes = ['most_liked', 'best_selling', 'most_reviewed'];
if (!in_array($type, $validTypes)) {
    jsonResponse(['success' => false, 'message' => 'Invalid type. Valid types are: ' . implode(', ', $validTypes)], 400);
}

// Get popular perfumes
$popularPerfumes = getPopularPerfumes($limit, $type);

// Send response
jsonResponse(['success' => true, 'type' => $type, 'perfumes' => $popularPerfumes]);
