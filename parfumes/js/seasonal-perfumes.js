/**
 * KAANI Perfume - Seasonal Perfumes JavaScript
 * Mevsimlere özel parfümler bölümü için JavaScript dosyası
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Seasonal perfumes script loaded');
    
    // Sayfa başına gösterilecek parfüm sayısı
    const PERFUMES_PER_PAGE = 8;
    
    // Her mevsim için yüklenen parfüm sayısını takip et
    const loadedCounts = {
        summer: 0,
        winter: 0,
        spring: 0,
        autumn: 0
    };
    
    // Her mevsim için toplam parfüm sayısını takip et
    const totalCounts = {
        summer: 0,
        winter: 0,
        spring: 0,
        autumn: 0
    };
    
    // Mevsimsel parfümler bölümünü kontrol et
    const seasonalSection = document.getElementById('seasonal');
    if (!seasonalSection) {
        console.error('Seasonal perfumes section not found. Looking for element with ID: seasonal');
        return;
    }
    
    // Mevsimsel parfümler sekmelerini kontrol et
    const seasonalTabs = document.getElementById('seasonalTabs');
    if (!seasonalTabs) {
        console.error('Seasonal tabs navigation not found. Looking for element with ID: seasonalTabs');
        return;
    }
    
    console.log('Seasonal tabs found:', seasonalTabs);
    
    // Tab pane'leri kontrol et
    const tabPanes = seasonalSection.querySelectorAll('.tab-pane');
    console.log('Tab panes found:', tabPanes.length);
    tabPanes.forEach(pane => {
        console.log('Tab pane ID:', pane.id);
    });
    
    // Sayfa yüklendiğinde yaz parfümlerini getir (aktif sekme)
    loadSeasonalPerfumes('summer', 0, PERFUMES_PER_PAGE);
    
    // Bootstrap tab olaylarını dinle
    seasonalTabs.addEventListener('shown.bs.tab', function(event) {
        // Aktif sekme değiştiğinde çağrılır
        const season = event.target.getAttribute('href').substring(1); // # işaretini kaldır
        console.log('Season tab activated:', season);
        
        // Eğer bu mevsim için daha önce parfüm yüklenmemişse yükle
        if (loadedCounts[season] === 0) {
            loadSeasonalPerfumes(season, 0, PERFUMES_PER_PAGE);
        }
    });
    
    // Daha fazla göster butonlarına tıklama olayı ekle
    const loadMoreButtons = document.querySelectorAll('.load-more-btn');
    loadMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const season = this.getAttribute('data-season');
            const offset = loadedCounts[season];
            loadSeasonalPerfumes(season, offset, PERFUMES_PER_PAGE, true);
        });
    });
    
    /**
     * Mevsimsel parfümleri API'den yükle
     * @param {string} season - Mevsim (summer, winter, spring, autumn)
     * @param {number} offset - Başlangıç indeksi
     * @param {number} limit - Yüklenecek parfüm sayısı
     * @param {boolean} append - Mevcut parfümlere ekle (true) veya temizle (false)
     */
    function loadSeasonalPerfumes(season, offset = 0, limit = 8, append = false) {
        console.log(`Mevsimsel parfümler yükleniyor: ${season}, offset: ${offset}, limit: ${limit}, append: ${append}`);
        
        // Hedef container'ı belirle
        let targetContainer = document.querySelector(`#${season} .perfume-cards`);
        const loadMoreBtn = document.querySelector(`#${season} .load-more-btn`) || 
                           document.querySelector(`.load-more-btn[data-season="${season}"]`);
        
        console.log(`Hedef container için seçici: #${season} .perfume-cards`);
        
        if (!targetContainer) {
            console.error(`Container bulunamadı: #${season} .perfume-cards`);
            return;
        }
        
        // Eğer append değilse, container'ı temizle ve yükleniyor göster
        if (!append) {
            targetContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
        } else {
            // Yükleniyor göstergesini ekle
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'col-12 text-center loading-indicator';
            loadingDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div>';
            targetContainer.appendChild(loadingDiv);
        }
        
        // API URL'ini oluştur
        const apiUrl = `api/get_seasonal_perfumes.php?season=${season}&offset=${offset}&limit=${limit}`;
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
                
                // Yükleniyor göstergesini kaldır
                const loadingIndicator = targetContainer.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
                
                if (data.success && data.perfumes && data.perfumes.length > 0) {
                    console.log(`${data.perfumes.length} parfüm yüklendi`);
                    
                    // Toplam parfüm sayısını güncelle
                    totalCounts[season] = data.total || 0;
                    
                    // Eğer append ise, mevcut parfümlere ekle, değilse temizle ve yeniden render et
                    if (append) {
                        renderPerfumes(targetContainer, data.perfumes, true);
                    } else {
                        targetContainer.innerHTML = '';
                        renderPerfumes(targetContainer, data.perfumes, false);
                    }
                    
                    // Yüklenen parfüm sayısını güncelle
                    loadedCounts[season] += data.perfumes.length;
                    
                    // Daha fazla parfüm varsa butonu göster, yoksa gizle
                    if (loadMoreBtn) {
                        if (loadedCounts[season] < totalCounts[season]) {
                            loadMoreBtn.style.display = 'inline-block';
                            loadMoreBtn.textContent = `Daha Fazla Göster`;
                        } else {
                            loadMoreBtn.style.display = 'none';
                        }
                    }
                } else {
                    console.warn('API başarılı yanıt vermedi veya parfüm verisi boş:', data);
                    if (!append) {
                        targetContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Bu mevsim için parfüm bulunamadı.</p></div>';
                    }
                    
                    // Daha fazla parfüm yoksa butonu gizle
                    if (loadMoreBtn) {
                        loadMoreBtn.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Mevsimsel parfümler yüklenirken hata oluştu:', error);
                
                // Yükleniyor göstergesini kaldır
                const loadingIndicator = targetContainer.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
                
                if (!append) {
                    targetContainer.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Parfümler yüklenirken bir hata oluştu: ${error.message}</p></div>`;
                } else {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'col-12 text-center';
                    errorDiv.innerHTML = `<p class="text-danger">Daha fazla parfüm yüklenirken bir hata oluştu: ${error.message}</p>`;
                    targetContainer.appendChild(errorDiv);
                }
                
                // Hata durumunda butonu gizle
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = 'none';
                }
            });
    }
    
    /**
     * Parfümleri container'a render et
     * @param {HTMLElement} container - Parfümlerin render edileceği container
     * @param {Array} perfumes - Parfüm verileri
     * @param {boolean} append - Mevcut parfümlere ekle (true) veya temizle (false)
     */
    function renderPerfumes(container, perfumes, append = false) {
        // Eğer append değilse, container'ı temizle
        if (!append) {
            container.innerHTML = '';
        }
        
        // Parfüm yoksa mesaj göster
        if (!perfumes || perfumes.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Bu mevsim için parfüm bulunamadı.</p></div>';
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
            
            col.innerHTML = `
                <div class="card perfume-card h-100">
                    <div class="card-img-container">
                        <img src="${imageUrl}" class="card-img-top" alt="${perfume.Name || perfume.name}" onerror="this.src='https://via.placeholder.com/300x300?text=Parfum'">
                        <button class="wishlist-btn" data-id="${perfume.id}">
                            <i class="${wishlistIconClass}"></i>
                        </button>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title perfume-name">${perfume.Name || perfume.name}</h5>
                        <p class="card-text perfume-brand">${perfume.Brand || perfume.brand}</p>
                        <div class="perfume-attributes">
                            <span class="perfume-gender">${genderText[perfume.gender] || 'Unisex'}</span>
                            <span class="perfume-season">${getSeassonLabel(perfume.season)}</span>
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
                                <button class="btn btn-light-blue add-to-cart-btn" data-id="${perfume.id}" data-name="${perfume.Name || perfume.name}" data-price="${perfume.price_of_30ml || 0}" data-size="30ml">
                                    <i class="fas fa-shopping-cart"></i> 30ml
                                </button>
                                <button class="btn btn-light-blue add-to-cart-btn" data-id="${perfume.id}" data-name="${perfume.Name || perfume.name}" data-price="${perfume.price_of_50ml || 0}" data-size="50ml">
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
                            title: 'Added to cart',
                            text: `${perfumeName} (${perfumeSize}) added to your cart`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            position: 'top-end',
                            toast: true
                        });
                    } else {
                        console.error('addToCart function could not be found.');
                    }
                });
            });
        });
    }
    
    /**
     * Mevsim değerini Türkçe etikete dönüştür
     * @param {string} season - Mevsim (summer, winter, spring, autumn)
     * @return {string} Türkçe mevsim etiketi
     */
    function getSeassonLabel(season) {
        switch (season) {
            case 'summer':
                return 'Summer';
            case 'winter':
                return 'Winter';
            case 'spring':
                return 'Spring';
            case 'autumn':
                return 'Autumn';
            default:
                return season;
        }
    }
});
