<?php
// Session başlatma ve gerekli dosyaları dahil etme işlemi header.php içerisinde yapılıyor
include 'config.php';
include 'functions.php';

// Oturum durumunu kontrol et
$isLoggedIn = isset($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KAANI Perfume - Personalized Perfume Experience</title>
        <!-- Favicon  -->
    <link rel="icon" type="image/png" href="img/logo.png">
    <link rel="shortcut icon" type="image/png" href="img/logo.png">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.19/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/counter.css">
    <link rel="stylesheet" href="css/card-style.css">
</head>
<body>
    <!-- Header -->
    <?php include 'includes/header.php'; ?>

    <!-- Home Section -->
    <section id="home" class="hero-section">
        <video autoplay muted loop playsinline class="hero-video">
            <source src="img/parfume_video.mp4" type="video/mp4">
        </video>
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <h1>KAANI Perfume</h1>
            <p>Personalized Perfume Experience</p>
        </div>
        <div class="hero-buttons-container">
            <div class="hero-buttons">
                <a href="#perfumes" class="btn btn-primary btn-lg">Discover Perfumes</a>
                <a href="#guide" class="btn btn-outline-light btn-lg">Perfume Guide</a>
            </div>
        </div>
    </section>


    <!-- Perfumes Section -->
    <section id="perfumes" class="py-5">
        <div class="container">
            <h2 class="section-title text-center mb-4">All Perfumes</h2>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <select id="gender-filter" class="form-select">
                        <option value="all">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unisex">Unisex</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <select id="season-filter" class="form-select">
                        <option value="all">All Seasons</option>
                        <option value="summer">Summer</option>
                        <option value="winter">Winter</option>
                        <option value="spring">Spring</option>
                        <option value="autumn">Autumn</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <select id="sort-filter" class="form-select">
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Lowest to Highest Price</option>
                        <option value="price-desc">Highest to Lowest Price</option>
                    </select>
                </div>
            </div>
            
            <div class="aroma-filter-container mb-4" style="display: none;">
                <h4>Aroma Notes</h4>
                <div id="aroma-tags" class="aroma-tags"></div>
            </div>
            
            <div id="no-results-message" class="alert alert-info" style="display: none;"></div>
            
            <div class="row" id="perfume-list">
                <!-- Perfume cards will be loaded here -->
            </div>
            
            <div class="text-center mt-4">
                <button id="load-more" class="btn btn-outline-primary">Show More</button>
            </div>
        </div>
    </section>
    
    <!-- Popular Perfumes Section -->
    <section id="popular" class="py-5 bg-light">
        <div class="container">
            <h2 class="section-title text-center mb-4">Popular Perfumes</h2>
            <ul class="nav nav-tabs justify-content-center mb-4" id="popularTabs">
                <li class="nav-item">
                    <a class="nav-link active" data-bs-toggle="tab" href="#most-liked">Most Liked</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#best-selling">Best Selling</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#most-reviewed">Most Reviewed</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="most-liked">
                    <div class="row perfume-cards">
                        <!-- Most liked perfumes will be loaded here -->
                    </div>
                </div>
                <div class="tab-pane fade" id="best-selling">
                    <div class="row perfume-cards">
                        <!-- Best selling perfumes will be loaded here -->
                    </div>
                </div>
                <div class="tab-pane fade" id="most-reviewed">
                    <div class="row perfume-cards">
                        <!-- Most reviewed perfumes will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Seasonal Perfumes Section -->
    <section id="seasonal" class="py-5">
        <div class="container">
            <h2 class="section-title text-center mb-4">Seasonal Perfumes</h2>
            <ul class="nav nav-tabs justify-content-center mb-4" id="seasonalTabs">
                <li class="nav-item">
                    <a class="nav-link active" data-bs-toggle="tab" href="#summer">Summer</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#winter">Winter</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#spring">Spring</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#autumn">Autumn</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="summer">
                    <div class="row perfume-cards">
                        <!-- Summer perfumes will be loaded here -->
                    </div>
                    <div class="text-center mt-4">
                        <button class="btn btn-outline-primary load-more-btn" data-season="summer">Show More</button>
                    </div>
                </div>
                <div class="tab-pane fade" id="winter">
                    <div class="row perfume-cards">
                        <!-- Winter perfumes will be loaded here -->
                    </div>
                    <div class="text-center mt-4">
                        <button class="btn btn-outline-primary load-more-btn" data-season="winter">Show More</button>
                    </div>
                </div>
                <div class="tab-pane fade" id="spring">
                    <div class="row perfume-cards">
                        <!-- Spring perfumes will be loaded here -->
                    </div>
                    <div class="text-center mt-4">
                        <button class="btn btn-outline-primary load-more-btn" data-season="spring">Show More</button>
                    </div>
                </div>
                <div class="tab-pane fade" id="autumn">
                    <div class="row perfume-cards">
                        <!-- Autumn perfumes will be loaded here -->
                    </div>
                    <div class="text-center mt-4">
                        <button class="btn btn-outline-primary load-more-btn" data-season="autumn">Show More</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

  

    <!-- Perfume Guide Section -->
    <section id="guide" class="py-5">
        <div class="container">
            <h2 class="section-title text-center mb-4">Perfume Guide</h2>
            <div class="row">
                <div class="col-md-8">
                    <div class="guide-content">
                        <h3>Things to Consider When Choosing a Perfume</h3>
                        <p>Choosing a perfume is a personal experience, and you should consider some factors to find the right perfume:</p>
                        <ul>
                            <li><strong>Your Skin Chemistry:</strong> Perfumes may smell different on different skin types.</li>
                            <li><strong>Season:</strong> Light and fresh scents are preferred for summer, while warmer and more intense scents are suitable for winter.</li>
                            <li><strong>Purpose of Use:</strong> Lighter scents for work environments, more striking scents for special occasions.</li>
                            <li><strong>Personal Preferences:</strong> The notes and aromas you like can affect your perfume choice.</li>
                        </ul>
                        
                        <h3>What Are Perfume Notes?</h3>
                        <p>Perfumes usually consist of three note layers:</p>
                        <ul>
                            <li><strong>Top Notes:</strong> The scents you smell first, usually lasting 15-30 minutes.</li>
                            <li><strong>Middle Notes:</strong> The scents that appear after the top notes fade, known as the "heart" of the perfume.</li>
                            <li><strong>Base Notes:</strong> The foundation of the perfume, the longest-lasting scents.</li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="ai-assistant-container">
                        <div class="ai-assistant-header">
                            <h3>Perfume Assistant</h3>
                            <p>Chat with our assistant for personalized perfume recommendations.</p>
                        </div>
                        <div class="ai-chat-container">
                            <div id="chat-messages" class="chat-messages">
                                <div class="message assistant">
                                    <div class="message-content">Hello! I am the KAANI Perfume Assistant. How can I help you?</div>
                                </div>
                            </div>
                            <form id="chat-form" class="chat-input-container" autocomplete="off">
                                <input type="text" id="chat-input" placeholder="Type a message..." class="form-control" required>
                                <button type="submit" id="chat-send-btn" class="btn btn-primary"><i class="fas fa-paper-plane"></i></button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stores Section -->
    <section id="stores" class="py-5 bg-light">
        <div class="container">
            <h2 class="section-title text-center mb-4">Our Stores</h2>
            <div class="row">
                <div class="col-md-6">
                    <div class="store-card p-4 mb-4">
                        <h3>Dogus Store 1</h3>
                        <p class="store-address">
                            <i class="fas fa-map-marker-alt me-2"></i>
                            Dudullu OSB Mah, Dudullu OSB, Nato Yolu Cd No:265 D:1, 34775 Ümraniye/İstanbul
                        </p>
                        <p class="store-phone">
                            <i class="fas fa-phone me-2"></i>
                            <a href="tel:+904447997">444 7997</a>
                        </p>
                        <p class="store-clock">                          
                            <i class> <p>Weekdays: 10.00 - 20.00
                                <p>Saturday: 09.00 - 22.00
</i>
                        </p>
                        <div class="store-map mt-3">
                            <a href="https://www.google.com/maps/place/34775+Ümraniye,+İstanbul/@41.023331,29.091446,15z/data=!4m5!3m4!1s0x0:0x0!8m2!3d41.023331!4d29.091446" target="_blank" class="btn btn-outline-primary">
                                <i class="fas fa-map me-2"></i>Open in Google Maps
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="store-card p-4 mb-4">
                        <h3>Dogus Store 2</h3>
                        <p class="store-address">
                            <i class="fas fa-map-marker-alt me-2"></i>
                            Bahçelievler, Bosna Blv No: 140, 34680 Üsküdar/İstanbul
                        </p>
                        <p class="store-phone">
                            <i class="fas fa-phone me-2"></i>
                            <a href="tel:+904447997">444 7997</a>
                        </p>
                        <p class="store-clock">                          
                            <i class> <p>Weekdays:  10.00 - 20.00
                                <p>Saturday:  09.00 - 22.00
</i>
                        </p>
                        <div class="store-map mt-3">
                            <a href="https://www.google.com/maps/place/34680+Üsküdar,+İstanbul/@41.050848,29.035551,15z/data=!4m5!3m4!1s0x0:0x0!8m2!3d41.050848!4d29.035551" target="_blank" class="btn btn-outline-primary">
                                <i class="fas fa-map me-2"></i>Open in Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h3>KAANI Perfume</h3>
                    <p>KAANI Perfume, offering a personalized perfume experience, brings you the highest quality and most exclusive perfumes.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>
                <div class="col-md-4">
                    <h3>Quick Links</h3>
                    <ul class="footer-links">                   
                        <li><a href="#home">Home</a></li>
                        <li><a href="#perfumes">Perfumes</a></li>
                        <li><a href="#popular">Popular Perfumes</a></li>
                        <li><a href="#seasonal">Seasonal Perfumes</a></li>
                        <li><a href="#guide">Perfume Guide</a></li>
                        <li><a href="#stores">Our Stores</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h3>Our Mobile Apps</h3>
                    <p>Download the KAANI Perfume mobile apps and carry your perfume experience with you at all times.</p>
                    <div class="app-links">
                        <a href="#" class="app-link"><img src="img/google-play.png"></a>
                        <a href="#" class="app-link"><img src="img/app-store.png"></a>
                        <a href="#" class="app-link"><img src="img/huawei-appgallery.png"></a>
                    </div>
                    <div class="qr-code mt-3">
                        <img src="img/qr-code.png">
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-12 text-center">
                    <p class="copyright">  KAANI Perfume. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Perfume Modal -->
    <div class="modal fade" id="perfumeModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="perfumeModalLabel">Perfume Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="perfumeModalContent">
                    <!-- Perfume details will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Cart Sidebar -->
    <div class="cart-sidebar" id="cart-sidebar">
        <div class="cart-header">
            <h3>My Cart</h3>
            <button id="close-cart" class="close-cart"><i class="fas fa-times"></i></button>
        </div>
        <div class="cart-items" id="cart-items">
            <!-- Cart items will be loaded here -->
        </div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Total:</span>
                <span id="cart-total-price">0.00 TL</span>
            </div>
            <button id="checkout-button" class="btn btn-primary w-100">Checkout</button>
        </div>
    </div>

    <!-- Wishlist Sidebar -->
    <div class="wishlist-sidebar" id="wishlist-sidebar">
        <div class="wishlist-header">
            <h3>My Wishlist</h3>
            <button id="close-wishlist" class="close-wishlist"><i class="fas fa-times"></i></button>
        </div>
        <div class="wishlist-items" id="wishlist-items">
            <!-- Wishlist items will be loaded here -->
        </div>
    </div>

    <!-- Overlay -->
    <div class="overlay" id="overlay"></div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.19/dist/sweetalert2.all.min.js"></script>
    <script src="js/navigation.js"></script>
    <script src="js/filters.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/wishlist.js"></script>
    <script src="js/perfume-details.js"></script>
    <script src="js/popular-perfumes.js"></script>
    <script src="js/seasonal-perfumes.js"></script>
    <script src="js/chatbot.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/header-navigation.js"></script>
</body>
</html>
