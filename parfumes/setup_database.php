<?php
/**
 * KAANI Perfume - Database Setup Script
 * 
 * Bu script veritabanı tablolarını oluşturur
 */

// Veritabanı bağlantısı
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'parfumes';

// Bağlantıyı oluştur
$conn = new mysqli($host, $user, $pass);

// Bağlantıyı kontrol et
if ($conn->connect_error) {
    die("Bağlantı hatası: " . $conn->connect_error);
}

// Veritabanını oluştur
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === FALSE) {
    die("Veritabanı oluşturma hatası: " . $conn->error);
}

echo "Veritabanı başarıyla oluşturuldu.<br>";

// Veritabanını seç
$conn->select_db($dbname);

// Karakter setini ayarla
$conn->set_charset("utf8mb4");

// SQL dosyasını oku
$sql = file_get_contents('database.sql');

// Her bir SQL ifadesini çalıştır
if ($conn->multi_query($sql)) {
    do {
        // Sonraki sonuç setini sakla
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
}

if ($conn->error) {
    die("SQL hatası: " . $conn->error);
}

echo "Veritabanı tabloları başarıyla oluşturuldu.<br>";

// Perfumes tablosunu kontrol et
$result = $conn->query("SHOW TABLES LIKE 'perfumes'");
if ($result->num_rows == 0) {
    echo "Perfumes tablosu bulunamadı. Lütfen perfumes.sql dosyasını içe aktarın.<br>";
    echo "phpMyAdmin'e gidin (http://localhost/phpmyadmin), parfumes veritabanını seçin ve perfumes.sql dosyasını içe aktarın.<br>";
} else {
    echo "Perfumes tablosu zaten mevcut.<br>";
}

// Bağlantıyı kapat
$conn->close();

echo "<br>Kurulum tamamlandı. <a href='index.html'>Ana sayfaya dön</a> veya <a href='api_test.html'>API test sayfasına git</a>.";
?>
