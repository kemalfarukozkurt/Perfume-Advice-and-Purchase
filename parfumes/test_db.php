<?php
// Veritabanı bağlantısı ve yapısını test etmek için
require_once 'config.php';
require_once 'functions.php';

// Veritabanı bağlantısı
$conn = connectDB();

// Perfumes tablosunun yapısını göster
$query = "DESCRIBE perfumes";
$result = $conn->query($query);

echo "<h1>Perfumes Tablosu Yapısı</h1>";
echo "<table border='1'>";
echo "<tr><th>Alan</th><th>Tip</th><th>Null</th><th>Anahtar</th><th>Varsayılan</th><th>Ekstra</th></tr>";

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['Field'] . "</td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . $row['Default'] . "</td>";
        echo "<td>" . $row['Extra'] . "</td>";
        echo "</tr>";
    }
}
echo "</table>";

// Örnek bir parfüm kaydını göster
$query = "SELECT * FROM perfumes LIMIT 1";
$result = $conn->query($query);

echo "<h1>Örnek Parfüm Kaydı</h1>";
echo "<pre>";
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    print_r($row);
}
echo "</pre>";

// Bağlantıyı kapat
$conn->close();
?>
