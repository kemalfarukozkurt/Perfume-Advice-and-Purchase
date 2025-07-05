<?php
/**
 * KAANI Perfume - Get Perfumes API
 * 
 * Endpoint to get perfumes with optional filtering
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

// Get query parameters
$gender = isset($_GET['gender']) ? $_GET['gender'] : 'all';
$season = isset($_GET['season']) ? $_GET['season'] : 'all';
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'name-asc';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 12;

// Validate parameters
$validGenders = ['all', 'male', 'female', 'unisex'];
$validSeasons = ['all', 'summer', 'winter', 'spring', 'autumn'];
$validSorts = ['name-asc', 'name-desc', 'price-asc', 'price-desc'];

if (!in_array($gender, $validGenders)) {
    jsonResponse(['success' => false, 'message' => 'Invalid gender parameter'], 400);
}

if (!in_array($season, $validSeasons)) {
    jsonResponse(['success' => false, 'message' => 'Invalid season parameter'], 400);
}

if (!in_array($sort, $validSorts)) {
    jsonResponse(['success' => false, 'message' => 'Invalid sort parameter'], 400);
}

if ($page < 1) {
    jsonResponse(['success' => false, 'message' => 'Page must be greater than 0'], 400);
}

if ($perPage < 1 || $perPage > 50) {
    jsonResponse(['success' => false, 'message' => 'Per page must be between 1 and 50'], 400);
}

// Get perfumes
$result = getPerfumes($gender, $season, $sort, $page, $perPage);

// Prepare response
$response = [
    'success' => true,
    'perfumes' => $result['perfumes'],
    'pagination' => $result['pagination'],
    'has_more' => $result['pagination']['has_more']
];

// Send response
jsonResponse($response);
