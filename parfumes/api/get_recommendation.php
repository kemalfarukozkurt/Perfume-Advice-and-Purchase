<?php
/**
 * KAANI Perfume - Get Recommendation API
 * 
 * Endpoint to get perfume recommendations based on user preferences
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
if (!$data || !isset($data['message'])) {
    jsonResponse(['success' => false, 'message' => 'Message is required'], 400);
}

// Get chat history if provided
$history = isset($data['history']) ? $data['history'] : [];

// Get recommendations
$recommendations = getPerfumeRecommendations($data['message'], $history);

// Send response
jsonResponse([
    'success' => true,
    'message' => $recommendations['message'],
    'perfumes' => $recommendations['perfumes']
]);
