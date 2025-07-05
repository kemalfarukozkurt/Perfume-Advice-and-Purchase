/**
 * KAANI Perfume - Sepet İşlemleri
 * Bu dosya sepet işlemlerini yönetir
 */

// Sepet değişkenini window nesnesi üzerinde global olarak tanımla
window.cart = [];

// Sayfa yüklendiğinde sepet verilerini localStorage'dan al
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM içeriği yüklendi, sepet fonksiyonları başlatılıyor');
    
    // LocalStorage'dan sepet verilerini yükle
    loadCartFromStorage();
    
    // Sayfa yüklendiğinde sepet sayacını güncelle
    window.updateCartCount();
    
    // Sepet butonlarına event listener'lar ekle
    setupCartEventListeners();
});

/**
 * LocalStorage'dan sepet verilerini yükler
 */
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('kaani_cart');
        if (savedCart) {
            window.cart = JSON.parse(savedCart) || [];
            console.log("LocalStorage'dan sepet verileri yüklendi:", window.cart);
        } else {
            window.cart = [];
            console.log("LocalStorage'da sepet verisi bulunamadı, boş sepet oluşturuldu");
        }
    } catch (e) {
        console.error('Sepet verisi yüklenirken hata oluştu:', e);
        window.cart = [];
    }
}

/**
 * Sepet butonlarına event listener'lar ekler
 */
function setupCartEventListeners() {
    // Sepet butonuna tıklandığında sepeti aç
    const cartToggle = document.getElementById('cart-toggle');
    if (cartToggle) {
        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            window.openCart();
        });
    }
    
    // Sepet overlay'ine tıklandığında sepeti kapat
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            window.closeCart();
            window.closeWishlist();
        });
    }
    
    // Sepet kapatma butonuna tıklandığında sepeti kapat
    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.closeCart();
        });
    }
    
    // Checkout butonuna tıklandığında ödeme formunu göster
    const checkoutButton = document.getElementById('checkout');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Sepet boşsa işlemi engelle
            if (!window.cart || window.cart.length === 0) {
                Swal.fire({
                    title: 'Sepetiniz Boş',
                    text: 'Ödeme yapmak için sepetinize ürün ekleyin.',
                    icon: 'warning',
                    confirmButtonText: 'Tamam'
                });
                return;
            }

            // Toplam tutarı hesapla
            const total = window.cart.reduce((sum, item) => {
                const price = parseFloat(item.price || 0);
                return sum + (price * item.quantity);
            }, 0);

            let discount = 0;
            let discountedTotal = total;

            if (total >= 2000) {
                discount = total * 0.25;
                discountedTotal = total - discount;
            }

            Swal.fire({
                title: 'Payment Information',
                html: `
                <form id="payment-form" class="text-left">
                    <div class="mb-3">
                        <label class="form-label">Total Amount</label>
                        <input type="text" class="form-control" value="${total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL" disabled>
                    </div>
                            ${discount > 0 ? `
                    <div class="mb-3">
                        <label class="form-label text-success">Discount (25%)</label>
                        <input type="text" class="form-control text-success" value="-${discount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL" disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold text-primary">Discounted Amount</label>
                        <input type="text" class="form-control fw-bold text-primary" value="${discountedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL" disabled>
                    </div>
                    ` : ''}
                    <div class="mb-3">
                <label class="form-label">Name on the Card</label>
                <input type="text" class="form-control" id="card-holder" required autocomplete="off">
            </div>
                    <div class="mb-3">
                        <label class="form-label">Card Number</label>
                        <input type="text" class="form-control" id="card-number" maxlength="19" required 
                               oninput="this.value = this.value.replace(/[^\\d]/g, '').replace(/(.{4})/g, '$1 ').trim()">
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label">Expiration Date (MM/YY)</label>
                            <input type="text" class="form-control" id="card-expiry" placeholder="MM/YY" maxlength="5" required
                                   oninput="this.value = this.value.replace(/[^\\d]/g, '').replace(/^(\\d{2})(\\d)/g, '$1/$2')">
                        </div>
                        <div class="col-6">
                            <label class="form-label">CVV</label>
                            <input type="text" class="form-control" id="card-cvv" maxlength="3" required>
                        </div>
                    </div>
                </form>
            `,
                confirmButtonText: 'Complete Payment',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const cardHolder = document.getElementById('card-holder').value;
                    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
                    const cardExpiry = document.getElementById('card-expiry').value;
                    const cardCvv = document.getElementById('card-cvv').value;

                    if (!cardHolder || !cardNumber || !cardExpiry || !cardCvv) {
                        Swal.showValidationMessage('Please fill in all fields');
                        return false;
                    }

                    if (cardNumber.length !== 16) {
                        Swal.showValidationMessage('Invalid card number');
                        return false;
                    }

                    if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
                        Swal.showValidationMessage('Invalid expiration date (MM/YY)');
                        return false;
                    }

                    if (cardCvv.length !== 3 || isNaN(cardCvv)) {
                        Swal.showValidationMessage('Invalid CVV');
                        return false;
                    }

                    // Kart üzerindeki isimde rakam olmamalı
                    if (/\d/.test(cardHolder)) {
                        Swal.showValidationMessage('There cannot be numbers in the name on the card.');
                        return false;
                    }

                    return true;
                },
                didOpen: () => {
                    // Sadece harf girişine izin ver
                    const cardHolderInput = document.getElementById('card-holder');
                    if (cardHolderInput) {
                        cardHolderInput.addEventListener('input', function () {
                            this.value = this.value.replace(/[0-9]/g, '');
                        });
                    }
                }
                
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Payment Processing',
                        text: 'Please wait...',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        willOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    setTimeout(() => {
                        window.cart = [];
                        localStorage.setItem('kaani_cart', JSON.stringify(window.cart));
                        window.updateCartCount();

                        Swal.fire({
                            title: 'Payment Successful!',
                            text: 'Your order has been successfully received.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            window.location.href = 'index.php';
                        });
                    }, 2000);
                }
            });
        });
    }
}

