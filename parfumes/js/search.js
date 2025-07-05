/**
 * KAANI Perfume - Search Page JavaScript
 * Arama sayfası için özel JavaScript fonksiyonları
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Search page script loaded');
    
    // Sepete ekleme butonlarını ayarla
    setupAddToCartButtons();
    
    // İstek listesine ekleme butonlarını ayarla
    setupAddToWishlistButtons();
    
    // Detay butonlarını ayarla
    setupShowDetailsButtons();
});

/**
 * Sepete ekleme butonlarını ayarla
 */
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const perfumeId = this.getAttribute('data-id');
            const perfumeName = this.getAttribute('data-name');
            const perfumeBrand = this.getAttribute('data-brand');
            const perfumePrice = this.getAttribute('data-price');
            const perfumeImage = this.getAttribute('data-image');
            
            // Eğer window.addToCart fonksiyonu varsa kullan
            if (typeof window.addToCart === 'function') {
                window.addToCart(perfumeId);
                
                // Kullanıcıya bildirim göster
                showNotification(`${perfumeName} added to cart`, 'success');
            } else {
                // Sepet fonksiyonu yoksa manuel olarak ekle
                const cart = JSON.parse(localStorage.getItem('kaani_cart')) || [];
                
                // Ürünün sepette olup olmadığını kontrol et
                const existingItem = cart.findIndex(item => item.id === perfumeId);
                
                if (existingItem !== -1) {
                    // Ürün zaten sepette, miktarı artır
                    cart[existingItem].quantity += 1;
                } else {
                    // Ürünü sepete ekle
                    cart.push({
                        id: perfumeId,
                        name: perfumeName,
                        brand: perfumeBrand,
                        price: parseFloat(perfumePrice),
                        image: perfumeImage,
                        quantity: 1,
                        size: '50ml'
                    });
                }
                
                // Sepeti localStorage'a kaydet
                localStorage.setItem('kaani_cart', JSON.stringify(cart));
                
                // Sepet sayacını güncelle
                if (typeof window.updateCartCount === 'function') {
                    window.updateCartCount();
                }
                
                // Kullanıcıya bildirim göster
                showNotification(`${perfumeName} added to cart`, 'success');
            }
        });
    });
}

/**
 * İstek listesine ekleme butonlarını ayarla
 */
function setupAddToWishlistButtons() {
    const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist');
    
    addToWishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const perfumeId = this.getAttribute('data-id');
            const perfumeName = this.getAttribute('data-name');
            const perfumeBrand = this.getAttribute('data-brand');
            const perfumePrice = this.getAttribute('data-price');
            const perfumeImage = this.getAttribute('data-image');
            
            // Kullanıcının giriş yapmış olup olmadığını kontrol et
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (!isLoggedIn) {
                // Kullanıcı giriş yapmamışsa, giriş yapmasını veya üye olmasını iste
                Swal.fire({
                    title: 'Log in',
                    text: 'Please log in or sign up to add to your wishlist.',
                    icon: 'info',
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Login',
                    denyButtonText: 'Sign up',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#9c27b0',
                    denyButtonColor: '#28a745'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Header'daki giriş butonunu bul ve tıkla
                        const loginButton = document.getElementById('login-button');
                        if (loginButton) {
                            loginButton.click();
                        } else {
                            // Eğer buton bulunamazsa alternatif yöntem
                            if (typeof showLoginModal === 'function') {
                                showLoginModal();
                            } else {
                                window.location.href = 'login.php';
                            }
                        }
                    } else if (result.isDenied) {
                        // Header'daki üye ol butonunu bul ve tıkla
                        const registerButton = document.getElementById('register-button');
                        if (registerButton) {
                            registerButton.click();
                        } else {
                            // Eğer buton bulunamazsa alternatif yöntem
                            if (typeof showRegisterModal === 'function') {
                                showRegisterModal();
                            } else {
                                window.location.href = 'register.php';
                            }
                        }
                    }
                });
                return;
            }
            
            // İstek listesini localStorage'dan al
            const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
            
            // Ürünün istek listesinde olup olmadığını kontrol et
            const existingItemIndex = wishlist.findIndex(item => item.id === perfumeId);
            
            if (existingItemIndex !== -1) {
                // Ürün zaten istek listesinde, kaldır
                wishlist.splice(existingItemIndex, 1);
                showNotification(`${perfumeName} removed from your wishlist`, 'info');
                
                // Butonu güncelle
                this.innerHTML = '<i class="far fa-heart"></i>';
            } else {
                // Ürünü istek listesine ekle
                wishlist.push({
                    id: perfumeId,
                    name: perfumeName,
                    brand: perfumeBrand,
                    price: parseFloat(perfumePrice),
                    image: perfumeImage
                });
                
                showNotification(`${perfumeName} added to your wishlist`, 'success');
                
                // Butonu güncelle
                this.innerHTML = '<i class="fas fa-heart"></i>';
            }
            
            // İstek listesini localStorage'a kaydet
            localStorage.setItem('kaani_wishlist', JSON.stringify(wishlist));
            
            // İstek listesi sayacını güncelle
            if (typeof window.updateWishlistCount === 'function') {
                window.updateWishlistCount();
            }
        });
    });
    
    // İstek listesindeki ürünlerin butonlarını güncelle
    updateWishlistButtonsState();
}

