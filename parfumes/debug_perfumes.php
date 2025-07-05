<?php
// Veritabanı bağlantısı
require_once 'config.php';

// Bağlantıyı kur
$conn = connectDB();

// Perfumes tablosundan bir kayıt al
$query = "SELECT * FROM perfumes LIMIT 1";
$result = $conn->query($query);

// Sonuçları göster
echo "<h1>Perfume Table Structure</h1>";
echo "<pre>";
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    print_r($row);
}
echo "</pre>";

// Bağlantıyı kapat
$conn->close();
?>
