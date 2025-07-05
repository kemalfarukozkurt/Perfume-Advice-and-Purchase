KAANI Parfüm Web Sitesi
KAANI Parfüm, aroma bazlı parfüm filtreleme, kullanıcı kimlik doğrulama, alışveriş sepeti, dilek listesi, AI destekli chatbot ve daha fazlasını içeren modern bir parfüm e-ticaret platformudur.

Kurulum
XAMPP'i yükleyin ve Apache ile MySQL servislerini başlatın
Proje dosyalarını c:\xampp\htdocs\parfumes dizinine kopyalayın
Veritabanını oluşturun:
phpMyAdmin'e gidin (http://localhost/phpmyadmin)
Yeni bir parfumes veritabanı oluşturun
perfumes.sql dosyasını içe aktarın (parfüm verileri için)
database.sql dosyasını içe aktarın (kullanıcı, yorum ve diğer tablolar için)
Web tarayıcınızda http://localhost/parfumes adresine gidin
Özellikler
Parfüm Filtreleme: Cinsiyet, mevsim ve aroma notalarına göre parfüm filtreleme
Detaylı Parfüm Sayfaları: Her parfüm için notlar, açıklamalar, fiyatlar ve yorumlar
Kullanıcı Kimlik Doğrulama: Kayıt, giriş, şifre sıfırlama
Alışveriş Sepeti ve Dilek Listesi: Parfümleri sepete veya dilek listesine ekleme
AI Chatbot: Kişiselleştirilmiş parfüm önerileri için AI destekli chatbot
Yorum ve Derecelendirme: Kullanıcıların parfümlere yorum ve puan vermesi
Benzer Parfümler: "Benzer parfümler" önerileri
Sosyal Paylaşım: Parfümleri sosyal medyada paylaşma
Teknoloji Yığını
Frontend: HTML, CSS, JavaScript
Backend: PHP
Veritabanı: MySQL
Kütüphaneler: Bootstrap, FontAwesome, SweetAlert2
API Endpoint'leri
Parfüm API'leri
api/get_perfumes.php: Parfümleri filtreleme ve sıralama ile getir
api/get_perfume.php: Tek bir parfümün detaylarını getir
api/get_similar_perfumes.php: Benzer parfümleri getir
api/get_aromas.php: Tüm aroma notalarını getir
api/get_perfumes_by_aroma.php: Aroma notalarına göre parfümleri getir
api/get_popular_perfumes.php: Popüler parfümleri getir
api/get_seasonal_perfumes.php: Mevsimsel parfümleri getir
Yorum API'leri
api/get_reviews.php: Bir parfüm için yorumları getir
api/add_review.php: Yeni bir yorum ekle
Kullanıcı API'leri
api/register.php: Yeni kullanıcı kaydı
api/login.php: Kullanıcı girişi
api/check_login.php: Giriş durumunu kontrol et
api/logout.php: Kullanıcı çıkışı
api/forgot_password.php: Şifre sıfırlama e-postası gönder
api/reset_password.php: Şifreyi sıfırla
Chatbot API'si
api/get_recommendation.php: Kullanıcı mesajına göre parfüm önerileri al
JavaScript Modülleri
navigation.js: Navigasyon çubuğu davranışı, düzgün kaydırma, mobil menü
filters.js: Parfüm filtreleme ve sıralama
cart-wishlist.js: Alışveriş sepeti ve dilek listesi işlevleri
perfume-details.js: Parfüm detay modalı ve ilgili işlevler
chatbot.js: AI chatbot arayüzü
auth.js: Kullanıcı kimlik doğrulama mantığı