/**
 * İstek listesi butonlarının durumunu güncelle
 */
function updateWishlistButtonsState() {
    const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    
    wishlistButtons.forEach(button => {
        const perfumeId = button.getAttribute('data-id');
        const isInWishlist = wishlist.some(item => item.id === perfumeId);
        
        if (isInWishlist) {
            button.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            button.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

/**
 * Bildirim göster
 * @param {string} message - Bildirim mesajı
 * @param {string} type - Bildirim tipi (success, error, info, warning)
 */
/**
 * Detay butonlarını ayarla
 */
function setupShowDetailsButtons() {
    const detailButtons = document.querySelectorAll('.show-details');
    const modal = new bootstrap.Modal(document.getElementById('perfumeDetailsModal'));
    
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Parfüm verilerini butondan al
            const perfumeId = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const brand = this.getAttribute('data-brand');
            const notes = this.getAttribute('data-notes');
            const description = this.getAttribute('data-description');
            const gender = this.getAttribute('data-gender');
            const season = this.getAttribute('data-season');
            const rating = this.getAttribute('data-rating');
            const ratingCount = this.getAttribute('data-rating-count');
            const price30ml = parseFloat(this.getAttribute('data-price-30ml'));
            const price50ml = parseFloat(this.getAttribute('data-price-50ml'));
            const price100ml = parseFloat(this.getAttribute('data-price-100ml'));
            const image = this.getAttribute('data-image');
            
            // Modal içeriğini güncelle
            const modalImage = document.querySelector('.perfume-modal-image img');
            modalImage.src = image;
            modalImage.alt = name;
            
            document.querySelector('.perfume-modal-name').textContent = name;
            document.querySelector('.perfume-modal-brand').textContent = brand;
            
            // Cinsiyet badge'ini güncelle
            const genderBadge = document.querySelector('.perfume-modal-gender');
            if (gender) {
                let genderText = '';
                switch(gender) {
                    case 'male': genderText = 'Male'; break;
                    case 'female': genderText = 'Female'; break;
                    case 'unisex': genderText = 'Unisex'; break;
                    default: genderText = gender; break;
                }
                genderBadge.textContent = genderText;
                genderBadge.style.display = 'inline-block';
            } else {
                genderBadge.style.display = 'none';
            }
            
            // Sezon badge'ini güncelle
            const seasonBadge = document.querySelector('.perfume-modal-season');
            if (season && season !== 'all') {
                let seasonText = '';
                switch(season) {
                    case 'summer': seasonText = 'Summer'; break;
                    case 'winter': seasonText = 'Winter'; break;
                    case 'spring': seasonText = 'Spring'; break;
                    case 'autumn': seasonText = 'Autumn'; break;
                    default: seasonText = season; break;
                }
                seasonBadge.textContent = seasonText;
                seasonBadge.style.display = 'inline-block';
            } else {
                seasonBadge.style.display = 'none';
            }
            
            // Yıldızları güncelle
            const starsContainer = document.querySelector('.perfume-modal-rating .stars');
            starsContainer.innerHTML = '';
            const ratingValue = parseFloat(rating);
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = i <= ratingValue ? 'fas fa-star' : 'far fa-star';
                star.style.color = '#ffc107';
                star.style.marginRight = '2px';
                starsContainer.appendChild(star);
            }
            
            // Değerlendirme sayısını güncelle
            document.querySelector('.perfume-modal-rating .rating-count').textContent = `(${ratingCount} review)`;
            
            // Açıklama ve notları güncelle
            const descriptionElement = document.querySelector('.perfume-modal-description p');
            if (description && description.trim() !== '') {
                descriptionElement.textContent = description;
                document.querySelector('.perfume-modal-description').style.display = 'block';
            } else {
                document.querySelector('.perfume-modal-description').style.display = 'none';
            }
            
            const notesElement = document.querySelector('.perfume-modal-notes p');
            if (notes && notes.trim() !== '') {
                notesElement.textContent = notes;
                document.querySelector('.perfume-modal-notes').style.display = 'block';
            } else {
                document.querySelector('.perfume-modal-notes').style.display = 'none';
            }
            
            // Fiyatları güncelle
            const priceList = document.querySelector('.perfume-modal-prices .price-list');
            priceList.innerHTML = '';
            
            if (price30ml > 0) {
                const price30Element = document.createElement('p');
                price30Element.className = 'mb-1';
                price30Element.innerHTML = `<strong>30ml:</strong> ${price30ml.toLocaleString('tr-TR')} TL`;
                priceList.appendChild(price30Element);
            }
            
            if (price50ml > 0) {
                const price50Element = document.createElement('p');
                price50Element.className = 'mb-1';
                price50Element.innerHTML = `<strong>50ml:</strong> ${price50ml.toLocaleString('tr-TR')} TL`;
                priceList.appendChild(price50Element);
            }
            
            if (price100ml > 0) {
                const price100Element = document.createElement('p');
                price100Element.className = 'mb-1';
                price100Element.innerHTML = `<strong>100ml:</strong> ${price100ml.toLocaleString('tr-TR')} TL`;
                priceList.appendChild(price100Element);
            }
            
            // Sepete ekle ve istek listesine ekle butonlarını güncelle
            const addToCartButton = document.querySelector('.add-to-cart-modal');
            addToCartButton.setAttribute('data-id', perfumeId);
            addToCartButton.setAttribute('data-name', name);
            addToCartButton.setAttribute('data-brand', brand);
            addToCartButton.setAttribute('data-price', price50ml > 0 ? price50ml : price30ml);
            addToCartButton.setAttribute('data-image', image);
            
            // Önceki event listener'ları temizle ve yeniden ekle
            addToCartButton.replaceWith(addToCartButton.cloneNode(true));
            const newAddToCartButton = document.querySelector('.add-to-cart-modal');
            
            newAddToCartButton.addEventListener('click', function() {
                if (typeof window.addToCart === 'function') {
                    window.addToCart(perfumeId);
                    showNotification(`${name} added to cart`, 'success');
                }
            });
            
            const addToWishlistButton = document.querySelector('.add-to-wishlist-modal');
            addToWishlistButton.setAttribute('data-id', perfumeId);
            addToWishlistButton.setAttribute('data-name', name);
            addToWishlistButton.setAttribute('data-brand', brand);
            addToWishlistButton.setAttribute('data-price', price50ml > 0 ? price50ml : price30ml);
            addToWishlistButton.setAttribute('data-image', image);
            
            // İstek listesinde olup olmadığını kontrol et
            const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
            const isInWishlist = wishlist.some(item => item.id === perfumeId);
            
            if (isInWishlist) {
                addToWishlistButton.innerHTML = '<i class="fas fa-heart"></i> Remove from WishList';
            } else {
                addToWishlistButton.innerHTML = '<i class="far fa-heart"></i> Add to WishList';
            }
            
            // Önceki event listener'ları temizle ve yeniden ekle
            addToWishlistButton.replaceWith(addToWishlistButton.cloneNode(true));
            const newAddToWishlistButton = document.querySelector('.add-to-wishlist-modal');
            
            newAddToWishlistButton.addEventListener('click', function() {
                const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
                const existingItemIndex = wishlist.findIndex(item => item.id === perfumeId);
                
                if (existingItemIndex !== -1) {
                    wishlist.splice(existingItemIndex, 1);
                    this.innerHTML = '<i class="far fa-heart"></i> Add to WishList';
                    showNotification(`${name} Removed from wishlist`, 'info');
                } else {
                    wishlist.push({
                        id: perfumeId,
                        name: name,
                        brand: brand,
                        price: parseFloat(price50ml > 0 ? price50ml : price30ml),
                        image: image
                    });
                    this.innerHTML = '<i class="fas fa-heart"></i> Removed from wishlist';
                    showNotification(`${name} Added to WishList`, 'success');
                }
                
                localStorage.setItem('kaani_wishlist', JSON.stringify(wishlist));
                
                if (typeof window.updateWishlistCount === 'function') {
                    window.updateWishlistCount();
                }
            });
            
            // Modalı göster
            modal.show();
        });
    });
}

function showNotification(message, type = 'info') {
    // Mevcut bildirim konteynerini kontrol et
    let notificationContainer = document.querySelector('.notification-container');
    
    // Konteyner yoksa oluştur
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Konteyner stilini ekle
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
    }
    
    // Bildirim elementi oluştur
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    // Bildirim stilini ekle
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : 
                                         type === 'error' ? '#f44336' : 
                                         type === 'warning' ? '#ff9800' : '#2196f3';
    notification.style.color = '#fff';
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'all 0.3s ease';
    
    // Bildirim konteynerine ekle
    notificationContainer.appendChild(notification);
    
    // Animasyon için setTimeout kullan
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Belirli bir süre sonra bildirim kaybolsun
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        // Animasyon bittikten sonra elementi kaldır
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
