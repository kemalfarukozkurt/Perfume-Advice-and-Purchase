<?php
/**
 * KAANI Perfume - Add Review API
 * 
 * Endpoint to add a review for a perfume
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
if (!$data || !isset($data['perfume_id']) || !isset($data['rating']) || !isset($data['comment'])) {
    jsonResponse(['success' => false, 'message' => 'Perfume ID, rating, and comment are required'], 400);
}

// Sanitize inputs
$perfumeId = sanitizeInput($data['perfume_id']);
$rating = (int)$data['rating'];
$comment = sanitizeInput($data['comment']);
$name = isset($data['name']) ? sanitizeInput($data['name']) : '';

// Define a list of profane words
$profaneWords = [
    // English
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'piss', 'cunt', 'cock', 'fag', 'slut', 'whore', 'douche', 'bollocks', 'bugger', 'crap', 'damn', 'hell', 'motherfucker', 'prick', 'twat', 'wanker', 'arse', 'bullshit', 'jackass', 'jerkoff', 'pussy', 'shithead', 'son of a bitch', 'tosser', 'twit', 'wank', 'arsehole', 'cum', 'dildo', 'fucker', 'retard', 'shitface', 'skank', 'tit', 'turd', 'jerk', 'loser', 'moron', 'idiot', 'dumb', 'stupid', 'lame', 'douchebag', 'dipshit', 'dumbass', 'airhead', 'blockhead', 'bonehead', 'butthead', 'clown', 'cretin', 'dimwit', 'dope', 'dork', 'dunce', 'fool', 'goof', 'goofball', 'halfwit', 'meathead', 'nincompoop', 'nitwit', 'numbskull', 'nutcase', 'nutjob', 'simpleton', 'tool', 'twit', 'weirdo', 'wimp', 'wuss', 'jerk', 'trash', 'garbage', 'scum', 'scumbag', 'sleazebag', 'slob', 'sucker', 'poser', 'poser', 'wannabe', 'tryhard',
    // Turkish
    'amk', 'aq', 'orospu', 'piç', 'sik', 'siktir', 'yarrak', 'göt', 'götveren', 'ananı', 'anan', 'amına', 'amcık', 'amına koyayım', 'amına koyim', 'amına kodumun', 'oç', 'sikik', 'sikerim', 'sikeyim', 'yavşak', 'pezevenk', 'salak', 'gerizekalı', 'aptal', 'mal', 'dangalak', 'şerefsiz', 'şırfıntı', 'kaltak', 'kahpe', 'gavat', 'ibne', 'top', 'puşt', 'dingil', 'düdük', 'bok', 'boktan', 'boklu', 'bokum', 'sıç', 'sıçmak', 'sıçtım', 'sıçayım', 'godoş', 'döl', 'döl yatağı'
]; // List can be further expanded as needed


// Function to check for profanity
function containsProfanity($text, $profaneWords) {
    foreach ($profaneWords as $word) {
        if (stripos($text, $word) !== false) {
            return true;
        }
    }
    return false;
}

// Validate rating
if ($rating < 1 || $rating > 5) {
    jsonResponse(['success' => false, 'message' => 'Rating must be between 1 and 5'], 400);
}

// Validate comment
if (strlen($comment) < 5) {
    jsonResponse(['success' => false, 'message' => 'The comment must be at least 5 characters.'], 400);
}

// Check for gibberish/random comment (e.g. repeated chars, not a sentence)
function isGibberish($text) {
    // If too many repeated characters (e.g. "aaaaaaa", "dhdhdhdh")
    if (preg_match('/(.)\1{4,}/', $text)) {
        return true;
    }
    // If mostly consonants or vowels (e.g. "sdfghjkl", "aeiouu")
    if (preg_match('/[bcdfghjklmnpqrstvwxyz]{5,}/i', $text) || preg_match('/[aeiou]{5,}/i', $text)) {
        return true;
    }
    // If no spaces and too long (e.g. "dhdhdhdhdhdhdh")
    if (strlen($text) > 10 && strpos($text, ' ') === false) {
        return true;
    }
    // If not ending with a period, exclamation, or question mark and less than 15 chars
    if (strlen($text) < 15 && !preg_match('/[.!?]$/', trim($text))) {
        return true;
    }
    return false;
}

if (isGibberish($comment)) {
    jsonResponse(['success' => false, 'message' => 'Please write a meaningful sentence.'], 400);
}

// Check for profanity in the comment
if (containsProfanity($comment, $profaneWords)) {
    jsonResponse(['success' => false, 'message' => 'Comment contains inappropriate language'], 400);
}

// Check if user is logged in
$userId = null;
if (isLoggedIn()) {
    $user = getCurrentUser();
    $userId = $user['id'];
    $name = $user['name']; // Use logged in user's name
} else {
    // If not logged in, name is required
    if (empty($name)) {
        jsonResponse(['success' => false, 'message' => 'Name is required for guest reviews'], 400);
    }
}

// Create reviews table if it doesn't exist
global $conn;
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

// Insert review into database
$query = "INSERT INTO reviews (perfume_id, user_id, name, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($query);
$currentDateTime = getCurrentDateTime();
$stmt->bind_param('sisiss', $perfumeId, $userId, $name, $rating, $comment, $currentDateTime);

if ($stmt->execute()) {
    // Get the new review ID
    $reviewId = $stmt->insert_id;
    
    // Get the new review
    $query = "SELECT * FROM reviews WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $reviewId);
    $stmt->execute();
    $result = $stmt->get_result();
    $review = $result->fetch_assoc();
    
    // Send response
    jsonResponse(['success' => true, 'message' => 'Review added successfully', 'review' => $review]);
} else {
    jsonResponse(['success' => false, 'message' => 'Failed to add review: ' . $stmt->error], 500);
}
