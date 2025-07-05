/**
 * KAANI Perfume - Header Navigation
 * Bu script, header'daki linklerin düzgün çalışmasını sağlar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Header'daki tüm linkleri seç
    const headerLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    headerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Eğer link aynı sayfadaki bir anchor'a işaret ediyorsa
            if (href.includes('#') && !href.startsWith('http')) {
                const targetId = href.split('#')[1];
                
                // Eğer hedef element bu sayfada varsa
                if (document.getElementById(targetId)) {
                    e.preventDefault();
                    const targetElement = document.getElementById(targetId);
                    
                    // Smooth scroll
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Header yüksekliği için offset
                        behavior: 'smooth'
                    });
                }
                // Diğer durumda normal link davranışı (index.php#section)
            }
        });
    });
    
    // URL'deki hash'i kontrol et ve ona göre scroll yap
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            setTimeout(() => {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }, 300); // Sayfanın yüklenmesi için kısa bir gecikme
        }
    }
});
