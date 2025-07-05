<?php
/**
 * KAANI Perfume - Get Seasonal Perfumes API
 * 
 * Endpoint to get perfumes for a specific season with pagination support
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

// Get season, offset and limit parameters
$season = isset($_GET['season']) ? $_GET['season'] : 'summer';
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 8;

// Validate season
$validSeasons = ['summer', 'winter', 'spring', 'autumn'];
if (!in_array($season, $validSeasons)) {
    jsonResponse(['success' => false, 'message' => 'Invalid season parameter'], 400);
}

// Validate offset
if ($offset < 0) {
    jsonResponse(['success' => false, 'message' => 'Offset must be a non-negative integer'], 400);
}

// Validate limit
if ($limit < 1 || $limit > 20) {
    jsonResponse(['success' => false, 'message' => 'Limit must be between 1 and 20'], 400);
}

// Get seasonal perfumes with pagination
$result = getSeasonalPerfumesWithPagination($season, $offset, $limit);

// Send response
jsonResponse([
    'success' => true, 
    'perfumes' => $result['perfumes'],
    'total' => $result['total']
]);
