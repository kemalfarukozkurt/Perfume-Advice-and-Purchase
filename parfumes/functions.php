<?php
/**
 * KAANI Perfume - Helper Functions
 */

// Include database configuration
require_once 'config.php';

/**
 * Get all perfumes with optional filtering
 * 
 * @param string $gender Filter by gender (male, female, unisex, all)
 * @param string $season Filter by season (summer, winter, spring, autumn, all)
 * @param string $sort Sort order (name-asc, name-desc, price-asc, price-desc)
 * @param int $page Page number
 * @param int $perPage Items per page
 * @return array Array containing perfumes and pagination info
 */
function getPerfumes($gender = 'all', $season = 'all', $sort = 'name-asc', $page = 1, $perPage = 12) {
    global $conn;
    
    // Base query
    $query = "SELECT * FROM perfumes WHERE 1=1";
    
    // Add gender filter
    if ($gender !== 'all') {
        $query .= " AND gender = '" . sanitizeInput($gender) . "'";
    }
    
    // Add season filter
    if ($season !== 'all') {
        $query .= " AND season = '" . sanitizeInput($season) . "'";
    }
    
    // Add sorting
    switch ($sort) {
        case 'name-asc':
            $query .= " ORDER BY name ASC";
            break;
        case 'name-desc':
            $query .= " ORDER BY name DESC";
            break;
        case 'price-asc':
            $query .= " ORDER BY price_of_30ml ASC";
            break;
        case 'price-desc':
            $query .= " ORDER BY price_of_50ml DESC";
            break;
        default:
            $query .= " ORDER BY name ASC";
    }
    
    // Count total results for pagination
    $countQuery = str_replace("SELECT *", "SELECT COUNT(*) as total", $query);
    $countQuery = preg_replace("/ORDER BY.*/", "", $countQuery);
    $countResult = $conn->query($countQuery);
    $totalCount = $countResult->fetch_assoc()['total'];
    
    // Calculate pagination
    $totalPages = ceil($totalCount / $perPage);
    $page = max(1, min($page, $totalPages));
    $offset = ($page - 1) * $perPage;
    
    // Add pagination to query
    $query .= " LIMIT $offset, $perPage";
    
    // Execute query
    $result = $conn->query($query);
    
    // Prepare results
    $perfumes = [];
    if ($result && $result->num_rows > 0) {
       while ($row = $result->fetch_assoc()) {
           // Veritabanı sütun isimlerini kontrol et ve JavaScript için uyumlu hale getir
           $newRow = [];
           
           // ID alanını oluştur
           if (isset($row['id'])) {
               $newRow['id'] = $row['id'];
           } else if (isset($row['Name']) && isset($row['Brand'])) {
               $newRow['id'] = md5($row['Name'] . $row['Brand']);
           } else if (isset($row['name']) && isset($row['brand'])) {
               $newRow['id'] = md5($row['name'] . $row['brand']);
           }
           
           // Temel alanları kontrol et ve ekle
           $newRow['name'] = $row['name'] ?? $row['Name'] ?? '';
           $newRow['brand'] = $row['brand'] ?? $row['Brand'] ?? '';
           $newRow['description'] = $row['description'] ?? $row['Description'] ?? '';
           $newRow['notes'] = $row['notes'] ?? $row['Notes'] ?? '';
           $newRow['gender'] = $row['gender'] ?? $row['Gender'] ?? 'unisex';
           $newRow['season'] = $row['season'] ?? $row['Season'] ?? 'all';
           
           // Resim URL'si - Veritabanında 'Image URL' sütunu olduğu için ilk onu kontrol ediyoruz
           $newRow['image_url'] = $row['Image URL'] ?? $row['image_url'] ?? $row['Image'] ?? $row['image'] ?? 'https://via.placeholder.com/300x300?text=Parfum';
           
           // Fiyat bilgileri
           $newRow['price_of_30ml'] = $row['price_of_30ml'] ?? $row['Price_of_30ml'] ?? $row['price'] ?? $row['Price'] ?? 0;
           $newRow['price_of_50ml'] = $row['price_of_50ml'] ?? $row['Price_of_50ml'] ?? 0;
           
           // Değerlendirme bilgileri
           $newRow['rating'] = $row['rating'] ?? $row['Rating'] ?? 0;
           $newRow['rating_count'] = $row['rating_count'] ?? $row['Rating_count'] ?? 0;
           
           $perfumes[] = $newRow;
       }
    }
    
    // Return results with pagination info
    return [
        'perfumes' => $perfumes,
        'pagination' => [
            'total' => $totalCount,
            'per_page' => $perPage,
            'current_page' => $page,
            'total_pages' => $totalPages,
            'has_more' => $page < $totalPages
        ]
    ];
}

/**
 * Get a single perfume by ID
 * 
 * @param string $id Perfume ID (md5 hash of name and brand)
 * @return array|null Perfume data or null if not found
 */