/**
 * Sepet sayacını güncelleme fonksiyonu
 */
window.updateCartCount = function() {
    // Sepet sayacı elementini bul
    const cartCountById = document.getElementById('cart-count');
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = window.cart.reduce((total, item) => total + item.quantity, 0);
    
    // ID ile bulunan elementi güncelle
    if (cartCountById) {
        cartCountById.textContent = totalItems;
        
        // Sayacın görünürlüğünü ayarla
        if (totalItems === 0) {
            cartCountById.style.display = 'none';
        } else {
            cartCountById.style.display = 'inline-flex';
        }
        
        // Sepet ikonu butonunu da güncelle
        const cartLink = document.getElementById('cart-link');
        if (cartLink) {
            if (totalItems > 0) {
                cartLink.classList.add('active');
            } else {
                cartLink.classList.remove('active');
            }
        }
        
        console.log('Cart counter updated:', totalItems);
    } else {
        console.warn('The cart could not be found!');
    }
    
    // Class ile bulunan elementleri güncelle
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        
        // Eğer sepet boşsa, sayacı gizle
        if (totalItems === 0) {
            element.style.display = 'none';
        } else {
            element.style.display = 'inline-flex';
        }
    });
}

/**
 * Sepeti açma fonksiyonu
 */
window.openCart = function() {
    console.log('openCart fonksiyonu çağrıldı');
    
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar && overlay) {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
        
        // Sepet içeriğini render et
        window.renderCartItems();
    }
}

/**
 * Sepeti kapatma fonksiyonu
 */
window.closeCart = function() {
    console.log('closeCart fonksiyonu çağrıldı');
    
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar && overlay) {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}

/**
 * Sepet içeriğini render etme fonksiyonu
 */
