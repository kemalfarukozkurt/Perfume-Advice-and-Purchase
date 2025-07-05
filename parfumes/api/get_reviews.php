<?php
/**
 * KAANI Perfume - Get Reviews API
 * 
 * Endpoint to get reviews for a perfume
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
$perfumeId = isset($_GET['perfume_id']) ? $_GET['perfume_id'] : null;

// Validate perfume ID
if (!$perfumeId) {
    jsonResponse(['success' => false, 'message' => 'Perfume ID is required'], 400);
}

// Get page and per_page parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 5;

// Validate pagination parameters
if ($page < 1) {
    jsonResponse(['success' => false, 'message' => 'Page must be greater than 0'], 400);
}

if ($perPage < 1 || $perPage > 20) {
    jsonResponse(['success' => false, 'message' => 'Per page must be between 1 and 20'], 400);
}

// Get reviews from database
global $conn;

// Create reviews table if it doesn't exist
$query = "CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perfume_id VARCHAR(255) NOT NULL,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME NOT NULL
)";
$conn->query($query);

// Count total reviews
$query = "SELECT COUNT(*) as total FROM reviews WHERE perfume_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $perfumeId);
$stmt->execute();
$result = $stmt->get_result();
$totalCount = $result->fetch_assoc()['total'];

// Calculate pagination
$totalPages = ceil($totalCount / $perPage);
$page = max(1, min($page, $totalPages));
$offset = ($page - 1) * $perPage;

// Get reviews
$query = "SELECT r.*, u.name as user_name 
          FROM reviews r 
          LEFT JOIN users u ON r.user_id = u.id 
          WHERE r.perfume_id = ? 
          ORDER BY r.created_at DESC 
          LIMIT ?, ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('sii', $perfumeId, $offset, $perPage);
$stmt->execute();
$result = $stmt->get_result();

// Prepare reviews
$reviews = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Use user_name if available, otherwise use the name stored with the review
        $row['name'] = $row['user_name'] ? $row['user_name'] : $row['name'];
        unset($row['user_name']);
        
        $reviews[] = $row;
    }
}

// Calculate average rating
$query = "SELECT AVG(rating) as avg_rating FROM reviews WHERE perfume_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $perfumeId);
$stmt->execute();
$result = $stmt->get_result();
$avgRating = $result->fetch_assoc()['avg_rating'];

// Prepare response
$response = [
    'success' => true,
    'reviews' => $reviews,
    'avg_rating' => $avgRating ? round($avgRating, 1) : 0,
    'total_reviews' => $totalCount,
    'pagination' => [
        'total' => $totalCount,
        'per_page' => $perPage,
        'current_page' => $page,
        'total_pages' => $totalPages,
        'has_more' => $page < $totalPages
    ]
];

// Send response
jsonResponse($response);