function getPerfumeById($id) {
    global $conn;
    
    // Veritabanında id sütunu olmadığı için doğrudan tüm parfümleri çekip
    // md5 hash ile karşılaştırma yapacağız
    $query = "SELECT * FROM perfumes";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Her parfüm için md5 hash oluştur
            // Hem büyük harfli hem de küçük harfli sütun adlarını kontrol et
            $name = isset($row['name']) ? $row['name'] : (isset($row['Name']) ? $row['Name'] : '');
            $brand = isset($row['brand']) ? $row['brand'] : (isset($row['Brand']) ? $row['Brand'] : '');
            
            // ID oluştur
            $rowId = md5($name . $brand);
            
            // Hata ayıklama için log
            error_log("Comparing ID: {$rowId} with requested ID: {$id}");
            error_log("Name: {$name}, Brand: {$brand}");
            
            // Eğer hash eşleşirse, parfümü formatla ve döndür
            if ($rowId === $id) {
                return formatPerfumeData($row, $rowId);
            }
        }
    }
    
    // Hata ayıklama için log
    error_log("Perfume with ID {$id} not found in database");
    
    // Eğer parfüm bulunamazsa null döndür
    return null;
}

/**
 * Parfüm verilerini JavaScript için formatlar
 * 
 * @param array $row Veritabanından gelen ham veri
 * @param string $id Parfüm ID'si
 * @return array Formatlanmış parfüm verisi
 */
function formatPerfumeData($row, $id) {
    global $conn;
    
    // Giriş verilerini kontrol et
    if (!is_array($row) || empty($row)) {
        error_log('formatPerfumeData: Boş veya geçersiz veri dizisi');
        return [
            'id' => $id,
            'name' => 'Bilinmeyen Parfüm',
            'brand' => 'Bilinmeyen Marka',
            'description' => '',
            'notes' => '',
            'image_url' => 'https://via.placeholder.com/300x300?text=Parfum',
            'gender' => 'unisex',
            'season' => 'all',
            'price_of_30ml' => 0,
            'price_of_50ml' => 0,
            'rating' => 0,
            'rating_count' => 0
        ];
    }
    
    // Yeni bir dizi oluştur
    $perfume = [];
    
    // ID alanını ekle
    $perfume['id'] = $id;
    
    // Temel alanlar - büyük harf veya küçük harf alanları kontrol et
    $perfume['name'] = isset($row['Name']) ? $row['Name'] : (isset($row['name']) ? $row['name'] : 'Bilinmeyen Parfüm');
    $perfume['brand'] = isset($row['Brand']) ? $row['Brand'] : (isset($row['brand']) ? $row['brand'] : 'Bilinmeyen Marka');
    $perfume['description'] = isset($row['Description']) ? $row['Description'] : (isset($row['description']) ? $row['description'] : '');
    $perfume['notes'] = isset($row['Notes']) ? $row['Notes'] : (isset($row['notes']) ? $row['notes'] : '');
    
    // Resim URL'si - JavaScript image_url bekliyor
    if (isset($row['Image URL']) && !empty($row['Image URL'])) {
        $perfume['image_url'] = $row['Image URL'];
    } elseif (isset($row['Image']) && !empty($row['Image'])) {
        $perfume['image_url'] = $row['Image'];
    } elseif (isset($row['image']) && !empty($row['image'])) {
        $perfume['image_url'] = $row['image'];
    } elseif (isset($row['image_url']) && !empty($row['image_url'])) {
        $perfume['image_url'] = $row['image_url'];
    } else {
        $perfume['image_url'] = 'https://via.placeholder.com/300x300?text=Parfum';
    }
    
    // Cinsiyet ve mevsim bilgileri
    $perfume['gender'] = isset($row['Gender']) ? strtolower($row['Gender']) : (isset($row['gender']) ? strtolower($row['gender']) : 'unisex');
    $perfume['season'] = isset($row['Season']) ? strtolower($row['Season']) : (isset($row['season']) ? strtolower($row['season']) : 'all');
    
    // Fiyat bilgileri - sayısal değerlere dönüştür
    $perfume['price_of_30ml'] = isset($row['Price_of_30ml']) ? (float)$row['Price_of_30ml'] : (isset($row['price_of_30ml']) ? (float)$row['price_of_30ml'] : 0);
    $perfume['price_of_50ml'] = isset($row['Price_of_50ml']) ? (float)$row['Price_of_50ml'] : (isset($row['price_of_50ml']) ? (float)$row['price_of_50ml'] : 0);
    
    // Değerlendirme bilgileri - güvenli sorgu
    try {
        $sanitizedId = sanitizeInput($id);
        $reviewQuery = "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE perfume_id = '$sanitizedId'";
        $reviewResult = $conn->query($reviewQuery);
        
        if ($reviewResult && $reviewResult->num_rows > 0) {
            $reviewData = $reviewResult->fetch_assoc();
            $perfume['rating'] = $reviewData['avg_rating'] ? round((float)$reviewData['avg_rating'], 1) : 0;
            $perfume['rating_count'] = (int)$reviewData['count'];
        } else {
            $perfume['rating'] = 0;
            $perfume['rating_count'] = 0;
        }
    } catch (Exception $e) {
        error_log('formatPerfumeData: Değerlendirme bilgisi alınırken hata: ' . $e->getMessage());
        $perfume['rating'] = 0;
        $perfume['rating_count'] = 0;
    }
    
    return $perfume;
}

/**
 * Get similar perfumes based on a perfume ID
 * 
 * @param string $id Perfume ID
 * @param int $limit Number of similar perfumes to return
 * @return array Array of similar perfumes
 */
