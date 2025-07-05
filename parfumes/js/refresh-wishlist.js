/**
 * KAANI Perfume - Wishlist Refresh Script
 * Bu script, mevcut istek listesindeki parfümleri güncelleyerek notaların görünmesini sağlar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mevcut istek listesini al
    const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
    
    if (wishlist.length === 0) {
        console.log('The wishlist is empty, no updates have been made.');
        return;
    }
    
    console.log('Wishlist is being updated...', wishlist.length, 'there are perfumes.');
    
    // Her bir parfüm için API'den bilgileri al ve güncelle
    const refreshPromises = wishlist.map(item => {
        return fetch(`api/get_perfume.php?id=${item.id}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.success && data.perfume) {
                    const perfume = data.perfume;
                    
                    // Parfüm bilgilerini güncelle
                    item.notes = perfume.notes || perfume.description || '';
                    item.price_of_30ml = perfume.price_of_30ml || perfume.price_30ml || perfume.price30ml || 0;
                    item.price_of_50ml = perfume.price_of_50ml || perfume.price_50ml || perfume.price50ml || perfume.price || 0;
                    
                    console.log(`${perfume.name} parfümü güncellendi, notlar:`, item.notes.substring(0, 50) + '...');
                    return item;
                } else {
                    console.error('Parfüm bilgisi alınamadı:', item.id);
                    return item;
                }
            })
            .catch(error => {
                console.error('API hatası:', error);
                return item;
            });
    });
    
    // Tüm güncellemeleri bekle
    Promise.all(refreshPromises)
        .then(updatedWishlist => {
            // Güncellenmiş istek listesini kaydet
            localStorage.setItem('kaani_wishlist', JSON.stringify(updatedWishlist));
            
            // İstek listesi sayfasındaysa, sayfayı yeniden yükle
            if (window.location.pathname.includes('wishlist.php')) {
                window.renderWishlistItems();
                
                // Başarı mesajını kaldırdık
            }
            
            console.log('İstek listesi güncelleme tamamlandı.');
        });
});