window.renderCartItems = function() {
    console.log('renderCartItems fonksiyonu çağrıldı');
    
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) {
        console.error('Sepet öğeleri konteyneri bulunamadı');
        return;
    }
    
    // Sepet boşsa
    if (!window.cart || window.cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        document.getElementById('cart-total-price').textContent = '0.00 TL';
        return;
    }
    
    // Sepet içeriğini oluştur
    let cartHTML = '';
    let totalPrice = 0;
    
    window.cart.forEach((item, index) => {
        // Fiyat kontrolü
        let price = 0;
        if (item.size === '30ml' && item.price_of_30ml) {
            price = parseFloat(item.price_of_30ml);
        } else if (item.size === '50ml' && item.price_of_50ml) {
            price = parseFloat(item.price_of_50ml);
        } else if (item.price) {
            price = parseFloat(item.price);
        }
        
        const itemTotal = price * item.quantity;
        totalPrice += itemTotal;
        
        // Resim URL kontrolü
        const imageUrl = item.image_url || item.image || 'images/perfumes/default.jpg';
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imageUrl}" alt="${item.name}" onerror="this.src='images/perfumes/default.jpg'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name || 'Perfume name'}</h4>
                    <p>${item.brand ? item.brand + ' - ' : ''}${item.size} - ${price.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="cart-item-price">
                    ${itemTotal.toFixed(2)} TL
                </div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    // Sepet HTML'ini güncelle
    cartItemsContainer.innerHTML = cartHTML;
    
    // Toplam fiyatı güncelle
    document.getElementById('cart-total-price').textContent = totalPrice.toFixed(2) + ' TL';
    
    // Miktar butonlarına event listener ekle
    const minusButtons = cartItemsContainer.querySelectorAll('.quantity-btn.minus');
    const plusButtons = cartItemsContainer.querySelectorAll('.quantity-btn.plus');
    const removeButtons = cartItemsContainer.querySelectorAll('.remove-item');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            window.updateCartQuantity(index, -1);
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            window.updateCartQuantity(index, 1);
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            window.removeFromCart(index);
        });
    });
}

/**
 * Sepete ürün ekleme fonksiyonu
 * @param {number} perfumeId - Parfüm ID'si
 * @param {string} size - Parfüm boyutu (50ml, 100ml, 200ml)
 */