function getSimilarPerfumes($id, $limit = 4) {
    global $conn;
    
    // Get the original perfume
    $perfume = getPerfumeById($id);
    
    if (!$perfume) {
        return [];
    }
    
    // Get perfumes with same gender and season
    $query = "SELECT * FROM perfumes WHERE Gender = '" . sanitizeInput($perfume['gender']) . "' 
              AND Season = '" . sanitizeInput($perfume['season']) . "' 
              AND Name != '" . sanitizeInput($perfume['name']) . "'
              ORDER BY RAND() LIMIT $limit";
    
    $result = $conn->query($query);
    
    // Prepare results
    $similarPerfumes = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Verileri formatla
            $similarPerfumes[] = formatPerfumeData($row, md5($row['Name'] . $row['Brand']));
        }
    }
    
    // If we don't have enough similar perfumes, get random ones
    if (count($similarPerfumes) < $limit) {
        $needed = $limit - count($similarPerfumes);
        $query = "SELECT * FROM perfumes WHERE Name != '" . sanitizeInput($perfume['name']) . "'
                  AND (Gender != '" . sanitizeInput($perfume['gender']) . "' 
                  OR Season != '" . sanitizeInput($perfume['season']) . "')
                  ORDER BY RAND() LIMIT $needed";
        
        $result = $conn->query($query);
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Verileri formatla
                $similarPerfumes[] = formatPerfumeData($row, md5($row['Name'] . $row['Brand']));
            }
        }
    }
    
    return $similarPerfumes;
}

/**
 * Get perfumes by aroma notes
 * 
 * @param array $aromas Array of aroma notes to filter by
 * @param int $page Page number
 * @param int $perPage Items per page
 * @return array Array containing perfumes and pagination info
 */
function getPerfumesByAroma($aromas, $page = 1, $perPage = 12) {
    global $conn;
    
    // Base query
    $query = "SELECT * FROM perfumes WHERE 1=1";
    
    // Add aroma filter
    if (!empty($aromas)) {
        $query .= " AND (";
        $conditions = [];
        
        foreach ($aromas as $aroma) {
            $conditions[] = "Notes LIKE '%" . sanitizeInput($aroma) . "%'";
        }
        
        $query .= implode(" OR ", $conditions) . ")";
    }
    
    // Add sorting
    $query .= " ORDER BY Name ASC";
    
    // Count total results for pagination
    $countQuery = str_replace("SELECT *", "SELECT COUNT(*) as total", $query);
    $countQuery = preg_replace("/ORDER BY.*/", "", $countQuery);
    $countResult = $conn->query($countQuery);
    $totalCount = $countResult->fetch_assoc()['total'];
    
    // Calculate pagination
    $totalPages = ceil($totalCount / $perPage);
    $page = max(1, min($page, $totalPages));
    $offset = ($page - 1) * $perPage;
    
    // Add pagination to query
    $query .= " LIMIT $offset, $perPage";
    
    // Execute query
    $result = $conn->query($query);
    
    // Prepare results
    $perfumes = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Add id field for JavaScript
            $row['id'] = md5($row['Name'] . $row['Brand']);
            $perfumes[] = $row;
        }
    }
    
    // Return results with pagination info
    return [
        'perfumes' => $perfumes,
        'pagination' => [
            'total' => $totalCount,
            'per_page' => $perPage,
            'current_page' => $page,
            'total_pages' => $totalPages,
            'has_more' => $page < $totalPages
        ]
    ];
}

/**
 * Get all unique aroma notes from perfumes
 * 
 * @return array Array of unique aroma notes
 */
function getAromaNotes() {
    global $conn;
    
    $query = "SELECT Notes FROM perfumes WHERE Notes IS NOT NULL AND Notes != ''";
    $result = $conn->query($query);
    
    $allNotes = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Notlar sütunu büyük harfle başlıyor
            $notesField = isset($row['Notes']) ? $row['Notes'] : '';
            if (empty($notesField)) continue;
            
            $notes = explode(',', $notesField);
            foreach ($notes as $note) {
                $note = trim($note);
                if (!empty($note) && !in_array($note, $allNotes)) {
                    $allNotes[] = $note;
                }
            }
        }
    }
    
    // Sort alphabetically
    sort($allNotes);
    
    // Format for API response
    $formattedNotes = [];
    foreach ($allNotes as $index => $note) {
        $formattedNotes[] = [
            'id' => $index + 1,
            'name' => $note
        ];
    }
    
    return $formattedNotes;
}

/**
 * Get popular perfumes
 * 
 * @param int $limit Number of perfumes to return
 * @param string $type Type of popular perfumes (most_liked, best_selling, most_reviewed)
 * @return array Array of popular perfumes
 */
function getPopularPerfumes($limit = 8, $type = 'most_liked') {
    global $conn;
    
    switch ($type) {
        case 'most_liked':
            return getMostLikedPerfumes($limit);
        case 'best_selling':
            return getBestSellingPerfumes($limit);
        case 'most_reviewed':
            return getMostReviewedPerfumes($limit);
        default:
            return getMostLikedPerfumes($limit);
    }
}

/**
 * Get most liked perfumes
 * 
 * @param int $limit Number of perfumes to return
 * @return array Array of most liked perfumes
 */
