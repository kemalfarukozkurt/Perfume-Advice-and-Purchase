/**
 * KAANI Perfume - Navigation and Smooth Scrolling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Handle gender and season filtering from navigation
                if (targetId === '#perfumes') {
                    const gender = this.getAttribute('data-gender');
                    const season = this.getAttribute('data-season');
                    
                    if (gender) {
                        document.getElementById('gender-filter').value = gender;
                        filterPerfumes();
                    }
                    
                    if (season) {
                        document.getElementById('season-filter').value = season;
                        filterPerfumes();
                    }
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Fixed navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target) && navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            performSearch();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm === '') return;
        
        // Scroll to perfumes section
        const perfumesSection = document.getElementById('perfumes');
        window.scrollTo({
            top: perfumesSection.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // Filter perfumes by search term
        filterPerfumesBySearch(searchTerm);
    }
    
    function filterPerfumesBySearch(searchTerm) {
        const perfumeCards = document.querySelectorAll('.perfume-card');
        let hasResults = false;
        
        perfumeCards.forEach(card => {
            const name = card.querySelector('.perfume-name').textContent.toLowerCase();
            const brand = card.querySelector('.perfume-brand').textContent.toLowerCase();
            const notes = card.querySelector('.perfume-notes').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || brand.includes(searchTerm) || notes.includes(searchTerm)) {
                card.style.display = 'block';
                hasResults = true;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show message if no results
        const noResultsMessage = document.getElementById('no-results-message');
        if (noResultsMessage) {
            if (hasResults) {
                noResultsMessage.style.display = 'none';
            } else {
                noResultsMessage.style.display = 'block';
                noResultsMessage.textContent = `"${searchTerm}" No results found for`;
            }
        }
    }
});
