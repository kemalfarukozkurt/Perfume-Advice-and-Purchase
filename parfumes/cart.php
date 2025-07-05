<?php
// Config ve functions dosyalarını dahil et
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
    <title>My Cart - KAANI Perfume</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.19/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/counter.css">
    <style>
        .cart-section {
            background-color: #f8f9fa;
            padding: 40px 0;
        }
        .section-title {
            color: #9c27b0;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .section-description {
            color: #6c757d;
            margin-bottom: 30px;
        }
        .cart-table {
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            padding: 20px;
            margin-bottom: 30px;
        }
        .cart-item {
            transition: all 0.3s ease;
        }
        .cart-item:hover {
            background-color: #f8f9fa;
        }
        .cart-item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
        }
        .cart-summary {
            border: none;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .cart-summary .card-header {
            background-color: #9c27b0;
            color: white;
            border-radius: 10px 10px 0 0;
            padding: 15px 20px;
        }
        .cart-summary .card-header h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
        }
        .cart-summary .card-body {
            padding: 20px;
        }
        .summary-item {
            font-size: 1rem;
        }
        #checkout {
            background-color: #9c27b0;
            border-color: #9c27b0;
            padding: 12px;
            font-weight: 600;
            margin-top: 15px;
            transition: all 0.3s ease;
        }
        #checkout:hover {
            background-color: #7b1fa2;
            transform: translateY(-2px);
        }
        .quantity-control {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .quantity-btn {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .quantity-btn:hover {
            background-color: #e9ecef;
        }
        .quantity-input {
            width: 40px;
            text-align: center;
            border: none;
            background: transparent;
            font-weight: 600;
            color: #495057;
        }
        .payment-methods {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
        }
        .payment-icons {
            font-size: 1.5rem;
            color: #6c757d;
        }
        .empty-cart-container {
            padding: 50px 0;
            text-align: center;
        }
        .empty-cart-icon {
            font-size: 5rem;
            color: #dee2e6;
            margin-bottom: 20px;
        }
        .cart-actions {
            display: flex;
            gap: 10px;
        }
        .cart-actions .btn {
            transition: all 0.3s ease;
        }
        .cart-actions .btn:hover {
            transform: translateY(-2px);
        }
        .product-name {
            font-weight: 600;
            color: #212529;
        }
        .product-size {
            font-size: 0.85rem;
            color: #6c757d;
        }
        .remove-item {
            color: #dc3545;
            cursor: pointer;
            transition: all 0.2s;
        }
        .remove-item:hover {
            color: #c82333;
            transform: scale(1.1);
        }
    </style>
</head>
<body>
    <!-- Header -->
    <?php include 'includes/header.php'; ?>
    
    <!-- Cart Section -->
    <section id="cart-section" class="cart-section">
        <div class="container" id="cart-container">
            <div class="row mb-4">
                <div class="col-12 text-center">
                    <h2 class="section-title">My Shopping Cart</h2>
                </div>
            </div>
            
            <!-- Loading Spinner -->
            <div id="cart-loading" style="display: none;">
                <div class="text-center my-5">
                    <div class="spinner-border" style="color: #9c27b0;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
            
            <!-- Empty Cart Message -->
            <div id="empty-cart" style="display: none;" class="empty-cart-container">
                <div class="text-center">
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3 class="mb-3">Your Cart is Empty</h3>
                    <p class="text-muted mb-4">There are no perfumes in your cart yet.</p>
                    <a href="index.php#perfumes" class="btn btn-lg" style="background-color: #9c27b0; color: white;">
                        <i class="fas fa-shopping-bag me-2"></i> Discover Perfumes
                    </a>
                </div>
            </div>
            
            <!-- Cart Content -->
            <div class="cart-table">
                <div class="row">
                    <div class="col-lg-8 mb-4">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr class="border-bottom">
                                        <th scope="col" width="80">Perfume</th>
                                        <th scope="col">Details</th>
                                        <th scope="col" class="text-end">Price</th>
                                        <th scope="col" class="text-center">Quantity</th>
                                        <th scope="col" class="text-end">Total</th>
                                        <th scope="col" class="text-center" width="60">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="cart-items-table">
                                    <!-- Cart items will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="cart-actions mt-4 d-flex justify-content-between">
                            <button id="clear-cart" class="btn btn-outline-danger">
                                <i class="fas fa-trash me-2"></i> Clear Cart
                            </button>
                            <a id="continue-shopping" href="index.php#perfumes" class="btn" style="background-color: #f8f9fa; color: #212529;">
                                <i class="fas fa-arrow-left me-2"></i> Continue Shopping
                            </a>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="cart-summary card sticky-top" style="top: 20px;">
                            <div class="card-header">
<h3 class="text-center fw-bolder display-5 text-uppercase mb-1" style="letter-spacing:0.8px; line-height:1.9;">Order Summary</h3>
<p class="text-center text-white small fw-bold mb-0" style="letter-spacing:0.2px;">(BIG CAMPAIGN - 25% DISCOUNT ON PURCHASES OF 2000 TL OR MORE)</p>
                            </div>
                            <div class="card-body">
                                <div class="summary-item d-flex justify-content-between mb-3">
                                    <span>Subtotal:</span>
                                    <span id="cart-subtotal" class="fw-bold">0.00 TL</span>
                                </div>
                                <div class="summary-item d-flex justify-content-between mb-3">
                                    <span>Shipping:</span>
                                    <span id="cart-shipping" class="text-success fw-bold">Free</span>
                                </div>
                                <hr>
                                <div class="summary-item d-flex justify-content-between mb-4">
                                    <strong>Total:</strong>
                                    <strong id="cart-total" style="color: #9c27b0; font-size: 1.2rem;">0.00 TL</strong>
                                </div>
                                
                                <button id="checkout" class="btn btn-lg w-100">
                                    <i class="fas fa-credit-card me-2"></i> Checkout
                                </button>
                                
                                <div class="payment-methods">
                                    <p class="text-center mb-2 text-muted">Payment Methods</p>
                                    <div class="payment-icons d-flex justify-content-center">
                                        <i class="fab fa-cc-visa mx-2"></i>
                                        <i class="fab fa-cc-mastercard mx-2"></i>
                                        <i class="fab fa-cc-amex mx-2"></i>
                                        <i class="fab fa-cc-paypal mx-2"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <?php include 'includes/footer.php'; ?>
    
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
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.19/dist/sweetalert2.all.min.js"></script>
    <script src="js/perfume-details.js"></script>
    <script src="js/wishlist.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/navigation.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/header-navigation.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Cart page loaded');
        
        // LocalStorage'ı temizle (test için)
        // localStorage.removeItem('kaani_cart');
        
        // Sepet sayfasını render et
        window.renderCartPage();
        
        // İstek listesi sayacını güncelle
        if (typeof window.updateWishlistCount === 'function') {
            window.updateWishlistCount();
            console.log('Wishlist count updated');
        } else {
            console.error('updateWishlistCount function not found!');
        }
    });
    </script>
</body>
</html>