function getMostLikedPerfumes($limit = 8) {
    global $conn;
    
    // Debug için
    error_log('getMostLikedPerfumes çağrıldı, limit: ' . $limit);
    
    // In a real application, this would be based on likes or ratings
    // For now, we'll just get random perfumes
    $query = "SELECT * FROM perfumes ORDER BY RAND() LIMIT $limit";
    $result = $conn->query($query);
    
    if (!$result) {
        error_log('SQL hatası: ' . $conn->error);
        return [];
    }
    
    // Prepare results
    $perfumes = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Veritabanı sütun isimlerini kontrol et
            error_log('Parfüm verisi: ' . print_r($row, true));
            
            // ID oluştur
            $id = '';
            if (isset($row['id'])) {
                $id = $row['id'];
            } else if (isset($row['Name']) && isset($row['Brand'])) {
                $id = md5($row['Name'] . $row['Brand']);
            } else if (isset($row['name']) && isset($row['brand'])) {
                $id = md5($row['name'] . $row['brand']);
            } else {
                $id = md5(uniqid());
            }
            
            // Temel alanları kontrol et ve ekle
            $perfume = [];
            $perfume['id'] = $id;
            $perfume['name'] = $row['name'] ?? $row['Name'] ?? 'Bilinmeyen Parfüm';
            $perfume['brand'] = $row['brand'] ?? $row['Brand'] ?? 'Bilinmeyen Marka';
            $perfume['description'] = $row['description'] ?? $row['Description'] ?? '';
            $perfume['notes'] = $row['notes'] ?? $row['Notes'] ?? '';
            $perfume['gender'] = $row['gender'] ?? $row['Gender'] ?? 'unisex';
            $perfume['season'] = $row['season'] ?? $row['Season'] ?? 'all';
            
            // Resim URL'si
            $perfume['image_url'] = $row['image_url'] ?? $row['Image URL'] ?? $row['Image'] ?? $row['image'] ?? 'images/perfumes/default.jpg';
            
            // Fiyat bilgileri
            $perfume['price_of_30ml'] = $row['price_of_30ml'] ?? $row['Price_of_30ml'] ?? $row['price'] ?? $row['Price'] ?? 0;
            $perfume['price_of_50ml'] = $row['price_of_50ml'] ?? $row['Price_of_50ml'] ?? 0;
            
            // Değerlendirme bilgileri
            $perfume['rating'] = $row['rating'] ?? $row['Rating'] ?? rand(40, 50) / 10; // 4.0-5.0 arası rastgele değer
            $perfume['rating_count'] = $row['rating_count'] ?? $row['Rating_count'] ?? rand(20, 200); // 20-200 arası rastgele değer
            
            $perfumes[] = $perfume;
        }
    }
    
    return $perfumes;
}

/**
 * Get best selling perfumes
 * 
 * @param int $limit Number of perfumes to return
 * @return array Array of best selling perfumes
 */
function getBestSellingPerfumes($limit = 8) {
    global $conn;
    
    // Debug için
    error_log('getBestSellingPerfumes çağrıldı, limit: ' . $limit);
    
    // In a real application, this would be based on sales data
    // For now, we'll just get different random perfumes with a different seed
    $query = "SELECT * FROM perfumes ORDER BY RAND() LIMIT $limit";
    $result = $conn->query($query);
    
    if (!$result) {
        error_log('SQL hatası: ' . $conn->error);
        return [];
    }
    
    // Prepare results
    $perfumes = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Veritabanı sütun isimlerini kontrol et
            error_log('Parfüm verisi: ' . print_r($row, true));
            
            // ID oluştur
            $id = '';
            if (isset($row['id'])) {
                $id = $row['id'];
            } else if (isset($row['Name']) && isset($row['Brand'])) {
                $id = md5($row['Name'] . $row['Brand']);
            } else if (isset($row['name']) && isset($row['brand'])) {
                $id = md5($row['name'] . $row['brand']);
            } else {
                $id = md5(uniqid());
            }
            
            // Temel alanları kontrol et ve ekle
            $perfume = [];
            $perfume['id'] = $id;
            $perfume['name'] = $row['name'] ?? $row['Name'] ?? 'Bilinmeyen Parfüm';
            $perfume['brand'] = $row['brand'] ?? $row['Brand'] ?? 'Bilinmeyen Marka';
            $perfume['description'] = $row['description'] ?? $row['Description'] ?? '';
            $perfume['notes'] = $row['notes'] ?? $row['Notes'] ?? '';
            $perfume['gender'] = $row['gender'] ?? $row['Gender'] ?? 'unisex';
            $perfume['season'] = $row['season'] ?? $row['Season'] ?? 'all';
            
            // Resim URL'si
            $perfume['image_url'] = $row['image_url'] ?? $row['Image URL'] ?? $row['Image'] ?? $row['image'] ?? 'images/perfumes/default.jpg';
            
            // Fiyat bilgileri
            $perfume['price_of_30ml'] = $row['price_of_30ml'] ?? $row['Price_of_30ml'] ?? $row['price'] ?? $row['Price'] ?? 0;
            $perfume['price_of_50ml'] = $row['price_of_50ml'] ?? $row['Price_of_50ml'] ?? 0;
            
            // Değerlendirme bilgileri
            $perfume['rating'] = $row['rating'] ?? $row['Rating'] ?? rand(40, 50) / 10; // 4.0-5.0 arası rastgele değer
            $perfume['rating_count'] = $row['rating_count'] ?? $row['Rating_count'] ?? rand(20, 200); // 20-200 arası rastgele değer
            
            $perfumes[] = $perfume;
        }
    }
    
    return $perfumes;
}

