/**
 * KAANI Perfume - Clear Wishlist Data
 * Bu script istek listesi verilerini temizler
 */

document.addEventListener('DOMContentLoaded', function() {
    // LocalStorage'dan istek listesi verilerini temizle
    localStorage.removeItem('kaani_wishlist');
    
    // İstek listesi sayacını sıfırla
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = '0';
        wishlistCount.style.display = 'none';
    }
    
    // İstek listesi butonlarını güncelle
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    wishlistButtons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = 'far fa-heart';
        }
    });
    
    console.log('Wishlist data cleared');
});
