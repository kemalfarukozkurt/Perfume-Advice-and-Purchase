/**
 * KAANI Perfume - Perfume Filtering Functions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Filter controls
    const genderFilter = document.getElementById('gender-filter');
    const seasonFilter = document.getElementById('season-filter');
    const sortFilter = document.getElementById('sort-filter');
    const loadMoreBtn = document.getElementById('load-more');
    const perfumeList = document.getElementById('perfume-list');
    
    // Aroma filtering
    const aromaTags = document.getElementById('aroma-tags');
    const filterByAromaBtn = document.getElementById('filter-by-aroma');
    
    // Initialize variables
    let currentPage = 1;
    const perPage = 12;
    let selectedAromas = [];
    
    // Load initial perfumes
    if (perfumeList) {
        loadPerfumes();
    }
    
    // Initialize filters
    if (genderFilter) {
        genderFilter.addEventListener('change', function() {
            currentPage = 1;
            filterPerfumes();
        });
    }
    
    if (seasonFilter) {
        seasonFilter.addEventListener('change', function() {
            currentPage = 1;
            filterPerfumes();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentPage = 1;
            filterPerfumes();
        });
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            loadMorePerfumes();
        });
    }
    
    // Initialize aroma tags
    if (aromaTags) {
        loadAromaTags();
    }
    
    // Filter by aroma button
    if (filterByAromaBtn) {
        filterByAromaBtn.addEventListener('click', function() {
            const aromaFilterContainer = document.querySelector('.aroma-filter-container');
            if (aromaFilterContainer) {
                aromaFilterContainer.style.display = aromaFilterContainer.style.display === 'none' ? 'block' : 'none';
            }
            
            if (selectedAromas.length > 0) {
                currentPage = 1;
                filterPerfumesByAroma();
            }
        });
    }
    
    // Load perfumes (initial load)
    function loadPerfumes() {
        const gender = genderFilter ? genderFilter.value : 'all';
        const season = seasonFilter ? seasonFilter.value : 'all';
        const sort = sortFilter ? sortFilter.value : 'name-asc';
        
        // Show loading state
        if (perfumeList) {
            perfumeList.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        }
        
        // Fetch perfumes from API
        fetch(`api/get_perfumes.php?gender=${gender}&season=${season}&sort=${sort}&page=1&per_page=${perPage}`)
            .then(response => response.json())
            .then(data => {
                renderPerfumes(data.perfumes, true);
                
                // Show/hide load more button
                if (loadMoreBtn) {
                    if (data.has_more) {
                        loadMoreBtn.style.display = 'block';
                    } else {
                        loadMoreBtn.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading perfumes:', error);
                if (perfumeList) {
                    perfumeList.innerHTML = '<div class="col-12 text-center">An error occurred while loading perfumes. Please try again later.</div>';
                }
            });
    }
    
    // Filter perfumes by selected criteria
    function filterPerfumes() {
        currentPage = 1;
        const gender = genderFilter ? genderFilter.value : 'all';
        const season = seasonFilter ? seasonFilter.value : 'all';
        const sort = sortFilter ? sortFilter.value : 'name-asc';
        
        // Show loading state
        if (perfumeList) {
            perfumeList.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        }
        
        // Fetch filtered perfumes from API
        fetch(`api/get_perfumes.php?gender=${gender}&season=${season}&sort=${sort}&page=${currentPage}&per_page=${perPage}`)
            .then(response => response.json())
            .then(data => {
                renderPerfumes(data.perfumes, currentPage === 1);
                
                // Show/hide load more button
                if (loadMoreBtn) {
                    if (data.has_more) {
                        loadMoreBtn.style.display = 'block';
                    } else {
                        loadMoreBtn.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading perfumes:', error);
                if (perfumeList) {
                    perfumeList.innerHTML = '<div class="col-12 text-center">An error occurred while loading perfumes. Please try again later.</div>';
                }
            });
    }
    
    // Load more perfumes
    function loadMorePerfumes() {
        const gender = genderFilter ? genderFilter.value : 'all';
        const season = seasonFilter ? seasonFilter.value : 'all';
        const sort = sortFilter ? sortFilter.value : 'name-asc';
        
        // Show loading state on button
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
            loadMoreBtn.disabled = true;
        }
        
        // Fetch more perfumes from API
        fetch(`api/get_perfumes.php?gender=${gender}&season=${season}&sort=${sort}&page=${currentPage}&per_page=${perPage}`)
            .then(response => response.json())
            .then(data => {
                renderPerfumes(data.perfumes, false);
                
                // Reset button state
                if (loadMoreBtn) {
                    loadMoreBtn.innerHTML = 'Show More';
                    loadMoreBtn.disabled = false;
                    
                    // Show/hide load more button
                    if (data.has_more) {
                        loadMoreBtn.style.display = 'block';
                    } else {
                        loadMoreBtn.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading more perfumes:', error);
                
                // Reset button state
                if (loadMoreBtn) {
                    loadMoreBtn.innerHTML = 'Show More';
                    loadMoreBtn.disabled = false;
                }
            });
    }
    
    // Load aroma tags
    function loadAromaTags() {
        const aromaTags = document.getElementById('aromaTags');
        if (!aromaTags) return;
        
        fetch('api/get_aromas.php')
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
                console.log('Aroma verileri alındı:', data);
                if (data.success && data.aromas && data.aromas.length > 0) {
                    // Clear existing tags
                    aromaTags.innerHTML = '';
                    
                    // Add aroma tags
                    data.aromas.forEach(aroma => {
                        const aromaTag = document.createElement('div');
                        aromaTag.className = 'aroma-tag';
                        aromaTag.dataset.id = aroma.id;
                        aromaTag.innerText = aroma.name;
                        
                        // Check if this aroma is already selected
                        if (selectedAromas.includes(aroma.id)) {
                            aromaTag.classList.add('selected');
                        }
                        
                        aromaTag.addEventListener('click', function() {
                            this.classList.toggle('selected');
                            
                            // Update selected aromas
                            if (this.classList.contains('selected')) {
                                selectedAromas.push(aroma.id);
                            } else {
                                const index = selectedAromas.indexOf(aroma.id);
                                if (index !== -1) {
                                    selectedAromas.splice(index, 1);
                                }
                            }
                            
                            // Filter perfumes
                            filterPerfumesByAroma();
                        });
                        
                        aromaTags.appendChild(aromaTag);
                    });
                    
                    // Aroma filtre konteynerini görünür yap
                    const aromaFilterContainer = document.querySelector('.aroma-filter-container');
                    if (aromaFilterContainer) {
                        aromaFilterContainer.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading aroma tags:', error);
                // Hata durumunda kullanıcıya bilgi ver
                if (aromaTags) {
                    aromaTags.innerHTML = '<div class="alert alert-warning">An error occurred while loading aroma labels.</div>';
                }
            });
    }
        
    // Filter perfumes by aroma
    function filterPerfumesByAroma() {
        if (selectedAromas.length === 0) {
            // If no aromas selected, show all perfumes
            filterPerfumes();
            return;
        }
        
        // Show loading state
        if (perfumeList) {
            perfumeList.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        }
        
        // Fetch perfumes by aroma from API
        fetch('api/get_perfumes_by_aroma.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aromas: selectedAromas,
                page: currentPage,
                per_page: perPage
            })
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
                    console.error('Invalid JSON response for perfumes by aroma:', text);
                    throw new Error('Invalid JSON response');
                }
            })
            .then(data => {
                if (data && data.success && data.perfumes) {
                    renderPerfumes(data.perfumes, true);
                    
                    // Show/hide load more button
                    if (loadMoreBtn) {
                        if (data.has_more) {
                            loadMoreBtn.style.display = 'block';
                        } else {
                            loadMoreBtn.style.display = 'none';
                        }
                    }
                } else {
                    if (perfumeList) {
                        perfumeList.innerHTML = '<div class="col-12 text-center">No perfume matching the selected criteria was found.</div>';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading perfumes by aroma:', error);
                if (perfumeList) {
                    perfumeList.innerHTML = '<div class="col-12 text-center">An error occurred while loading perfumes. Please try again later.</div>';
                }
            });
    }
    
    // Render perfumes to the list
    function renderPerfumes(perfumes, clearList) {
        if (!perfumeList) return;
        
        if (clearList) {
            perfumeList.innerHTML = '';
        }
        
        if (perfumes.length === 0) {
            perfumeList.innerHTML = '<div class="col-12 text-center">No perfume matching the selected criteria was found.</div>';
            return;
        }
        
        perfumes.forEach(perfume => {
            const perfumeCard = createPerfumeCard(perfume);
            perfumeList.appendChild(perfumeCard);
        });
    }
    
    // Create a perfume card element
    function createPerfumeCard(perfume) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3';
        
        // İstek listesinde olup olmadığını kontrol et
        const wishlist = JSON.parse(localStorage.getItem('kaani_wishlist')) || [];
        const isInWishlist = wishlist.some(item => item.id.toString() === perfume.id.toString());
        
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
            <div class="perfume-card">
                <div class="perfume-img">
                    <img src="${perfume.image_url}" alt="${perfume.name}">
                </div>
                <div class="perfume-info">
                    <h3 class="perfume-name">${perfume.name}</h3>
                    <p class="perfume-brand">${perfume.brand}</p>
                    <div class="perfume-attributes">
                        <span class="perfume-gender">${genderText[perfume.gender] || 'Unisex'}</span>
                        <span class="perfume-season">${seasonText[perfume.season] || 'All Seasons'}</span>
                    </div>
                    <p class="perfume-notes"><strong>Notes:</strong> ${truncateText(perfume.notes, 100)}</p>
                    <div class="perfume-prices">
                        <p class="perfume-price">30ml: ${perfume.price_of_30ml} TL</p>
                        <p class="perfume-price">50ml: ${perfume.price_of_50ml} TL</p>
                    </div>
                    <div class="perfume-actions d-flex gap-2 align-items-center">
                        <button class="btn btn-primary view-perfume" data-id="${perfume.id}"><i class="fas fa-search"></i> View</button>
                        <button class="btn btn-light-blue add-to-cart-btn" data-id="${perfume.id}" data-name="${perfume.name}" data-price="${perfume.price_of_30ml || 0}" data-size="30ml">
                            <i class="fas fa-shopping-cart"></i> 30ml
                        </button>
                        <button class="btn btn-light-blue add-to-cart-btn" data-id="${perfume.id}" data-name="${perfume.name}" data-price="${perfume.price_of_50ml || 0}" data-size="50ml">
                            <i class="fas fa-shopping-cart"></i> 50ml
                        </button>
                        <button class="wishlist-btn" data-id="${perfume.id}">
                            <i class="${isInWishlist ? 'fas fa-heart' : 'far fa-heart'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const viewButton = col.querySelector('.view-perfume');
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                openPerfumeModal(perfume.id);
            });
        }
        
        // Sepete ekle butonları event listener'ı
        const addToCartButtons = col.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                const perfumeName = this.getAttribute('data-name');
                const perfumePrice = this.getAttribute('data-price');
                const perfumeSize = this.getAttribute('data-size');
                
                if (typeof window.addToCart === 'function') {
                    window.addToCart(perfumeId, perfumeSize);
                    
                    // Kullanıcıya bildirim göster
                    Swal.fire({
                        title: 'Add to Cart',
                        text: `${perfumeName} (${perfumeSize}) added to cart.`,
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
        
        // İstek listesi butonu event listener'ı
        const wishlistButton = col.querySelector('.wishlist-btn');
        if (wishlistButton) {
            wishlistButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const perfumeId = this.getAttribute('data-id');
                window.toggleWishlist(perfumeId);
            });
        }
        
        return col;
    }
    
    // Generate rating stars HTML - Yeniden yazıldı
    function generateRatingStars(rating) {
        // Rating değeri yoksa veya geçersizse 0 olarak kabul et
        const ratingValue = parseFloat(rating) || 0;
        let starsHtml = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= ratingValue) {
                starsHtml += '<i class="fas fa-star" style="color: #ffc107; margin-right: 2px;"></i>';
            } else {
                starsHtml += '<i class="far fa-star" style="color: #ffc107; margin-right: 2px;"></i>';
            }
        }
        
        return starsHtml;
    }
    
    // Truncate text with ellipsis
    function truncateText(text, maxLength) {
        if (!text) return '';
        
        if (text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength) + '...';
    }
    
    // Initialize filters on page load
    filterPerfumes();
});