/**
 * Get most reviewed perfumes
 * 
 * @param int $limit Number of perfumes to return
 * @return array Array of most reviewed perfumes
 */
function getMostReviewedPerfumes($limit = 8) {
    global $conn;
    
    // Debug için
    error_log('getMostReviewedPerfumes çağrıldı, limit: ' . $limit);
    
    // In a real application, this would be based on review count
    // For now, we'll just get different random perfumes with a different seed
    $query = "SELECT * FROM perfumes ORDER BY RAND() LIMIT $limit";
    $result = $conn->query($query);
    
    if (!$result) {
        error_log('SQL hatası: ' . $conn->error);
        return [];
    }
    
    // Prepare results
    $perfumes = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Veritabanı sütun isimlerini kontrol et
            error_log('Parfüm verisi: ' . print_r($row, true));
            
            // ID oluştur
            $id = '';
            if (isset($row['id'])) {
                $id = $row['id'];
            } else if (isset($row['Name']) && isset($row['Brand'])) {
                $id = md5($row['Name'] . $row['Brand']);
            } else if (isset($row['name']) && isset($row['brand'])) {
                $id = md5($row['name'] . $row['brand']);
            } else {
                $id = md5(uniqid());
            }
            
            // Temel alanları kontrol et ve ekle
            $perfume = [];
            $perfume['id'] = $id;
            $perfume['name'] = $row['name'] ?? $row['Name'] ?? 'Bilinmeyen Parfüm';
            $perfume['brand'] = $row['brand'] ?? $row['Brand'] ?? 'Bilinmeyen Marka';
            $perfume['description'] = $row['description'] ?? $row['Description'] ?? '';
            $perfume['notes'] = $row['notes'] ?? $row['Notes'] ?? '';
            $perfume['gender'] = $row['gender'] ?? $row['Gender'] ?? 'unisex';
            $perfume['season'] = $row['season'] ?? $row['Season'] ?? 'all';
            
            // Resim URL'si
            $perfume['image_url'] = $row['image_url'] ?? $row['Image URL'] ?? $row['Image'] ?? $row['image'] ?? 'images/perfumes/default.jpg';
            
            // Fiyat bilgileri
            $perfume['price_of_30ml'] = $row['price_of_30ml'] ?? $row['Price_of_30ml'] ?? $row['price'] ?? $row['Price'] ?? 0;
            $perfume['price_of_50ml'] = $row['price_of_50ml'] ?? $row['Price_of_50ml'] ?? 0;
            
            // Değerlendirme bilgileri
            $perfume['rating'] = $row['rating'] ?? $row['Rating'] ?? rand(40, 50) / 10; // 4.0-5.0 arası rastgele değer
            $perfume['rating_count'] = $row['rating_count'] ?? $row['Rating_count'] ?? rand(20, 200); // 20-200 arası rastgele değer
            
            $perfumes[] = $perfume;
        }
    }
    
    return $perfumes;
}

/**
 * Get seasonal perfumes
 * 
 * @param string $season Season to filter by (summer, winter, spring, autumn)
 * @param int $limit Number of perfumes to return
 * @return array Array of seasonal perfumes
 */
function getSeasonalPerfumes($season, $limit = 4) {
    global $conn;
    
    $query = "SELECT * FROM perfumes WHERE season = '" . sanitizeInput($season) . "' ORDER BY RAND() LIMIT $limit";
    $result = $conn->query($query);
    
    // Hata ayıklama için SQL sorgusunu logla
    error_log("Seasonal perfumes SQL query: $query");
    
    // Prepare results
    $perfumes = [];
    if ($result && $result->num_rows > 0) {
        error_log("Found " . $result->num_rows . " seasonal perfumes for season: $season");
        
        while ($row = $result->fetch_assoc()) {
            // Veritabanı sütun isimlerini kontrol et ve JavaScript için uyumlu hale getir
            $perfume = [];
            
            // ID alanını oluştur
            $name = isset($row['Name']) ? $row['Name'] : (isset($row['name']) ? $row['name'] : 'Unknown');
            $brand = isset($row['Brand']) ? $row['Brand'] : (isset($row['brand']) ? $row['brand'] : 'Unknown');
            $perfume['id'] = md5($name . $brand);
            
            // Temel alanları kopyala
            $perfume['name'] = $name;
            $perfume['brand'] = $brand;
            $perfume['description'] = isset($row['Description']) ? $row['Description'] : (isset($row['description']) ? $row['description'] : '');
            $perfume['notes'] = isset($row['Notes']) ? $row['Notes'] : (isset($row['notes']) ? $row['notes'] : '');
            $perfume['gender'] = isset($row['Gender']) ? $row['Gender'] : (isset($row['gender']) ? $row['gender'] : 'unisex');
            $perfume['season'] = isset($row['Season']) ? $row['Season'] : (isset($row['season']) ? $row['season'] : $season);
            
            // Resim URL'si - JavaScript image_url bekliyor
            if (isset($row['Image URL']) && !empty($row['Image URL'])) {
                $perfume['image_url'] = $row['Image URL'];
            } elseif (isset($row['Image']) && !empty($row['Image'])) {
                $perfume['image_url'] = $row['Image'];
            } elseif (isset($row['image']) && !empty($row['image'])) {
                $perfume['image_url'] = $row['image'];
            } elseif (isset($row['image_url']) && !empty($row['image_url'])) {
                $perfume['image_url'] = $row['image_url'];
            } else {
                $perfume['image_url'] = 'https://via.placeholder.com/300x300?text=Parfum';
            }
            
            // Fiyat bilgileri
            $perfume['price_of_30ml'] = isset($row['Price_of_30ml']) ? $row['Price_of_30ml'] : (isset($row['price_of_30ml']) ? $row['price_of_30ml'] : 0);
            $perfume['price_of_50ml'] = isset($row['Price_of_50ml']) ? $row['Price_of_50ml'] : (isset($row['price_of_50ml']) ? $row['price_of_50ml'] : 0);
            
            // Değerlendirme bilgileri
            $perfume['rating'] = isset($row['Rating']) ? $row['Rating'] : (isset($row['rating']) ? $row['rating'] : rand(35, 50) / 10);
            $perfume['rating_count'] = isset($row['Rating_count']) ? $row['Rating_count'] : (isset($row['rating_count']) ? $row['rating_count'] : rand(5, 100));
            
            // Orijinal veritabanı sütunlarını da koru
            foreach ($row as $key => $value) {
                if (!isset($perfume[$key])) {
                    $perfume[$key] = $value;
                }
            }
            
            $perfumes[] = $perfume;
        }
    } else {
        error_log("No seasonal perfumes found for season: $season");
    }
    
    return $perfumes;
}

