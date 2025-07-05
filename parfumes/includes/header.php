<?php
/**
 * KAANI Perfume - Site Header
 */

// Oturum başlatılmamışsa başlat
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Eğer $isLoggedIn değişkeni tanımlanmamışsa, session'dan kontrol et
if (!isset($isLoggedIn)) {
    $isLoggedIn = isset($_SESSION['user_id']);
}

// Şu anki sayfanın dosya adını al
$currentPage = basename($_SERVER['PHP_SELF']);
$isHomePage = ($currentPage === 'index.php');

// Ana sayfa linki için ön ek
$homePrefix = $isHomePage ? '' : 'index.php';
?>

<!-- Fix Cart Script -->
<script src="js/fix-cart.js"></script>
<!-- Header -->
<header id="header">
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
        <div class="container">
            <a class="navbar-brand" href="<?php echo $homePrefix; ?>#home">KAANI Perfume</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item"><a class="nav-link" href="<?php echo $homePrefix; ?>#home">Home</a></li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo $homePrefix; ?>#perfumes" data-gender="all">Perfumes</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo $homePrefix; ?>#popular">Popular Perfumes</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo $homePrefix; ?>#seasonal">Seasonal Perfumes</a>
                    </li>

                    <li class="nav-item"><a class="nav-link" href="<?php echo $homePrefix; ?>#guide">Perfume Guide</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?php echo $homePrefix; ?>#stores">Our Stores</a></li>
                </ul>
                <div class="d-flex align-items-center">
                    <form action="search.php" method="GET" class="d-flex me-3">
                        <input type="text" name="q" class="form-control form-control-sm" placeholder="Search perfume..." required>
                        <button type="submit" class="btn btn-sm btn-light ms-1"><i class="fas fa-search"></i></button>
                    </form>
                    <?php if($isLoggedIn): ?>
                        <div class="dropdown user-dropdown">
                            <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-user"></i> <?php echo isset($_SESSION['user_name']) ? $_SESSION['user_name'] : 'My account'; ?>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item logout-button" href="#"><i class="fas fa-sign-out-alt"></i> Log out</a></li>
                            </ul>
                        </div>
                    <?php else: ?>
                        <a href="#" id="login-button" class="btn btn-outline-light me-2"><i class="fas fa-sign-in-alt"></i> Login</a>
                        <a href="#" id="register-button" class="btn btn-light"><i class="fas fa-user-plus"></i> Signup</a>
                    <?php endif; ?>
                    <a href="wishlist.php" id="wishlist-link-icon" class="btn btn-outline-light ms-2">
                        <i class="fas fa-heart"></i> <span id="wishlist-count" class="count-badge">0</span>
                    </a>
                    <a href="cart.php" id="cart-link" class="btn btn-outline-light ms-2">
                        <i class="fas fa-shopping-cart"></i> <span id="cart-count" class="count-badge">0</span>
                    </a>
                </div>
            </div>
        </div>
    </nav>
</header>
