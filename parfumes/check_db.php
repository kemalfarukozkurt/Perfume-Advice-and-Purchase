<?php
/**
 * KAANI Perfume - Database Check Script
 */

// Include database configuration
require_once 'config.php';

// Check connection
if ($conn->connect_error) {
    die("Veritabanı bağlantı hatası: " . $conn->connect_error);
}

echo "Veritabanı bağlantısı başarılı.<br>";

// Get tables
$tables = [];
$result = $conn->query("SHOW TABLES");
if ($result) {
    echo "Veritabanı tabloları:<br>";
    while ($row = $result->fetch_row()) {
        $tables[] = $row[0];
        echo "- " . $row[0] . "<br>";
    }
} else {
    echo "Tablolar alınamadı: " . $conn->error . "<br>";
}

// Check perfumes table
if (in_array('perfumes', $tables)) {
    echo "<br>Perfumes tablosu mevcut.<br>";
    
    // Get columns
    $result = $conn->query("DESCRIBE perfumes");
    if ($result) {
        echo "Perfumes tablosu sütunları:<br>";
        while ($row = $result->fetch_assoc()) {
            echo "- " . $row['Field'] . " (" . $row['Type'] . ")<br>";
        }
    } else {
        echo "Sütunlar alınamadı: " . $conn->error . "<br>";
    }
    
    // Count perfumes
    $result = $conn->query("SELECT COUNT(*) as total FROM perfumes");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "<br>Toplam parfüm sayısı: " . $row['total'] . "<br>";
    } else {
        echo "Parfüm sayısı alınamadı: " . $conn->error . "<br>";
    }
    
    // Get sample perfumes
    echo "<br>Örnek parfümler:<br>";
    $result = $conn->query("SELECT * FROM perfumes LIMIT 3");
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo "<pre>";
            print_r($row);
            echo "</pre>";
        }
    } else {
        echo "Örnek parfümler alınamadı: " . $conn->error . "<br>";
    }
} else {
    echo "<br>Perfumes tablosu bulunamadı!<br>";
}

// Close connection
$conn->close();
?>