/**
 * Get seasonal perfumes with pagination
 * 
 * @param string $season Season to filter by (summer, winter, spring, autumn)
 * @param int $offset Offset for pagination
 * @param int $limit Number of perfumes to return
 * @return array Array containing perfumes and total count
 */
function getSeasonalPerfumesWithPagination($season, $offset = 0, $limit = 8) {
    global $conn;
    
    // Validate season
    $validSeasons = ['summer', 'winter', 'spring', 'autumn'];
    if (!in_array($season, $validSeasons)) {
        return ['perfumes' => [], 'total' => 0];
    }
    
    // Get total count of perfumes for the specified season
    $countQuery = "SELECT COUNT(*) as total FROM perfumes WHERE season = '" . sanitizeInput($season) . "'";
    $countResult = $conn->query($countQuery);
    $totalCount = 0;
    
    if ($countResult && $countResult->num_rows > 0) {
        $totalCount = $countResult->fetch_assoc()['total'];
    }
    
    // Hata ayıklama için toplam sayıyı logla
    error_log("Total seasonal perfumes for $season: $totalCount");
    
    // Get perfumes for the specified season with pagination
    $query = "SELECT * FROM perfumes WHERE season = '" . sanitizeInput($season) . "' ORDER BY name ASC LIMIT $offset, $limit";
    $result = $conn->query($query);
    
    // Hata ayıklama için SQL sorgusunu logla
    error_log("Seasonal perfumes with pagination SQL query: $query");
    
    // Prepare results
    $perfumes = [];
    if ($result && $result->num_rows > 0) {
        error_log("Found " . $result->num_rows . " seasonal perfumes for season: $season, offset: $offset, limit: $limit");
        
        while ($row = $result->fetch_assoc()) {
            // Veritabanı sütun isimlerini kontrol et ve JavaScript için uyumlu hale getir
            $perfume = [];
            
            // ID alanını oluştur
            $name = isset($row['Name']) ? $row['Name'] : (isset($row['name']) ? $row['name'] : 'Unknown');
            $brand = isset($row['Brand']) ? $row['Brand'] : (isset($row['brand']) ? $row['brand'] : 'Unknown');
            $perfume['id'] = md5($name . $brand);
            
            // Temel alanları kopyala
            $perfume['name'] = $name;
            $perfume['brand'] = $brand;
            $perfume['description'] = isset($row['Description']) ? $row['Description'] : (isset($row['description']) ? $row['description'] : '');
            $perfume['notes'] = isset($row['Notes']) ? $row['Notes'] : (isset($row['notes']) ? $row['notes'] : '');
            $perfume['gender'] = isset($row['Gender']) ? $row['Gender'] : (isset($row['gender']) ? $row['gender'] : 'unisex');
            $perfume['season'] = isset($row['Season']) ? $row['Season'] : (isset($row['season']) ? $row['season'] : $season);
            
            // Resim URL'si - JavaScript image_url bekliyor
            if (isset($row['Image URL']) && !empty($row['Image URL'])) {
                $perfume['image_url'] = $row['Image URL'];
            } elseif (isset($row['Image']) && !empty($row['Image'])) {
                $perfume['image_url'] = $row['Image'];
            } elseif (isset($row['image']) && !empty($row['image'])) {
                $perfume['image_url'] = $row['image'];
            } elseif (isset($row['image_url']) && !empty($row['image_url'])) {
                $perfume['image_url'] = $row['image_url'];
            } else {
                $perfume['image_url'] = 'https://via.placeholder.com/300x300?text=Parfum';
            }
            
            // Fiyat bilgileri
            $perfume['price_of_30ml'] = isset($row['Price_of_30ml']) ? $row['Price_of_30ml'] : (isset($row['price_of_30ml']) ? $row['price_of_30ml'] : 0);
            $perfume['price_of_50ml'] = isset($row['Price_of_50ml']) ? $row['Price_of_50ml'] : (isset($row['price_of_50ml']) ? $row['price_of_50ml'] : 0);
            
            // Değerlendirme bilgileri
            $perfume['rating'] = isset($row['Rating']) ? $row['Rating'] : (isset($row['rating']) ? $row['rating'] : rand(35, 50) / 10);
            $perfume['rating_count'] = isset($row['Rating_count']) ? $row['Rating_count'] : (isset($row['rating_count']) ? $row['rating_count'] : rand(5, 100));
            
            // Orijinal veritabanı sütunlarını da koru
            foreach ($row as $key => $value) {
                if (!isset($perfume[$key])) {
                    $perfume[$key] = $value;
                }
            }
            
            $perfumes[] = $perfume;
        }
    } else {
        error_log("No seasonal perfumes found for season: $season, offset: $offset, limit: $limit");
    }
    
    return [
        'perfumes' => $perfumes,
        'total' => $totalCount
    ];
}

