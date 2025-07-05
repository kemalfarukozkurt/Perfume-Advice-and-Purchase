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
    <title>My Wishlist - KAANI Perfume</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.19/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/counter.css">
    <style>
        .wishlist-section {
            background-color: #f8f9fa;
            padding: 40px 0;
        }
        .section-title {
            color: #9c27b0;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .wishlist-table {
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            padding: 20px;
            margin-bottom: 30px;
        }
        .quantity-control {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .remove-from-wishlist {
            color: #dc3545;
            cursor: pointer;
            transition: all 0.2s;
        }
        .remove-from-wishlist:hover {
            color: #c82333;
            transform: scale(1.1);
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
    </style>
</head>
<body>
    <!-- Header -->
    <?php include 'includes/header.php'; ?>
    
    <!-- Wishlist Section -->
    <section id="wishlist-section">
        <div class="container" id="wishlist-container">
            <div class="row mb-4">
                <div class="col-12">
                    <h2 class="section-title">My Wishlist</h2>
                </div>
            </div>
            
            <!-- Loading Spinner -->
            <div id="wishlist-loading" style="display: none;">
                <div class="text-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
            
            <!-- Empty Wishlist Message -->
            <div id="empty-wishlist" class="empty-container" style="display: none;">
                <div class="text-center">
                    <div class="empty-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h3 class="mb-3">Your Wishlist is Empty</h3>
                    <p class="text-muted mb-4">There are no perfumes in your wishlist yet.</p>
                    <a href="index.php#perfumes" class="btn btn-lg" style="background-color: #9c27b0; color: white;">
                        <i class="fas fa-shopping-bag me-2"></i> Discover Perfumes
                    </a>
                </div>
            </div>
            
            <!-- Wishlist Content -->
            <div class="wishlist-content" style="display: none;">
                <div class="wishlist-table">
                    <div class="row">
                        <div class="col-12 mb-4">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr class="border-bottom">
                                            <th class="py-3" width="10%">Perfume</th>
                                            <th class="py-3" width="15%">Details</th>
                                            <th class="py-3" width="55%">Notes</th>
                                            <th class="py-3" width="20%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="wishlist-items-table">
                                        <!-- Wishlist items will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Wishlist Actions -->
                            <div class="cart-actions mt-4 d-flex justify-content-between">
                                <button id="clear-wishlist" class="btn btn-outline-danger">
                                    <i class="fas fa-trash me-2"></i> Clear Wishlist
                                </button>
                                <a href="index.php#perfumes" class="btn btn-outline-primary">
                                    <i class="fas fa-arrow-left me-2"></i> Continue Shopping
                                </a>
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
    <script>
        // Set page type for scripts
        window.isWishlistPage = true;
    </script>
    <script src="js/navigation.js"></script>
    <script src="js/filters.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/perfume-details.js"></script>
    <script src="js/wishlist.js"></script>
    <script src="js/refresh-wishlist.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/header-navigation.js"></script>
</body>
</html>
