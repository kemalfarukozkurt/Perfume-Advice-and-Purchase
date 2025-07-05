/**
 * KAANI Perfume - Wishlist JavaScript
 * İstek listesi işlevselliği için JavaScript dosyası
 */

document.addEventListener('DOMContentLoaded', function() {
    // İstek listesi sayfasında olup olmadığımızı kontrol et
    window.isWishlistPage = window.location.pathname.includes('wishlist.php');
    
    // İstek listesi sayacını güncelle
    window.updateWishlistCount = function() {
        const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
        const wishlistCount = document.getElementById('wishlist-count');
        
        if (wishlistCount) {
            const count = wishlist.length;
            wishlistCount.textContent = count;
            
            // Sayaç görünürlüğünü ayarla
            if (count > 0) {
                wishlistCount.style.display = 'inline-flex';
                wishlistCount.classList.add('count-badge');
            } else {
                wishlistCount.style.display = 'none';
                wishlistCount.classList.remove('count-badge');
            }
            
            // Wishlist icon butonunu da güncelle
            const wishlistLinkIcon = document.getElementById('wishlist-link-icon');
            if (wishlistLinkIcon) {
                if (count > 0) {
                    wishlistLinkIcon.classList.add('active');
                } else {
                    wishlistLinkIcon.classList.remove('active');
                }
            }
            
            console.log('Wishlist count updated:', count);
        } else {
            console.warn('Wishlist count not found!');
        }
    };
    
    // İstek listesi butonlarını güncelle
    window.updateWishlistButtons = function() {
        const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        
        wishlistButtons.forEach(button => {
            const perfumeId = button.getAttribute('data-id');
            const isInWishlist = wishlist.some(item => item.id.toString() === perfumeId.toString());
            const icon = button.querySelector('i');
            
            if (icon) {
                icon.className = isInWishlist ? 'fas fa-heart' : 'far fa-heart';
            }
        });
    };
    
    // İstek listesi öğelerini render et
    window.renderWishlistItems = function() {
        if (!window.isWishlistPage) return;
        
        const tableContainer = document.getElementById('wishlist-items-table');
        const emptyWishlist = document.getElementById('empty-wishlist');
        const loadingSpinner = document.getElementById('wishlist-loading');
        const wishlistContent = document.querySelector('.wishlist-content');
        
        if (!tableContainer) {
            console.error('İstek listesi tablo container bulunamadı!');
            return;
        }
        
        // Yükleniyor göster
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (tableContainer) tableContainer.innerHTML = '';
        
        // İstek listesini al
        const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
        
        // Yükleniyor gizle
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        
        // İstek listesi boş mu kontrol et
        if (wishlist.length === 0) {
            console.log('Wishlist is empty, showing empty wishlist message...');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (emptyWishlist) emptyWishlist.style.display = 'block';
            if (wishlistContent) wishlistContent.style.display = 'none';
            return;
        }
        
        // İstek listesi dolu, içeriği göster
        console.log('Wishlist is not empty, showing content...');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (emptyWishlist) emptyWishlist.style.display = 'none';
        if (wishlistContent) wishlistContent.style.display = 'block';
        
        // İstek listesi öğelerini render et
        wishlist.forEach((item, index) => {
            // Resim URL'sini kontrol et
            let imageUrl = item.image_url || 'images/perfumes/default.jpg';
            
            // Fiyat bilgilerini hazırla
            const price30ml = item.price_of_30ml !== undefined ? parseFloat(item.price_of_30ml) : 299;
            const price50ml = item.price_of_50ml !== undefined ? parseFloat(item.price_of_50ml) : 438;
            
            // Her parfüm için tek satır oluştur
            const row = document.createElement('tr');
            row.className = 'border-bottom';
            row.innerHTML = `
                <td class="py-3">
                    <a href="javascript:void(0)" class="perfume-detail-link" data-id="${item.id}" title="${item.name} detaylarını görüntüle">
                        <img src="${imageUrl}" alt="${item.name}" 
                             style="width: 70px; height: 70px; object-fit: cover; cursor: pointer;" 
                             onerror="this.src='images/perfumes/default.jpg'">
                    </a>
                </td>
                <td class="py-3">
                    <div class="fw-bold">
                        <a href="javascript:void(0)" class="perfume-detail-link text-decoration-none" data-id="${item.id}">${item.name}</a>
                    </div>
                    <div class="text-muted">${item.brand || 'Odin'}</div>
                </td>
                <td class="py-3">
                    <div class="notes-container">
                        <div class="fw-bold mb-2"></div>
                        <div class="text-muted">${item.notes || 'No note information available for this perfume. Perfume notes are the top, middle, and base notes that define the scent character. Top notes create the first impression, middle notes represent the heart of the perfume, and base notes leave the lasting impression.'}</div>
                    </div>
                </td>
                <td class="py-3">
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-info add-to-cart-btn text-white" data-id="${item.id}" data-name="${item.name}" data-price="${price30ml}" data-size="30ml">
                            <i class="fas fa-shopping-cart"></i> 30ml
                        </button>
                        <button class="btn btn-sm btn-info add-to-cart-btn text-white" data-id="${item.id}" data-name="${item.name}" data-price="${price50ml}" data-size="50ml">
                            <i class="fas fa-shopping-cart"></i> 50ml
                        </button>
                        <button class="btn btn-sm btn-outline-danger remove-from-wishlist" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableContainer.appendChild(row);
        });
        
        // Parfüm detay linklerine tıklama olayı ekle
        const detailLinks = document.querySelectorAll('.perfume-detail-link');
        detailLinks.forEach(link => {
            link.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                console.log('Parfüm detay modalı açılıyor:', perfumeId);
                
                // openPerfumeModal fonksiyonu perfume-details.js'de tanımlı
                if (typeof window.openPerfumeModal === 'function') {
                    window.openPerfumeModal(perfumeId);
                } else {
                    console.error('openPerfumeModal fonksiyonu bulunamadı');
                    alert('Parfüm detayları görüntülenemiyor. Lütfen sayfayı yenileyip tekrar deneyin.');
                }
            });
        });
        
        // İstek listesinden kaldır butonlarına tıklama olayı ekle
        const removeButtons = document.querySelectorAll('.remove-from-wishlist');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                window.toggleWishlist(perfumeId);
                
                // Tüm aynı ID'ye sahip satırları bul ve kaldır
                const rows = document.querySelectorAll(`tr .remove-from-wishlist[data-id="${perfumeId}"]`);
                rows.forEach(btn => {
                    const row = btn.closest('tr');
                    if (row) {
                        row.style.transition = 'all 0.3s ease';
                        row.style.opacity = '0';
                        setTimeout(() => {
                            row.remove();
                            
                            // İstek listesi boşsa mesajı göster
                            const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
                            const tableContainer = document.getElementById('wishlist-items-table');
                            const emptyWishlist = document.getElementById('empty-wishlist');
                            const wishlistContent = document.querySelector('.wishlist-content');
                            
                            if (wishlist.length === 0) {
                                if (tableContainer) tableContainer.innerHTML = '';
                                if (emptyWishlist) emptyWishlist.style.display = 'block';
                                if (wishlistContent) wishlistContent.style.display = 'none';
                            }
                        }, 300);
                    }
                });
            });
        });
        
        // Sepete ekle butonlarına tıklama olayı ekle
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                const perfumeName = this.getAttribute('data-name');
                const perfumeSize = this.getAttribute('data-size');
                
                window.addToCart(perfumeId, perfumeSize);
                
                Swal.fire({
                    title: 'Added to Cart',
                    text: `${perfumeName} (${perfumeSize}) has been added to your cart.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            });
        });
    };
    
    // İstek listesini temizleme fonksiyonu
    window.clearWishlist = function() {
        console.log('clearWishlist fonksiyonu çağrıldı');
        
        // İstek listesini boşalt
        localStorage.setItem('kaani_wishlist', JSON.stringify([]));
        
        // İstek listesi sayacını güncelle
        window.updateWishlistCount();
        
        // İstek listesi sayfasını yeniden render et
        if (window.isWishlistPage) {
            const tableContainer = document.getElementById('wishlist-items-table');
            const emptyWishlist = document.getElementById('empty-wishlist');
            const wishlistContent = document.querySelector('.wishlist-content');
            
            // İçeriği temizle
            if (tableContainer) tableContainer.innerHTML = '';
            
            // Boş istek listesi mesajını göster, içeriği gizle
            if (emptyWishlist) emptyWishlist.style.display = 'block';
            if (wishlistContent) wishlistContent.style.display = 'none';
        }
        
        // Başarı mesajı göster
        Swal.fire({
            title: 'Wishlist Cleared!',
            text: 'Your wishlist has been completely emptied.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    };
    
    // Sayfa yüklendiğinde istek listesini göster ve butonları ayarla
    if (window.isWishlistPage) {
        window.renderWishlistItems();
        
        // Tüm istek listesini temizle butonu için olay dinleyicisi
        const clearWishlistBtn = document.getElementById('clear-wishlist');
        if (clearWishlistBtn) {
            clearWishlistBtn.addEventListener('click', function() {
                Swal.fire({
                    title: 'Clear Wishlist',
                    text: 'Are you sure you want to clear your entire wishlist?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#9c27b0',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Yes, Clear',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.clearWishlist();
                    }
                });
            });
        }
    }
    
    // İstek listesi sayacını güncelle
    window.updateWishlistCount();
    
    // İstek listesi butonlarını güncelle
    window.updateWishlistButtons();
});