/**
 * Get perfume recommendations based on user preferences
 * 
 * @param string $message User message
 * @param array $history Chat history
 * @return array Array containing recommendation message and perfumes
 */
function getPerfumeRecommendations($message, $history = []) {
    global $conn;
    
    // Extract keywords from message
    $lowerMessage = strtolower($message);
    $keywords = extractKeywords($message);
    
    // Determine gender preference (support EN & TR)
    $gender = 'all';
    if (strpos($lowerMessage, 'male') !== false || strpos($lowerMessage, 'men') !== false || strpos($lowerMessage, 'erkek') !== false) {
        $gender = 'male';
    } elseif (strpos($lowerMessage, 'female') !== false || strpos($lowerMessage, 'woman') !== false || strpos($lowerMessage, 'women') !== false || strpos($lowerMessage, 'kadın') !== false) {
        $gender = 'female';
    } elseif (strpos($lowerMessage, 'unisex') !== false) {
        $gender = 'unisex';
    }
    
    // Determine season preference (support EN & TR)
    $season = 'all';
    if (strpos($lowerMessage, 'summer') !== false || strpos($lowerMessage, 'yaz') !== false) {
        $season = 'summer';
    } elseif (strpos($lowerMessage, 'winter') !== false || strpos($lowerMessage, 'kış') !== false) {
        $season = 'winter';
    } elseif (strpos($lowerMessage, 'spring') !== false || strpos($lowerMessage, 'ilkbahar') !== false || strpos($lowerMessage, 'bahar') !== false) {
        $season = 'spring';
    } elseif (strpos($lowerMessage, 'autumn') !== false || strpos($lowerMessage, 'fall') !== false || strpos($lowerMessage, 'sonbahar') !== false) {
        $season = 'autumn';
    }
    
    // Build query based on preferences
    $query = "SELECT * FROM perfumes WHERE 1=1";
    
    // Add gender filter
    if ($gender !== 'all') {
        $query .= " AND gender = '" . sanitizeInput($gender) . "'";
    }
    
    // Add season filter
    if ($season !== 'all') {
        $query .= " AND season = '" . sanitizeInput($season) . "'";
    }
    
    // Add keyword filter for notes
    if (!empty($keywords)) {
        $query .= " AND (";
        $conditions = [];
        
        foreach ($keywords as $keyword) {
            $conditions[] = "Notes LIKE '%" . sanitizeInput($keyword) . "%'";
        }
        
        $query .= implode(" OR ", $conditions) . ")";
    }
    
    // Add limit and random order
    $query .= " ORDER BY RAND() LIMIT 3";
    
    // Execute query
    $result = $conn->query($query);
    
    // Hata ayıklama için SQL sorgusunu logla
    error_log("Chatbot recommendation SQL query: $query");
    
    // Prepare results
    $perfumes = [];
    if ($result && $result->num_rows > 0) {
        error_log("Found " . $result->num_rows . " perfume recommendations");
        
        while ($row = $result->fetch_assoc()) {
            // Veritabanı sütun isimlerini kontrol et ve JavaScript için uyumlu hale getir
            $perfume = [];
            
            // ID alanını oluştur
            $name = isset($row['Name']) ? $row['Name'] : (isset($row['name']) ? $row['name'] : 'Unknown');
            $brand = isset($row['Brand']) ? $row['Brand'] : (isset($row['brand']) ? $row['brand'] : 'Unknown');
            $perfume['id'] = md5($name . $brand);
            
            // Temel alanları kopyala
            $perfume['name'] = $name;
            $perfume['brand'] = $brand;
            $perfume['description'] = isset($row['Description']) ? $row['Description'] : (isset($row['description']) ? $row['description'] : '');
            $perfume['notes'] = isset($row['Notes']) ? $row['Notes'] : (isset($row['notes']) ? $row['notes'] : '');
            $perfume['gender'] = isset($row['Gender']) ? $row['Gender'] : (isset($row['gender']) ? $row['gender'] : 'unisex');
            $perfume['season'] = isset($row['Season']) ? $row['Season'] : (isset($row['season']) ? $row['season'] : 'all');
            
            // Resim URL'si - JavaScript image_url bekliyor
            if (isset($row['Image URL']) && !empty($row['Image URL'])) {
                $perfume['image_url'] = $row['Image URL'];
            } elseif (isset($row['Image']) && !empty($row['Image'])) {
                $perfume['image_url'] = $row['Image'];
            } elseif (isset($row['image']) && !empty($row['image'])) {
                $perfume['image_url'] = $row['image'];
            } elseif (isset($row['image_url']) && !empty($row['image_url'])) {
                $perfume['image_url'] = $row['image_url'];
            } else {
                $perfume['image_url'] = 'https://via.placeholder.com/300x300?text=Parfum';
            }
            
            // Fiyat bilgileri
            $perfume['price_of_30ml'] = isset($row['Price_of_30ml']) ? $row['Price_of_30ml'] : (isset($row['price_of_30ml']) ? $row['price_of_30ml'] : 0);
            $perfume['price_of_50ml'] = isset($row['Price_of_50ml']) ? $row['Price_of_50ml'] : (isset($row['price_of_50ml']) ? $row['price_of_50ml'] : 0);
            
            // Değerlendirme bilgileri
            $perfume['rating'] = isset($row['Rating']) ? $row['Rating'] : (isset($row['rating']) ? $row['rating'] : rand(35, 50) / 10);
            $perfume['rating_count'] = isset($row['Rating_count']) ? $row['Rating_count'] : (isset($row['rating_count']) ? $row['rating_count'] : rand(5, 100));
            
            // Orijinal veritabanı sütunlarını da koru
            foreach ($row as $key => $value) {
                if (!isset($perfume[$key])) {
                    $perfume[$key] = $value;
                }
            }
            
            error_log("Chatbot recommendation perfume: " . json_encode($perfume));
            $perfumes[] = $perfume;
        }
    } else {
        error_log("No perfume recommendations found for query: $query");
    }
    
    // Generate recommendation message
    $recommendationMessage = generateRecommendationMessage($gender, $season, $keywords, count($perfumes));
    
    return [
        'message' => $recommendationMessage,
        'perfumes' => $perfumes
    ];
}

