/**
 * KAANI Perfume - Perfume Details and Modal Functions
 */

// Login ve Register modallarını gösterme fonksiyonları
function showLoginModal() {
    // Bootstrap modal'ı göster
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showRegisterModal() {
    // Bootstrap modal'ı göster
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
}

// Sepete ekle fonksiyonu - cart-wishlist.js yüklenmezse yedek olarak kullanılır
if (typeof addToCart !== 'function') {
    window.addToCart = function(perfumeId, size = '50ml') {
        console.log('Yedek addToCart fonksiyonu çağrıldı - ID:', perfumeId, 'Size:', size);
        
        // ID'yi string'e çevir
        perfumeId = perfumeId ? perfumeId.toString() : '';
        
        if (!perfumeId || perfumeId === 'undefined' || perfumeId === '') {
            console.error('Geçersiz perfumeId:', perfumeId);
            Swal.fire({
                title: 'Hata',
                text: 'Ürün bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
                icon: 'error',
                confirmButtonText: 'Tamam',
                confirmButtonColor: '#9c27b0'
            });
            return;
        }
        
        // Get perfume details from API
        fetch(`api/get_perfume.php?id=${perfumeId}`)
            .then(response => response.json())
            .then(data => {
                // API yanıtını kontrol et
                console.log('API yanıtı:', data);
                
                // Başarı durumunu kontrol et
                if (!data.success) {
                    throw new Error(data.message || 'Parfüm bilgisi alınamadı');
                }
                
                // Parfüm verisini al
                const perfume = data.perfume;
                
                if (!perfume || !perfume.name) {
                    throw new Error('Parfüm verisi geçersiz');
                }
                
                console.log('Parfüm bilgisi alındı:', perfume);
                
                // Sepet verilerini al
                let cart = JSON.parse(localStorage.getItem('kaani_cart')) || [];
                
                // Check if already in cart
                const existingItem = cart.find(item => item.id.toString() === perfumeId.toString() && item.size === size);
                
                if (existingItem) {
                    // Increment quantity
                    existingItem.quantity += 1;
                    console.log('The current product quantity has been increased:', existingItem);
                } else {
                    // Add new item
                    const price = size === '30ml' ? parseFloat(perfume.price_of_30ml) : parseFloat(perfume.price_of_50ml);
                    
                    cart.push({
                        id: perfumeId,
                        name: perfume.name,
                        brand: perfume.brand,
                        image: perfume.image_url,
                        price: price,
                        size: size,
                        quantity: 1
                    });
                }
                
                // Save to localStorage
                localStorage.setItem('kaani_cart', JSON.stringify(cart));
                
                // Update cart count
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    const count = cart.reduce((total, item) => total + item.quantity, 0);
                    cartCount.textContent = count;
                    cartCount.style.display = count > 0 ? 'inline-flex' : 'none';
                }
                
                // Sepet sayfasındaysak, sepet içeriğini güncelle
                if (window.isCartPage && typeof window.renderCartItems === 'function') {
                    window.renderCartItems();
                }
                
                // Show success message
                Swal.fire({
                    title: 'Added to Cart',
                    text: `${perfume.name} added to your cart.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while adding to cart. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#9c27b0'
                });
            });
    };
}

// İstek listesi fonksiyonu
if (typeof toggleWishlist !== 'function') {
    window.toggleWishlist = function(perfumeId) {
        console.log('İstek listesi fonksiyonu çağrıldı - ID:', perfumeId);
        
        // ID'yi string'e çevir
        perfumeId = perfumeId ? perfumeId.toString() : '';
        
        if (!perfumeId || perfumeId === 'undefined' || perfumeId === '') {
            console.error('Geçersiz perfumeId:', perfumeId);
            Swal.fire({
                title: 'Error',
                text: 'Ürün bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
                icon: 'error',
                confirmButtonText: 'Tamam',
                confirmButtonColor: '#9c27b0'
            });
            return;
        }
        
        // İstek listesi verilerini al
        let wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
        
        // Ürünün istek listesinde olup olmadığını kontrol et
        const index = wishlist.findIndex(item => item.id.toString() === perfumeId.toString());
        
        if (index !== -1) {
            // İstek listesinden kaldır
            wishlist.splice(index, 1);
            
            // LocalStorage'a kaydet
            localStorage.setItem('kaani_wishlist', JSON.stringify(wishlist));
            
            // İstek listesi butonlarını güncelle
            const wishlistButtons = document.querySelectorAll(`.wishlist-btn[data-id="${perfumeId}"]`);
            wishlistButtons.forEach(button => {
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'far fa-heart';
                }
                // Modal içindeki butonun sınıfını ve title özelliğini güncelle
                button.className = 'wishlist-btn btn btn-outline-danger';
                button.title = 'Add to WishList';
                // İçeriği temizle ve sadece ikonu ekle
                button.innerHTML = '';
                button.appendChild(icon);
            });
            
            // İstek listesi sayacını hemen güncelle
            const wishlistCount = document.getElementById('wishlist-count');
            if (wishlistCount) {
                const count = wishlist.length;
                wishlistCount.textContent = count;
                
                // Sayacın görünürlüğünü ayarla
                if (count > 0) {
                    wishlistCount.style.display = 'inline-flex';
                    wishlistCount.classList.add('count-badge');
                } else {
                    wishlistCount.style.display = 'none';
                    wishlistCount.classList.remove('count-badge');
                }
            }
            
            // Başarı mesajı göster
            Swal.fire({
                title: 'Removed from Wishlist',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        } else {
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
            
            // API'den parfüm bilgilerini al
            fetch(`api/get_perfume.php?id=${perfumeId}`)
                .then(response => response.json())
                .then(data => {
                    // API yanıtını kontrol et
                    console.log('API yanıtı (wishlist):', data);
                    
                    // Başarı durumunu kontrol et
                    if (data && data.success && data.perfume) {
                        const perfume = data.perfume;
                        
                        if (!perfume || !perfume.name) {
                            throw new Error('Parfüm verisi geçersiz');
                        }
                        
                        // Resim URL'sini kontrol et ve tam URL oluştur
                        let imageUrl = perfume.image_url || perfume.image || perfume.Image || '';
                        
                        // Eğer resim URL'si yoksa veya geçersizse
                        if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null' || imageUrl === '') {
                            imageUrl = 'images/perfumes/default.jpg';
                        }
                        
                        // Eğer resim URL'si göreceli bir yolsa, tam yola çevir
                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                            // Eğer images/perfumes/ ile başlamıyorsa ekle
                            if (!imageUrl.startsWith('images/perfumes/')) {
                                // Eğer sadece dosya adı ise (uzantı içeriyorsa)
                                if (imageUrl.includes('.jpg') || imageUrl.includes('.png') || imageUrl.includes('.jpeg') || imageUrl.includes('.gif')) {
                                    imageUrl = 'images/perfumes/' + imageUrl;
                                } else {
                                    // Uzantı yoksa .jpg ekle
                                    imageUrl = 'images/perfumes/' + imageUrl + '.jpg';
                                }
                            }
                        }
                        
                        // Fiyat bilgisini al
                        const price50ml = perfume.price_of_50ml || perfume.price_50ml || perfume.price50ml || perfume.price || 0;
                        
                        // İstek listesine ekle
                        wishlist.push({
                            id: perfumeId,
                            name: perfume.name,
                            brand: perfume.brand,
                            price: parseFloat(price50ml),
                            image_url: imageUrl,
                            notes: perfume.notes || perfume.description || '',
                            price_of_30ml: perfume.price_of_30ml || perfume.price_30ml || perfume.price30ml || 0,
                            price_of_50ml: perfume.price_of_50ml || perfume.price_50ml || perfume.price50ml || perfume.price || 0,
                            added_at: new Date().toISOString()
                        });
                        
                        // LocalStorage'a kaydet
                        localStorage.setItem('kaani_wishlist', JSON.stringify(wishlist));
                        
                        // İstek listesi butonlarını güncelle
                        const wishlistButtons = document.querySelectorAll(`.wishlist-btn[data-id="${perfumeId}"]`);
                        wishlistButtons.forEach(button => {
                            const icon = button.querySelector('i');
                            if (icon) {
                                icon.className = 'fas fa-heart';
                            }
                            // Modal içindeki butonun sınıfını ve title özelliğini güncelle
                            button.className = 'wishlist-btn btn btn-danger';
                            button.title = 'Remove from Wishlist';
                            // İçeriği temizle ve sadece ikonu ekle
                            button.innerHTML = '';
                            button.appendChild(icon);
                        });
                        
                        // İstek listesi sayacını hemen güncelle
                        const wishlistCount = document.getElementById('wishlist-count');
                        if (wishlistCount) {
                            const count = wishlist.length;
                            wishlistCount.textContent = count;
                            
                            // Sayacın görünürlüğünü ayarla
                            if (count > 0) {
                                wishlistCount.style.display = 'inline-flex';
                                wishlistCount.classList.add('count-badge');
                            } else {
                                wishlistCount.style.display = 'none';
                                wishlistCount.classList.remove('count-badge');
                            }
                            
                            // Wishlist icon butonunu da güncelle
                            const wishlistLinkIcon = document.getElementById('wishlist-link-icon');
                            if (wishlistLinkIcon && count > 0) {
                                wishlistLinkIcon.classList.add('active');
                            }
                        }
                        
                        // Başarı mesajı göster
                        Swal.fire({
                            title: 'Added to Wishlist',
                            text: `${perfume.name} added to your wishlist.`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            position: 'top-end',
                            toast: true
                        });
                    } else {
                        throw new Error(data.message || 'Perfume information not available');
                    }
                })
                .catch(error => {
                    console.error('Error adding to wishlist:', error);
                    
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while adding to your wishlist. Please try again later.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#9c27b0'
                    });
                });
        }
        
        // İstek listesi sayısını güncelle
        if (typeof window.updateWishlistCount === 'function') {
            window.updateWishlistCount();
        } else {
            const wishlistCount = document.getElementById('wishlist-count');
            if (wishlistCount) {
                const count = wishlist.length;
                wishlistCount.textContent = count;
                wishlistCount.style.display = count > 0 ? 'inline-flex' : 'none';
            }
        }
        
        // İstek listesi butonlarını güncelle
        if (typeof window.updateWishlistButtons === 'function') {
            window.updateWishlistButtons();
        }
        
        // İstek listesi sayfasındaysak, içeriği güncelle
        if (window.isWishlistPage && typeof window.renderWishlistItems === 'function') {
            window.renderWishlistItems();
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Perfume modal elements
    const perfumeModal = document.getElementById('perfumeModal');
    const perfumeModalContent = document.getElementById('perfumeModalContent');
    const perfumeModalClose = document.querySelector('#perfumeModal .btn-close');
    
    // Event delegation for perfume cards
    document.addEventListener('click', function(e) {
        // Check if clicked element is a view perfume button or its parent
        const viewButton = e.target.closest('.view-perfume');
        if (viewButton) {
            const perfumeId = viewButton.dataset.id;
            openPerfumeModal(perfumeId);
        }
    });
    
    // Close modal when clicking close button
    if (perfumeModalClose) {
        perfumeModalClose.addEventListener('click', closePerfumeModal);
    }
    
    // Close modal when clicking outside
    if (perfumeModal) {
        perfumeModal.addEventListener('click', function(e) {
            if (e.target === perfumeModal) {
                closePerfumeModal();
            }
        });
    }
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && perfumeModal && perfumeModal.classList.contains('open')) {
            closePerfumeModal();
        }
    });
    
    // Function to generate rating stars
    function generateRatingStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
    
    // Open perfume modal
    window.openPerfumeModal = function(perfumeId) {
        // Önce varsa eski modal arkaplanını temizle
        const existingBackdrop = document.querySelector('.modal-backdrop');
        if (existingBackdrop) {
            existingBackdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        
        // Show loading state
        if (perfumeModalContent) {
            perfumeModalContent.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
        }
        
        // Open modal
        if (perfumeModal) {
            try {
                const bsModal = new bootstrap.Modal(perfumeModal, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                bsModal.show();
            } catch (error) {
                console.error('Modal açılırken hata oluştu:', error);
                // Modal açılamazsa temizlik yap
                closePerfumeModal();
            }
        }
        
        // Fetch perfume details from API
        fetch(`api/get_perfume.php?id=${perfumeId}`)
            .then(response => {
                // Önce yanıtın başarılı olup olmadığını kontrol et
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                // Yanıtın geçerli JSON olup olmadığını kontrol et
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Invalid JSON response:', text);
                    throw new Error('Invalid JSON response');
                }
            })
            .then(data => {
                console.log('Parfüm verileri alındı:', data);
                renderPerfumeModal(data);
                
                // Fetch similar perfumes
                return fetch(`api/get_similar_perfumes.php?id=${perfumeId}`);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Invalid JSON response for similar perfumes:', text);
                    throw new Error('Invalid JSON response');
                }
            })
            .then(data => {
                if (data && data.success && data.perfumes) {
                    renderSimilarPerfumes(data.perfumes);
                }
                
                // Fetch reviews
                return fetch(`api/get_reviews.php?perfume_id=${perfumeId}`);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Invalid JSON response for reviews:', text);
                    // Yorumlar olmasa da devam edebiliriz
                    return { success: true, reviews: [] };
                }
            })
            .then(data => {
                if (data && data.success && data.reviews) {
                    renderReviews(data.reviews);
                }
            })
            .catch(error => {
                console.error('Error loading perfume details:', error);
                
                if (perfumeModalContent) {
                    perfumeModalContent.innerHTML = `
                        <div class="text-center p-5">
                            <div class="alert alert-danger">
                                <h5>Parfüm detayları yüklenirken bir hata oluştu.</h5>
                                <p>${error.message || 'Lütfen daha sonra tekrar deneyin.'}</p>
                            </div>
                            <button class="btn btn-primary mt-3" onclick="closePerfumeModal()">Kapat</button>
                        </div>
                    `;
                }
            });
    };
    
    // Close perfume modal
    function closePerfumeModal() {
        if (perfumeModal) {
            const bsModal = bootstrap.Modal.getInstance(perfumeModal);
            if (bsModal) {
                bsModal.hide();
            }
            
            // Modal arkaplanını temizle
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Overflow'u geri aç
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }
    
    // Render perfume modal content
    window.renderPerfumeModal = function(response) {
        if (!response || !response.perfume) {
            console.error('Perfume data not found');
            return;
        }
        
        // API yanıtından parfüm verilerini çıkar
        if (!response || !response.success || !response.perfume) {
            perfumeModalContent.innerHTML = '<div class="text-center p-5">Parfüm detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</div>';
            return;
        }
        
        const perfume = response.perfume;
        console.log('Parfüm verileri:', perfume); // Hata ayıklama için konsola yazdır
        console.log('Parfüm ID:', perfume.id);
        console.log('Parfüm ID tipi:', typeof perfume.id);
        
        // ID değerini string'e çevir
        const perfumeId = perfume.id ? perfume.id.toString() : '';
        console.log('String olarak parfüm ID:', perfumeId);
        
        const genderText = {
            'male': 'Male',
            'female': 'Female',
            'unisex': 'Unisex'
        };
        
        const seasonText = {
            'summer': 'Summer',
            'winter': 'Winter',
            'spring': 'Spring',
            'autumn': 'Autumn',
            'all': 'All Seasons'
        };
        
        // Format notes
        const notes = perfume.notes ? perfume.notes.split(',').map(note => note.trim()) : [];
        const notesHtml = notes.length > 0 
            ? `<div class="perfume-notes-list">
                ${notes.map(note => `<span class="note-tag">${note}</span>`).join('')}
               </div>`
            : '';
        
        // İstek listesinde olup olmadığını kontrol et
        const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
        const isInWishlist = wishlist.some(item => item.id.toString() === perfume.id.toString());
        const wishlistIconClass = isInWishlist ? 'fas fa-heart' : 'far fa-heart';
        
        // Resim URL'sini kontrol et
        const imageUrl = perfume.image_url || 'images/perfumes/default.jpg';
        
        // Fiyatları kontrol et ve formatla
        const price30ml = perfume.price_of_30ml ? parseFloat(perfume.price_of_30ml).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0,00';
        const price50ml = perfume.price_of_50ml ? parseFloat(perfume.price_of_50ml).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0,00';
        
        perfumeModalContent.innerHTML = `
            <div class="perfume-modal-header">
                <h2>${perfume.name || 'Perfume Name'}</h2>
                <p class="perfume-brand">${perfume.brand || 'Brand'}</p>
            </div>
            <div class="perfume-modal-body">
                <div class="row">
                    <div class="col-md-5">
                        <div class="perfume-modal-img">
                            <img src="${imageUrl}" alt="${perfume.name || 'Perfume'}" onerror="this.src='images/perfumes/default.jpg'">
                        </div>
                        
                        
                        
                        
                        
                        <h4 class="mt-3">Share</h4>
                        <div class="share-buttons">
                            <a href="#" class="share-btn facebook" onclick="sharePerfume('${perfumeId}', 'facebook'); return false;">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" class="share-btn twitter" onclick="sharePerfume('${perfumeId}', 'twitter'); return false;">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="#" class="share-btn whatsapp" onclick="sharePerfume('${perfumeId}', 'whatsapp'); return false;">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div class="perfume-modal-info">
                            <div class="rating mb-3">
                                ${generateRatingStars(perfume.rating || 0)}
                                <span class="rating-count">(${perfume.rating_count || 0} review)</span>
                            </div>
                            
                            <div class="perfume-badges mb-3">
                                <span class="perfume-gender">${genderText[perfume.gender] || 'Unisex'}</span>
                                <span class="perfume-season">${seasonText[perfume.season] || 'All Seasons'}</span>
                            </div>
                            
                            <h4>Description</h4>
                            <p class="perfume-description">${perfume.description || 'No description available.'}</p>
                            
                            <h4>Notes</h4>
                            ${notesHtml || '<p>No information available.</p>'}
                            
                            <h4>Price - Size Options</h4>
                            <div class="price-options-container">
                                <label class="price-option">
                                    <input type="radio" name="size" value="30ml" ${perfume.price_of_30ml ? 'checked' : ''}>
                                    <span class="price-text">30ml - ${price30ml} ₺</span>
                                </label>
                                <label class="price-option">
                                    <input type="radio" name="size" value="50ml" ${perfume.price_of_50ml ? 'checked' : ''}>
                                    <span class="price-text">50ml - ${price50ml} ₺</span>
                                </label>
                            </div>
                            
                            <div class="cart-action d-flex gap-2">
                                <button class="cart-btn" data-id="${perfumeId}">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                                <button class="wishlist-btn btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'}" data-id="${perfumeId}" onclick="toggleWishlist('${perfumeId}'); return false;" title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                                    <i class="${wishlistIconClass}"></i>
                                </button>
                            </div>
                            
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="perfume-modal-tabs">
                    <ul class="nav nav-tabs" id="perfumeModalTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="true">
                                Reviews
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="similar-tab" data-bs-toggle="tab" data-bs-target="#similar" type="button" role="tab" aria-controls="similar" aria-selected="false">
                                Similar Perfumes
                            </button>
                        </li>
                    </ul>
                    <div class="tab-content" id="perfumeModalTabContent">
                        <div class="tab-pane fade show active" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                            <div id="reviews-container">
                                <div class="text-center p-3">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                            <div class="write-review">
                                <h4>Make review</h4>
                                <div id="review-form-container">
                                    <!-- Review form will be loaded here -->
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="similar" role="tabpanel" aria-labelledby="similar-tab">
                            <div id="similar-perfumes-container" class="row">
                                <div class="text-center p-3">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener for size selection
        const sizeOptions = perfumeModalContent.querySelectorAll('input[name="size"]');
        sizeOptions.forEach(option => {
            option.addEventListener('change', function() {
                console.log('Size selected:', this.value);
            });
        });
        
        // Sepete Ekle butonu için event listener
        const addToCartBtn = perfumeModalContent.querySelector('.cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                console.log('The Add to Cart button was clicked, perfumeId:', perfumeId);
                
                // Seçilen boyutu al
                const sizeOptions = perfumeModalContent.querySelectorAll('input[name="size"]');
                let size = '50ml'; // Varsayılan değer
                
                sizeOptions.forEach(option => {
                    if (option.checked) {
                        size = option.value;
                    }
                });
                
                console.log('Selected size:', size);
                
                // Sepete ekle
                if (perfumeId && perfumeId !== 'undefined') {
                    // window.addToCart kullanımı - global fonksiyona erişim sağlar
                    window.addToCart(perfumeId, size);
                } else {
                    console.error('Geçersiz perfumeId:', perfumeId);
                    Swal.fire({
                        title: 'Error',
                        text: 'Ürün bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
                        icon: 'error',
                        confirmButtonText: 'Tamam',
                        confirmButtonColor: '#9c27b0'
                    });
                }
            });
        }
        
        
        loadReviewForm(perfumeId);
    }
    
    // Render similar perfumes
    function renderSimilarPerfumes(perfumes) {
        const container = document.getElementById('similar-perfumes-container');
        if (!container) return;
        
        if (perfumes.length === 0) {
            container.innerHTML = '<div class="col-12 text-center">No similar perfume found.</div>';
            return;
        }
        
        container.innerHTML = '';
        
        perfumes.forEach(perfume => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-lg-3';
            
            col.innerHTML = `
                <div class="similar-perfume-card">
                    <div class="similar-perfume-img">
                        <img src="${perfume.image_url}" alt="${perfume.name}">
                    </div>
                    <div class="similar-perfume-info">
                        <h5>${perfume.name}</h5>
                        <p>${perfume.brand}</p>
                        <div class="prices">
                            <p class="price">30ml: ${perfume.price_of_30ml || '0'} TL</p>
                            <p class="price">50ml: ${perfume.price_of_50ml || '0'} TL</p>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="openPerfumeModal('${perfume.id}')">View</button>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
    }
    
    // Load reviews from API
    function loadReviews(perfumeId) {
        const container = document.getElementById('reviews-container');
        if (!container) return;
        
        // Show loading indicator
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Değerlendirmeler yükleniyor...</div>';
        
        // Fetch reviews from API
        fetch(`api/get_reviews.php?perfume_id=${perfumeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderReviews(data.reviews || []);
                } else {
                    container.innerHTML = `<div class="text-center text-danger">${data.message || 'Değerlendirmeler yüklenirken bir hata oluştu.'}</div>`;
                }
            })
            .catch(error => {
                console.error('Error loading reviews:', error);
                container.innerHTML = '<div class="text-center text-danger">Değerlendirmeler yüklenirken bir hata oluştu.</div>';
            });
    }
    
    // Render reviews
    function renderReviews(reviews) {
        const container = document.getElementById('reviews-container');
        if (!container) return;
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="text-center">No reviews yet. Be the first to review!</div>';
            return;
        }
        
        container.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewEl = document.createElement('div');
            reviewEl.className = 'review-item';
            
            const date = new Date(review.created_at);
            const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
            
            reviewEl.innerHTML = `
                <div class="review-header">
                    <div class="review-user">
                        <div class="user-avatar">
                            <img style="width: 50px; height: 50px;" src="${review.user_avatar || 'img/default-avatar.png'}" alt="${review.name}">
                        </div>
                        <div class="user-info">
                            <h5>${review.name}</h5>
                            <span class="review-date">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${generateRatingStars(review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment}</p>
                </div>
            `;
            
            container.appendChild(reviewEl);
        });
    }
    
    // Load review form
    function loadReviewForm(perfumeId) {
        const container = document.getElementById('review-form-container');
        if (!container) return;
        
        // Her zaman değerlendirme formunu göster (giriş kontrolü yapma)
        container.innerHTML = `
            <h3></h3>
            <form id="review-form">
                <input type="hidden" name="perfume_id" value="${perfumeId}">
                <div class="mb-3">
                    <label>Your rating:</label>
                    <div class="rating-stars">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <input type="hidden" name="rating" id="rating-value" value="0">
                </div>
                <div class="mb-3">
                    <label for="review-comment" class="form-label">Your comment:</label>
                    <textarea class="form-control" id="review-comment" name="comment" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        `;
        
        // Initialize rating stars
        const ratingStars = container.querySelectorAll('.rating-stars i');
        const ratingValue = container.querySelector('#rating-value');
        
        ratingStars.forEach(star => {
            star.addEventListener('mouseover', function() {
                const rating = this.dataset.rating;
                
                // Reset all stars
                ratingStars.forEach(s => s.className = 'far fa-star');
                
                // Fill stars up to current
                for (let i = 0; i < rating; i++) {
                    ratingStars[i].className = 'fas fa-star';
                }
            });
            
            star.addEventListener('mouseout', function() {
                const rating = ratingValue.value;
                
                // Reset all stars
                ratingStars.forEach(s => s.className = 'far fa-star');
                
                // Fill stars up to saved rating
                for (let i = 0; i < rating; i++) {
                    ratingStars[i].className = 'fas fa-star';
                }
            });
            
            star.addEventListener('click', function() {
                const rating = this.dataset.rating;
                ratingValue.value = rating;
                
                // Fill stars up to clicked
                for (let i = 0; i < rating; i++) {
                    ratingStars[i].className = 'fas fa-star';
                }
            });
        });
        
        // Submit review form
        const reviewForm = container.querySelector('#review-form');
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rating = ratingValue.value;
            const comment = this.querySelector('#review-comment').value;
            
            if (rating === '0') {
                Swal.fire({
                    title: 'Error',
                    text: 'Please select a rating.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#9c27b0'
                });
                return;
            }
            
            // Kullanıcının giriş yapıp yapmadığını kontrol et
            fetch('api/check_login.php')
                .then(response => response.json())
                .then(data => {
                    if (data.logged_in) {
                        // Kullanıcı giriş yapmış, değerlendirmeyi gönder
                        submitReview(perfumeId, rating, comment, reviewForm, ratingStars, ratingValue);
                    } else {
                        // Kullanıcı giriş yapmamış, giriş yapmasını veya üye olmasını iste
                        Swal.fire({
                            title: 'Login',
                            text: 'Please log in or sign up to submit a review.',
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
                    }
                })
                .catch(error => {
                    console.error('An error occurred while checking the login status:', error);
                    // Hata durumunda da giriş gerekli mesajını göster
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while checking your login status. Please try again later.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#9c27b0'
                    });
                });
        });
    }
    
    
    // Değerlendirme gönderme fonksiyonu
    function submitReview(perfumeId, rating, comment, reviewForm, ratingStars, ratingValue) {
        console.log('Review being sent:', {
            perfume_id: perfumeId,
            rating: rating,
            comment: comment
        });
        
        // Submit review to API
        fetch('api/add_review.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                perfume_id: perfumeId,
                rating: rating,
                comment: comment,
                name: 'Kullanıcı' // Giriş yapmış kullanıcı için backend zaten kullanıcı adını kullanacak
            })
        })
        .then(response => {
            console.log('API yanıt durumu:', response.status);
            return response.text().then(text => {
                try {
                    // API yanıtını JSON olarak parse etmeye çalış
                    return text ? JSON.parse(text) : {};
                } catch (e) {
                    // Eğer JSON parse edilemezse, hata mesajı göster
                    console.error('API yanıtı JSON formatında değil:', text);
                    throw new Error('API yanıtı geçersiz format: ' + text);
                }
            });
        })
        .then(data => {
            console.log('API yanıtı:', data);
            if (data.success) {
                Swal.fire({
                    title: 'Success',
                    text: 'Your review has been successfully submitted.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#9c27b0'
                });
                
                // Refresh reviews
                loadReviews(perfumeId);
                
                // Reset form
                reviewForm.reset();
                ratingValue.value = '0';
                ratingStars.forEach(s => s.className = 'far fa-star');
            } else {
                // Hata mesajını göster (API'den gelen mesaj veya varsayılan mesaj)
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'An error occurred while submitting your review.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#9c27b0'
                });
            }
        })
        .catch(error => {
            console.error('Değerlendirme gönderme hatası:', error);
            
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while submitting your review.' + error.message,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#9c27b0'
            });
        });
    }
    
    // Share perfume
    window.sharePerfume = function(perfumeId, platform) {
        // Get perfume details
        fetch(`api/get_perfume.php?id=${perfumeId}`)
            .then(response => response.json())
            .then(perfume => {
                const shareUrl = `${window.location.origin}${window.location.pathname}?perfume=${perfumeId}`;
                const shareTitle = `${perfume.name} - ${perfume.brand} | KAANI Perfume`;
                const shareText = `${perfume.name} Discover perfume at KAANI Perfume!`;
                
                let shareLink = '';
                
                switch (platform) {
                    case 'facebook':
                        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                        break;
                    case 'twitter':
                        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                        break;
                    case 'whatsapp':
                        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                        break;
                }
                
                // Open share window
                if (shareLink) {
                    window.open(shareLink, '_blank', 'width=600,height=400');
                }
            })
            .catch(error => {
                console.error('Error getting perfume details for sharing:', error);
                
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while sharing the perfume. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#9c27b0'
                });
            });
    };
    
    // Generate rating stars HTML
    function generateRatingStars(rating) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && halfStar) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        return starsHtml;
    }
    
    // Check URL for perfume parameter
    function checkUrlForPerfume() {
        const urlParams = new URLSearchParams(window.location.search);
        const perfumeId = urlParams.get('perfume');
        
        if (perfumeId) {
            openPerfumeModal(perfumeId);
        }
    }
    
    // Initialize perfume from URL
    checkUrlForPerfume();
});