window.addToCart = function(perfumeId, size = '50ml') {
    console.log(`addToCart fonksiyonu çağrıldı: perfumeId=${perfumeId}, size=${size}`);
    
    // Geçerli bir perfumeId mi kontrol et
    if (!perfumeId) {
        console.error('Geçersiz parfüm ID');
        return;
    }
    
    // Önce localStorage'dan mevcut sepeti al
    loadCartFromStorage();
    
    // API'den parfüm bilgilerini al
    fetch(`api/get_perfume.php?id=${perfumeId}`)
        .then(response => response.json())
        .then(data => {
            console.log('API yanıtı:', data);
            
            // API yanıt formatını kontrol et
            // Eğer yanıt success ve perfume alanlarını içeriyorsa
            if (data && data.success && data.perfume) {
                data = data.perfume; // perfume alanını al
            }
            
            if (data && data.id) {
                console.log('Parfüm verisi alındı:', data);
                
                // Fiyat bilgisini boyuta göre belirle
                let price = 0;
                
                // Fiyat alan adlarını kontrol et
                const price30ml = data.price_of_30ml || data.price_30ml || data.price30ml || 0;
                const price50ml = data.price_of_50ml || data.price_50ml || data.price50ml || 0;
                const price100ml = data.price_of_100ml || data.price_100ml || data.price100ml || 0;
                const price200ml = data.price_of_200ml || data.price_200ml || data.price200ml || 0;
                const basePrice = data.price || 0;
                
                console.log('Fiyat bilgileri:', {
                    price30ml, price50ml, price100ml, price200ml, basePrice, size
                });
                
                // Boyuta göre fiyat belirle
                if (size === '30ml' && price30ml) {
                    price = parseFloat(price30ml);
                } else if (size === '50ml' && price50ml) {
                    price = parseFloat(price50ml);
                } else if (size === '100ml' && price100ml) {
                    price = parseFloat(price100ml);
                } else if (size === '200ml' && price200ml) {
                    price = parseFloat(price200ml);
                } else if (basePrice) {
                    // Eğer spesifik boyut fiyatı yoksa, temel fiyatı kullan ve boyuta göre çarp
                    const baseValue = parseFloat(basePrice);
                    if (size === '30ml') {
                        price = baseValue * 0.7; // 30ml için %70 fiyat
                    } else if (size === '50ml') {
                        price = baseValue; // 50ml temel fiyat
                    } else if (size === '100ml') {
                        price = baseValue * 1.8; // 100ml için %180 fiyat
                    } else if (size === '200ml') {
                        price = baseValue * 3.2; // 200ml için %320 fiyat
                    } else {
                        price = baseValue; // Varsayılan olarak temel fiyatı kullan
                    }
                }
                
                console.log(`Selected size: ${size}, Calculated price: ${price}`);
                
                // Resim URL'sini kontrol et ve tam URL oluştur
                let imageUrl = data.image_url || data.image || data.Image || '';
                
                console.log('Ham resim URL:', imageUrl);
                
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
                
                console.log('Düzeltilmiş resim URL:', imageUrl);
                
                // Sepette aynı ürün ve boyut var mı kontrol et
                const existingItemIndex = window.cart.findIndex(item => 
                    item.id === data.id && item.size === size
                );
                
                if (existingItemIndex !== -1) {
                    // Varsa miktarını artır
                    window.cart[existingItemIndex].quantity += 1;
                    console.log('The quantity of the current perfume has been increased:', window.cart[existingItemIndex]);
                } else {
                    // Yoksa yeni ürün olarak ekle
                    const newItem = {
                        id: data.id,
                        name: data.name,
                        brand: data.brand || '',
                        price: price,
                        price_of_30ml: data.price_of_30ml || data.price_30ml || 0,
                        price_of_50ml: data.price_of_50ml || data.price_50ml || 0,
                        size: size,
                        image_url: imageUrl, // Burada image_url olarak kaydediyoruz
                        quantity: 1
                    };
                    
                    window.cart.push(newItem);
                    console.log('New perfume added to cart:', newItem);
                }
                
                // LocalStorage'ı güncelle
                localStorage.setItem('kaani_cart', JSON.stringify(window.cart));
                
                // Sepet sayacını güncelle
                window.updateCartCount();
                
                // Sepet sayfasındaysak sepet içeriğini yeniden render et
                if (window.location.pathname.includes('cart.php')) {
                    window.renderCartPage();
                }
                // Sidebar'ı açma işlemini kaldırdık
                
                // Başarı mesajı göster
                Swal.fire({
                    title: 'Perfume added to cart',
                    text: `${data.name} (${size}) added to your cart.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            } else {
                console.error('Perfume data could not be obtained:', data);
                
                // Hata mesajı göster
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while adding the perfume to the cart.',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            
            // Hata mesajı göster
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while adding the perfume to the cart.',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
        });
}

/**
 * Sepetten ürün kaldırma fonksiyonu
 * @param {number} index - Sepetteki ürünün indeksi
 */
window.removeFromCart = function(index) {
    console.log(`removeFromCart fonksiyonu çağrıldı: index=${index}`);
    
    // Geçerli bir indeks mi kontrol et
    if (index < 0 || index >= window.cart.length) {
        console.error('Geçersiz sepet indeksi:', index);
        return;
    }
    
    // Kaldırılacak ürünün bilgilerini al
    const removedItem = window.cart[index];
    
    // Kullanıcıya onay sor
    Swal.fire({
        title: 'Remove Perfume',
        text: `${removedItem.name} (${removedItem.size}) Are you sure you want to remove this product from your cart?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Ürünü sepetten kaldır
            window.cart.splice(index, 1);
            
            // LocalStorage'ı güncelle
            localStorage.setItem('kaani_cart', JSON.stringify(window.cart));
            
            // Sepet sayacını güncelle
            window.updateCartCount();
            
            // Sepet içeriğini yeniden render et
            if (window.location.pathname.includes('cart.php')) {
                window.renderCartPage();
            } else {
                window.renderCartItems();
            }
            
            // Başarı mesajı göster
            Swal.fire({
                title: 'Removed!',
                text: 'Removed from your cart.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        }
    });
}

/**
 * Sepet ürün miktarını güncelleme fonksiyonu
 * @param {number} index - Sepetteki ürünün indeksi
 * @param {number} change - Değişim miktarı (+1 veya -1)
 */
window.updateCartQuantity = function(index, change) {
    console.log(`updateCartQuantity fonksiyonu çağrıldı: index=${index}, change=${change}`);
    
    // Geçerli bir indeks mi kontrol et
    if (index < 0 || index >= window.cart.length) {
        console.error('Geçersiz sepet indeksi:', index);
        return;
    }
    
    // Yeni miktarı hesapla
    const newQuantity = window.cart[index].quantity + change;
    
    // Miktar 0 veya daha az ise ürünü kaldır
    if (newQuantity <= 0) {
        window.removeFromCart(index);
        return;
    }
    
    // Miktarı güncelle
    window.cart[index].quantity = newQuantity;
    
    // LocalStorage'ı güncelle
    localStorage.setItem('kaani_cart', JSON.stringify(window.cart));
    
    // Sepet sayacını güncelle
    window.updateCartCount();
    
    // Sepet içeriğini yeniden render et
    if (window.location.pathname.includes('cart.php')) {
        window.renderCartPage();
    } else {
        window.renderCartItems();
    }
    
    // Başarı mesajı göster
    Swal.fire({
        title: 'Updated!',
        text: 'Perfume quantity has been updated.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

/**
 * Sepeti tamamen temizleme fonksiyonu
 */
window.clearCart = function() {
    console.log('clearCart fonksiyonu çağrıldı');
    
    // Sepeti boşalt
    window.cart = [];
    
    // LocalStorage'ı güncelle
    localStorage.setItem('kaani_cart', JSON.stringify(window.cart));
    
    // Sepet sayacını güncelle
    window.updateCartCount();
    
    // Sepet içeriğini yeniden render et
    if (window.location.pathname.includes('cart.php')) {
        window.renderCartPage();
    } else {
        window.renderCartItems();
    }
    
    // Başarı mesajı göster
    Swal.fire({
        title: 'Cart Cleared!',
        text: 'Your cart has been completely emptied.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

/**
 * Sepet sayfasını render etme fonksiyonu
 */
// İstek listesi ikonlarını güncelleme fonksiyonu
function updateWishlistIcons() {
    // İstek listesini al
    const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
    
    // Tüm istek listesi ikonlarını güncelle
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    wishlistIcons.forEach(icon => {
        const perfumeId = icon.getAttribute('data-id');
        const isInWishlist = wishlist.some(item => item.id.toString() === perfumeId.toString());
        
        // İkon sınıfını güncelle
        if (isInWishlist) {
            icon.className = 'fas fa-heart wishlist-icon';
            icon.style.color = '#dc3545'; // Kırmızı renk
        } else {
            icon.className = 'far fa-heart wishlist-icon';
            icon.style.color = '#6c757d'; // Gri renk
        }
    });
}

window.renderCartPage = function() {
    console.log('renderCartPage fonksiyonu çağrıldı');
    
    const cartContainer = document.getElementById('cart-container');
    const cartItemsTable = document.getElementById('cart-items-table');
    const loadingElement = document.getElementById('cart-loading');
    const emptyCartElement = document.getElementById('empty-cart');
    const cartTableElement = document.querySelector('.cart-table');
    
    console.log('Sepet elementleri:', {
        cartItemsTable: cartItemsTable ? 'found' : 'not found',
        loadingElement: loadingElement ? 'found' : 'not found',
        emptyCartElement: emptyCartElement ? 'found' : 'not found',
        cartTableElement: cartTableElement ? 'found' : 'not found'
    });
    
    // Önce yükleniyor simgesini hemen gizle
    if (loadingElement) {
        loadingElement.style.display = 'none';
        console.log('Yükleniyor simgesi gizlendi');
    }
    
    // Güncel sepet verilerini al
    loadCartFromStorage();
    console.log('Güncel sepet içeriği:', window.cart);
    
    // Sepet boş mu kontrol et
    if (!window.cart || window.cart.length === 0) {
        console.log('Sepet boş, boş sepet mesajı gösteriliyor...');
        if (loadingElement) {
            loadingElement.style.display = 'none';
            console.log('Yükleniyor simgesi gizlendi');
        }
        if (emptyCartElement) {
            emptyCartElement.style.display = 'block';
            console.log('Boş sepet mesajı gösterildi');
        }
        if (cartTableElement) {
            cartTableElement.style.display = 'none';
            console.log('Sepet tablosu gizlendi');
        }
        return;
    }
    
    // Sepet dolu, tabloyu göster
    console.log('Sepet dolu, tablo gösteriliyor...');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (emptyCartElement) {
        emptyCartElement.style.display = 'none';
    }
    if (cartTableElement) {
        cartTableElement.style.display = 'block';
    }
    
    // Sepet tablosunu oluştur
    if (cartItemsTable) {
        console.log('Sepet tablosu oluşturuluyor...');
        cartItemsTable.innerHTML = '';
        
        let totalAmount = 0;
        
        window.cart.forEach((item, index) => {
            console.log(`Sepet öğesi ${index}:`, item);
            
            // Fiyat kontrolü
            let price = 0;
            if (item.size === '30ml' && item.price_of_30ml) {
                price = parseFloat(item.price_of_30ml);
            } else if (item.size === '50ml' && item.price_of_50ml) {
                price = parseFloat(item.price_of_50ml);
            } else if (item.price) {
                // Eğer spesifik boyut fiyatı yoksa genel fiyatı kullan
                price = parseFloat(item.price);
            }
            
            console.log(`Perfume: ${item.name}, Size: ${item.size}, Price: ${price}`);
            
            const itemTotal = price * item.quantity;
            totalAmount += itemTotal;
            
            const row = document.createElement('tr');
            row.className = 'border-bottom';
            
            // Ürün kodu veya ID'sini göstermeye gerek yok
            
            // Ürün adını, markasını ve boyutunu düzenle
            const productName = item.name || 'Perfume name';
            const brand = item.brand || 'Brand';
            const size = item.size || 'Size';
            
            // Parfüm detay modalını açma fonksiyonu
            const openPerfumeDetailModal = function(e) {
                e.preventDefault();
                const perfumeId = item.id;
                console.log('Parfüm detay modalı açılıyor:', perfumeId);
                
                // openPerfumeModal fonksiyonu perfume-details.js'de tanımlı
                if (typeof window.openPerfumeModal === 'function') {
                    window.openPerfumeModal(perfumeId);
                } else {
                    console.error('openPerfumeModal fonksiyonu bulunamadı');
                    alert('Parfüm detayları görüntülenemiyor. Lütfen sayfayı yenileyip tekrar deneyin.');
                }
            };
            
            row.innerHTML = `
                <td class="py-3">
                    <a href="javascript:void(0)" class="perfume-detail-link" data-id="${item.id}" title="${item.name} view details">
                        <img src="${item.image_url || 'images/perfumes/default.jpg'}" alt="${item.name}" 
                             style="width: 70px; height: 70px; object-fit: cover; cursor: pointer;" 
                             onerror="this.src='images/perfumes/default.jpg'">
                    </a>
                </td>
                <td class="py-3">
                    <div class="fw-bold"><a href="javascript:void(0)" class="perfume-detail-link text-decoration-none" data-id="${item.id}" style="color: inherit;">${productName}</a></div>
                    <div class="text-muted">${brand}</div>
                    <div class="text-muted">${size}</div>
                </td>
                <td class="text-end py-3">
                    ${price.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL
                </td>
                <td class="text-center py-3">
                    <div class="d-flex align-items-center justify-content-center">
                        <button class="btn btn-sm btn-outline-secondary rounded-circle quantity-btn minus" data-index="${index}" style="width: 30px; height: 30px; padding: 0;">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="mx-3">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary rounded-circle quantity-btn plus" data-index="${index}" style="width: 30px; height: 30px; padding: 0;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="text-end py-3 fw-bold text-primary">
                    ${itemTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL
                </td>
                <td class="text-center py-3">
                    <div class="d-flex justify-content-center">
                        <button class="btn text-danger remove-item me-2" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn wishlist-toggle" data-id="${item.id}" title="Add/remove from wishlist">
                            <i class="far fa-heart wishlist-icon" data-id="${item.id}"></i>
                        </button>
                    </div>
                </td>
            `;
            
            cartItemsTable.appendChild(row);
            
            // Parfüm detay modalını açmak için event listener ekle
            const detailLinks = row.querySelectorAll('.perfume-detail-link');
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
        });
        
        console.log('Total Price:', totalAmount);
        
        // Toplam tutarı güncelle
        const subtotalElement = document.getElementById('cart-subtotal');
        const totalElement = document.getElementById('cart-total');
        
        if (subtotalElement) {
            subtotalElement.textContent = totalAmount.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' TL';
        }
        
        if (totalElement) {
            totalElement.textContent = totalAmount.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' TL';
        }
        
        // Miktar butonları için event listener'ları ekle
        const minusButtons = document.querySelectorAll('.quantity-btn.minus');
        const plusButtons = document.querySelectorAll('.quantity-btn.plus');
        const removeButtons = document.querySelectorAll('.remove-item');
        
        minusButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                // Animasyon efekti ekle
                this.classList.add('active');
                setTimeout(() => {
                    this.classList.remove('active');
                    updateCartQuantity(index, -1);
                    renderCartPage();
                }, 150);
            });
        });
        
        plusButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                // Animasyon efekti ekle
                this.classList.add('active');
                setTimeout(() => {
                    this.classList.remove('active');
                    updateCartQuantity(index, 1);
                    renderCartPage();
                }, 150);
            });
        });
        
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                // Animasyon efekti ekle
                this.classList.add('shake');
                setTimeout(() => {
                    this.classList.remove('shake');
                    removeFromCart(index);
                }, 300);
            });
        });
        
        // İstek listesi butonlarını güncelle
        updateWishlistIcons();
        
        // İstek listesi butonlarına event listener ekle
        const wishlistButtons = document.querySelectorAll('.wishlist-toggle');
        wishlistButtons.forEach(button => {
            button.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                const icon = this.querySelector('.wishlist-icon');
                
                // İstek listesini al
                const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
                const isInWishlist = wishlist.some(item => item.id.toString() === perfumeId.toString());
                
                // toggleWishlist fonksiyonu perfume-details.js'de tanımlı
                if (typeof window.toggleWishlist === 'function') {
                    window.toggleWishlist(perfumeId);
                    
                    // Aynı ürünün tüm boyutlarını güncelle
                    const allSameProductIcons = document.querySelectorAll(`.wishlist-icon[data-id="${perfumeId}"]`);
                    
                    allSameProductIcons.forEach(productIcon => {
                        // İstek listesi durumunu tersine çevir
                        if (!isInWishlist) {
                            // İstek listesine eklendi
                            productIcon.className = 'fas fa-heart wishlist-icon';
                            productIcon.style.color = '#dc3545'; // Kırmızı renk
                        } else {
                            // İstek listesinden çıkarıldı
                            productIcon.className = 'far fa-heart wishlist-icon';
                            productIcon.style.color = '#6c757d'; // Gri renk
                        }
                    });
                } else {
                    console.error('toggleWishlist fonksiyonu bulunamadı');
                    alert('İstek listesi işlemi şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.');
                }
            });
        });
    } else {
        console.error('Sepet tablosu elementi bulunamadı!');
    }
    
    // Sepeti temizle butonuna event listener ekle
    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function() {
            Swal.fire({
                title: 'Clear Cart',
                text: 'Are you sure you want to remove all perfumes from your cart?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Clear',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.clearCart();
                }
            });
        });
    }
    
    // Alışverişe devam et butonuna event listener ekle
    const continueShopping = document.getElementById('continue-shopping');
    if (continueShopping) {
        continueShopping.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.php#perfumes';
        });
    }
    
    
}

// İstek listesi ile ilgili fonksiyonlar
window.closeWishlist = function() {
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (wishlistSidebar && overlay) {
        wishlistSidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}