/**
 * Extract keywords from message
 * 
 * @param string $message User message
 * @return array Array of keywords
 */
function extractKeywords($message) {
    // Common aroma keywords
    $aromaKeywords = [
        'çiçek', 'çiçeksi', 'floral', 'gül', 'lavanta', 'yasemin', 'menekşe',
        'meyve', 'meyveli', 'portakal', 'limon', 'elma', 'muz', 'çilek',
        'odun', 'odunsu', 'woody', 'sandal', 'sedir', 'meşe',
        'bahar', 'baharat', 'baharatlı', 'tarçın', 'karabiber', 'zencefil',
        'tatlı', 'şeker', 'vanilya', 'karamel', 'çikolata',
        'taze', 'ferah', 'deniz', 'okyanus', 'su', 'yağmur',
        'amber', 'misk', 'deri', 'tütün'
    ];
    
    // Convert message to lowercase
    $message = strtolower($message);
    
    // Extract keywords
    $keywords = [];
    foreach ($aromaKeywords as $keyword) {
        if (strpos($message, $keyword) !== false) {
            $keywords[] = $keyword;
        }
    }
    
    return $keywords;
}

/**
 * Generate recommendation message
 * 
 * @param string $gender Gender preference
 * @param string $season Season preference
 * @param array $keywords Aroma keywords
 * @param int $count Number of recommendations
 * @return string Recommendation message
 */
function generateRecommendationMessage($gender, $season, $keywords, $count) {
    // Gender text
    $genderText = '';
    switch ($gender) {
        case 'male':
            $genderText = 'Male';
            break;
        case 'female':
            $genderText = 'Female';
            break;
        case 'unisex':
            $genderText = 'Unisex';
            break;
    }
    
    // Season text (English)
    $seasonText = '';
    switch ($season) {
        case 'summer':
            $seasonText = 'summer';
            break;
        case 'winter':
            $seasonText = 'winter';
            break;
        case 'spring':
            $seasonText = 'spring';
            break;
        case 'autumn':
            $seasonText = 'autumn';
            break;
    }
    
    // Keywords text
    $keywordsText = '';
    if (!empty($keywords)) {
        $keywordsText = implode(', ', $keywords);
    }
    
    // Generate message
    $message = 'Size ';
    
    if ($count === 0) {
        $message = 'Üzgünüm, belirttiğiniz kriterlere uygun parfüm bulamadım. Lütfen farklı kriterler belirtin.';
    } else {
        // İsteğe bağlı olarak mesajı tamamen boş bırakıyoruz
        $message = '';
    }
    
    return $message;
}

/**
 * Check if user is logged in
 * 
 * @return bool True if user is logged in, false otherwise
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

/**
 * Get current user data
 * 
 * @return array|null User data or null if not logged in
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    global $conn;
    
    $userId = $_SESSION['user_id'];
    $query = "SELECT id, name, email, created_at FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    
    return null;
}

/**
 * Get current date and time in MySQL format
 * 
 * @return string Current date and time
 */
function getCurrentDateTime() {
    return date('Y-m-d H:i:s');
}

/**
 * Generate JSON response
 * 
 * @param array $data Response data
 * @param int $statusCode HTTP status code
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
