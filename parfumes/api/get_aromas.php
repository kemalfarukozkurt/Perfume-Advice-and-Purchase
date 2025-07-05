<?php
/**
 * KAANI Perfume - Get Aromas API
 * 
 * Endpoint to get all unique aroma notes
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

// Get aroma notes
$aromaNotes = getAromaNotes();

// Send response
jsonResponse(['success' => true, 'aromas' => $aromaNotes]);
