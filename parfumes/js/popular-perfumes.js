/**
 * KAANI Perfume - Popular Perfumes JavaScript
 * Popüler parfümler bölümü için JavaScript dosyası
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Popular perfumes script loaded');
    
    // Popüler parfümler bölümünü kontrol et
    const popularSection = document.getElementById('popular');
    if (!popularSection) {
        console.error('Popular perfumes section not found. Looking for element with ID: popular');
        // return; // Sayfa yüklenirken popüler bölümü olmasa da header'dan gelen yönlendirmeler için devam et
    }
    
    // Header'daki popüler parfümler menü linklerini dinle
    const popularMenuLinks = document.querySelectorAll('a[data-popular]');
    popularMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const popularType = this.getAttribute('data-popular');
            console.log('Popular perfume type selected:', popularType);
            
            // Sayfayı popüler parfümler bölümüne kaydır
            const targetSection = document.getElementById('popular-perfumes') || document.getElementById('popular');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Uygun sekmeyi aktif et
                setTimeout(() => {
                    activatePopularTab(popularType);
                }, 500); // Kaydırma tamamlandıktan sonra sekmeyi aktif et
            } else {
                // Popüler parfümler bölümü yoksa ana sayfaya yönlendir
                window.location.href = 'index.php#popular-perfumes';
            }
        });
    });
    
    // Popüler parfümler sekmelerini kontrol et
    const popularTabs = document.getElementById('popularTabs');
    if (!popularTabs) {
        console.error('Popular tabs navigation not found. Looking for element with ID: popularTabs');
        return;
    }
    
    console.log('Popular tabs found:', popularTabs);
    
    // Tab pane'leri kontrol et
    const tabPanes = document.querySelectorAll('.tab-pane');
    console.log('Tab panes found:', tabPanes.length);
    tabPanes.forEach(pane => {
        console.log('Tab pane ID:', pane.id);
    });
    
    // Sayfa yüklendiğinde en çok beğenilen parfümleri getir
    loadPopularPerfumes('most_liked');
    
    // Bootstrap tab olaylarını dinle
    const tabs = new bootstrap.Tab(document.querySelector('#popularTabs .nav-link.active'));
    
    popularTabs.addEventListener('shown.bs.tab', function(event) {
        // Aktif sekme değiştiğinde çağrılır
        const activeTabId = event.target.getAttribute('href').substring(1); // # işaretini kaldır
        console.log('Tab activated:', activeTabId);
        
        // Parfümleri yükle
        let type = '';
        switch (activeTabId) {
            case 'most-liked':
                type = 'most_liked';
                break;
            case 'best-selling':
                type = 'best_selling';
                break;
            case 'most-reviewed':
                type = 'most_reviewed';
                break;
        }
        
        if (type) {
            console.log('Loading perfumes for type:', type);
            loadPopularPerfumes(type);
        }
    });
    
    /**
     * Header'dan gelen popüler parfüm tipine göre ilgili sekmeyi aktif et
     * @param {string} tabType - Sekme tipi (most-liked, best-selling, most-rated)
     */
    function activatePopularTab(tabType) {
        console.log('Aktif edilecek sekme:', tabType);
        
        // Sekme tipini API parametresine dönüştür
        let apiType = '';
        switch(tabType) {
            case 'most-liked':
                apiType = 'most_liked';
                break;
            case 'best-selling':
                apiType = 'best_selling';
                break;
            case 'most-rated':
                apiType = 'most_reviewed';
                break;
            default:
                apiType = 'most_liked';
        }
        
        // Sekmeyi aktif et
        const tabElement = document.querySelector(`#popularTabs a[href="#${tabType}"]`);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
        } else {
            console.error(`Sekme bulunamadı: #popularTabs a[href="#${tabType}"]`);
            // Sekme bulunamazsa varsayılan olarak parfümleri yükle
            loadPopularPerfumes(apiType);
        }
    }
    
    /**
     * Popüler parfümleri API'den yükle
     * @param {string} type - Parfüm türü (most_liked, best_selling, most_reviewed)
     */
    function loadPopularPerfumes(type) {
        console.log(`Popüler parfümler yükleniyor: ${type}`);
        
        // Hedef container'ı belirle
        const tabId = type.replace('_', '-');
        let targetContainer = document.querySelector(`#${tabId} .perfume-cards`);
        
        console.log(`Hedef container için seçici: #${tabId} .perfume-cards`);
        
        if (!targetContainer) {
            console.error(`Container bulunamadı: #${tabId} .perfume-cards`);
            return;
        }
        
        // Yükleniyor göster
        targetContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
        
        // API URL'ini oluştur
        const apiUrl = `api/get_popular_perfumes.php?type=${type}&limit=8`;
        console.log('API çağrısı yapılıyor:', apiUrl);
        
        // API'den parfümleri getir
        fetch(apiUrl)
            .then(response => {
                console.log('API yanıtı alındı:', response.status, response.statusText);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('API veri yanıtı:', data);
                if (data.success && data.perfumes && data.perfumes.length > 0) {
                    console.log(`${data.perfumes.length} parfüm yüklendi`);
                    renderPerfumes(targetContainer, data.perfumes);
                } else {
                    console.warn('API başarılı yanıt vermedi veya parfüm verisi boş:', data);
                    targetContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Parfüm bulunamadı.</p></div>';
                }
            })
            .catch(error => {
                console.error('Popüler parfümler yüklenirken hata oluştu:', error);
                targetContainer.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Parfümler yüklenirken bir hata oluştu: ${error.message}</p></div>`;
            });
    }
    
    /**
     * Parfümleri container'a render et
     * @param {HTMLElement} container - Parfümlerin render edileceği container
     * @param {Array} perfumes - Parfüm verileri
     */
    function renderPerfumes(container, perfumes) {
        // Container'ı temizle
        container.innerHTML = '';
        
        // Parfüm yoksa mesaj göster
        if (!perfumes || perfumes.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Parfüm bulunamadı.</p></div>';
            return;
        }
        
        // Her parfüm için kart oluştur
        perfumes.forEach(perfume => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3 mb-4';
            
            // Resim URL'sini kontrol et - veritabanından gelen değeri kullan
            let imageUrl = perfume.image_url || perfume['Image URL'] || perfume.Image || 'https://via.placeholder.com/300x300?text=Parfum';
            
            // Parfüm fiyatı
            let price = perfume.price_of_50ml || perfume.price_of_30ml || 0;
            
            // İstek listesinde olup olmadığını kontrol et
            const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
            const isInWishlist = wishlist.some(item => item.id === perfume.id);
            const wishlistIconClass = isInWishlist ? 'fas fa-heart' : 'far fa-heart';
            
            // Cinsiyet ve mevsim için Türkçe metinler
            const genderText = {
                'male': 'Male',
                'female': 'Female',
                'unisex': 'Unisex'
            };
            
            const seasonText = {
                'summer': 'Summer',
                'winter': 'Winter',
                'spring': 'Spring',
                'autumn': 'Autumn'
            };
            
            col.innerHTML = `
                <div class="card perfume-card h-100">
                    <div class="card-img-container">
                        <img src="${imageUrl}" class="card-img-top" alt="${perfume.name}" onerror="this.src='https://via.placeholder.com/300x300?text=Parfum'">
                        <button class="wishlist-btn" data-id="${perfume.id}">
                            <i class="${wishlistIconClass}"></i>
                        </button>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title perfume-name">${perfume.name}</h5>
                        <p class="card-text perfume-brand">${perfume.brand}</p>
                        <div class="perfume-attributes">
                            <span class="perfume-gender">${genderText[perfume.gender] || 'Unisex'}</span>
                            <span class="perfume-season">${seasonText[perfume.season] || 'All Seasons'}</span>
                        </div>
                        <p class="perfume-notes"><strong>Notes:</strong> ${perfume.notes ? (perfume.notes.length > 100 ? perfume.notes.substring(0, 97) + '...' : perfume.notes) : 'No information available'}</p>
                        <div class="price-container mb-2">
                            <div class="d-flex flex-column">
                                <span class="price">30ml: ${perfume.price_of_30ml || '---'} TL</span>
                                <span class="price">50ml: ${perfume.price_of_50ml || '---'} TL</span>
                            </div>
                        </div>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                                <button class="btn btn-primary incele-btn" data-id="${perfume.id}">
                                    <i class="fas fa-search"></i> View
                                </button>
                                <button class="btn btn-light-blue add-to-cart-btn" data-id="${perfume.id}" data-name="${perfume.name}" data-price="${perfume.price_of_30ml || 0}" data-size="30ml">
                                    <i class="fas fa-shopping-cart"></i> 30ml
                                </button>
                                <button class="btn btn-light-blue add-to-cart-btn" data-id="${perfume.id}" data-name="${perfume.name}" data-price="${perfume.price_of_50ml || 0}" data-size="50ml">
                                    <i class="fas fa-shopping-cart"></i> 50ml
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
            
            // İstek listesi butonuna tıklama olayı ekle
            const wishlistBtn = col.querySelector('.wishlist-btn');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', function() {
                    const perfumeId = this.getAttribute('data-id');
                    if (typeof window.toggleWishlist === 'function') {
                        window.toggleWishlist(perfumeId);
                    }
                });
            }
            
            // İncele butonuna tıklama olayı ekle
            const inceleBtn = col.querySelector('.incele-btn');
            if (inceleBtn) {
                inceleBtn.addEventListener('click', function() {
                    const perfumeId = this.getAttribute('data-id');
                    if (typeof window.openPerfumeModal === 'function') {
                        window.openPerfumeModal(perfumeId);
                    } else {
                        console.error('openPerfumeModal fonksiyonu bulunamadı');
                    }
                });
            }
            
            // Sepete ekle butonlarına tıklama olayı ekle
            const addToCartBtns = col.querySelectorAll('.add-to-cart-btn');
            addToCartBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const perfumeId = this.getAttribute('data-id');
                    const perfumeName = this.getAttribute('data-name');
                    const perfumePrice = this.getAttribute('data-price');
                    const perfumeSize = this.getAttribute('data-size');
                    
                    if (typeof window.addToCart === 'function') {
                        window.addToCart(perfumeId, perfumeSize);
                        
                        // Kullanıcıya bildirim göster
                        Swal.fire({
                            title: 'Added to Cart',
                            text: `${perfumeName} (${perfumeSize}) added to your cart.`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            position: 'top-end',
                            toast: true
                        });
                    } else {
                        console.error('addToCart fonksiyonu bulunamadı');
                    }
                });
            });
            

        });
    }
});
