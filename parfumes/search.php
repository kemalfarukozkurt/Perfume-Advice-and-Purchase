<?php
/**
 * KAANI Perfume - Search Page
 */

// Include necessary files
require_once 'config.php';
require_once 'functions.php';

// Get search query
$searchQuery = isset($_GET['q']) ? sanitizeInput($_GET['q']) : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = 12; // Number of perfumes per page

// Function to search perfumes
function searchPerfumes($query, $page = 1, $perPage = 12) {
    global $conn;
    
    // Base query - only search in Name and notes columns
    $searchSql = "SELECT * FROM perfumes WHERE 
                 Name LIKE ? OR 
                 notes LIKE ?";
    
    // Prepare statement
    $stmt = $conn->prepare($searchSql);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return ['perfumes' => [], 'total' => 0, 'pages' => 0];
    }
    
    // Add wildcards to search query
    $searchParam = "%" . $query . "%";
    $stmt->bind_param("ss", $searchParam, $searchParam);
    
    // Execute query
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Count total results
    $totalResults = $result->num_rows;
    $totalPages = ceil($totalResults / $perPage);
    
    // Calculate offset for pagination
    $offset = ($page - 1) * $perPage;
    
    // Paginated query
    $paginatedSql = $searchSql . " LIMIT ?, ?";
    $stmt = $conn->prepare($paginatedSql);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return ['perfumes' => [], 'total' => 0, 'pages' => 0];
    }
    
    $stmt->bind_param("ssii", $searchParam, $searchParam, $offset, $perPage);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Format perfumes
    $perfumes = [];
    while ($row = $result->fetch_assoc()) {
        // Handle both uppercase and lowercase column names
        $name = isset($row['Name']) ? $row['Name'] : (isset($row['name']) ? $row['name'] : 'Unknown');
        $brand = isset($row['Brand']) ? $row['Brand'] : (isset($row['brand']) ? $row['brand'] : 'Unknown');
        $id = md5($name . $brand);
        $perfumes[] = formatPerfumeData($row, $id);
    }
    
    return [
        'perfumes' => $perfumes,
        'total' => $totalResults,
        'pages' => $totalPages
    ];
}

// Get search results
$searchResults = [];
if (!empty($searchQuery)) {
    $searchResults = searchPerfumes($searchQuery, $page, $perPage);
}

// Page title
$pageTitle = empty($searchQuery) ? 'Search Perfume' : '"' . htmlspecialchars($searchQuery) . '" For Search Results';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - KAANI Perfume</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/counter.css">
    <link rel="stylesheet" href="css/card-style.css">
</head>
<body>
    <!-- Include Header -->
    <?php include 'includes/header.php'; ?>
    
    <!-- Main Content -->
    <main class="container mt-5 pt-5">
        <section class="search-results">
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="section-title"><?php echo $pageTitle; ?></h1>
                    
                    <?php if (!empty($searchQuery)): ?>
                        <p class="text-muted">
                            <?php echo $searchResults['total']; ?> results found.
                        </p>
                    <?php endif; ?>
                </div>
            </div>
            
            <?php if (empty($searchQuery)): ?>
                <div class="row">
                    <div class="col-md-6 mx-auto">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Search Perfume</h5>
                                <form action="search.php" method="GET" class="mt-4">
                                    <div class="input-group mb-3">
                                        <input type="text" name="q" class="form-control" placeholder="Perfume name, brand or aroma..." required>
                                        <button class="btn btn-primary" type="submit">
                                            <i class="fas fa-search"></i> Search
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <?php elseif (empty($searchResults['perfumes'])): ?>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> "<?php echo htmlspecialchars($searchQuery); ?>" for no results found.
                </div>
                
                <div class="mt-4">
                    <h4>Suggestions:</h4>
                    <ul>
                        <li>Try different keywords</li>
                        <li>Use more general terms</li>
                        <li>Make sure there are no spelling mistakes</li>
                    </ul>
                </div>
            <?php else: ?>
                <div class="row">
                    <?php foreach ($searchResults['perfumes'] as $perfume): ?>
                        <div class="col-md-3 mb-4">
                            <div class="card perfume-card h-100">
                                <div class="card-img-container">
                                    <img src="<?php echo htmlspecialchars($perfume['image_url']); ?>" class="card-img-top" alt="<?php echo htmlspecialchars($perfume['name']); ?>" onerror="this.src='https://via.placeholder.com/300x300?text=Parfum'">
                                    <button class="wishlist-btn" data-id="<?php echo $perfume['id']; ?>">
                                        <i class="far fa-heart"></i>
                                    </button>
                                </div>
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title perfume-name"><?php echo htmlspecialchars($perfume['name']); ?></h5>
                                    <p class="card-text perfume-brand"><?php echo htmlspecialchars($perfume['brand']); ?></p>
                                    
                                    <div class="perfume-attributes">
                                        <?php 
                                        $genderText = [
                                            'male' => 'Male',
                                            'female' => 'Female',
                                            'unisex' => 'Unisex'
                                        ];
                                        
                                        $seasonText = [
                                            'summer' => 'Summer',
                                            'winter' => 'Winter',
                                            'spring' => 'Spring',
                                            'autumn' => 'Autumn',
                                            'all' => 'All Seasons'
                                        ];
                                        ?>
                                        <span class="perfume-gender"><?php echo isset($genderText[$perfume['gender']]) ? $genderText[$perfume['gender']] : 'Unisex'; ?></span>
                                        <span class="perfume-season"><?php echo isset($seasonText[$perfume['season']]) ? $seasonText[$perfume['season']] : 'All Seasons'; ?></span>
                                    </div>
                                    
                                    <p class="perfume-notes"><strong>Notes:</strong> <?php echo !empty($perfume['notes']) ? (strlen($perfume['notes']) > 100 ? substr($perfume['notes'], 0, 97) . '...' : $perfume['notes']) : 'No information available'; ?></p>
                                    
                                    <div class="price-container mb-2">
                                        <div class="d-flex flex-column">
                                            <span class="price">30ml: <?php echo $perfume['price_of_30ml'] > 0 ? number_format($perfume['price_of_30ml'], 0) : '---'; ?> TL</span>
                                            <span class="price">50ml: <?php echo $perfume['price_of_50ml'] > 0 ? number_format($perfume['price_of_50ml'], 0) : '---'; ?> TL</span>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-auto">
                                        <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                                            <button class="btn btn-primary incele-btn" data-id="<?php echo $perfume['id']; ?>">
                                                <i class="fas fa-search"></i> View
                                            </button>
                                            <button class="btn btn-light-blue add-to-cart-btn" data-id="<?php echo $perfume['id']; ?>" data-name="<?php echo htmlspecialchars($perfume['name']); ?>" data-price="<?php echo $perfume['price_of_30ml']; ?>" data-size="30ml">
                                                <i class="fas fa-shopping-cart"></i> 30ml
                                            </button>
                                            <button class="btn btn-light-blue add-to-cart-btn" data-id="<?php echo $perfume['id']; ?>" data-name="<?php echo htmlspecialchars($perfume['name']); ?>" data-price="<?php echo $perfume['price_of_50ml']; ?>" data-size="50ml">
                                                <i class="fas fa-shopping-cart"></i> 50ml
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <!-- Pagination -->
                <?php if ($searchResults['pages'] > 1): ?>
                    <nav aria-label="Search results pagination" class="mt-4">
                        <ul class="pagination justify-content-center">
                            <?php if ($page > 1): ?>
                                <li class="page-item">
                                    <a class="page-link" href="?q=<?php echo urlencode($searchQuery); ?>&page=<?php echo $page - 1; ?>">
                                        <i class="fas fa-chevron-left"></i> Previous
                                    </a>
                                </li>
                            <?php endif; ?>
                            
                            <?php for ($i = 1; $i <= $searchResults['pages']; $i++): ?>
                                <li class="page-item <?php echo $i == $page ? 'active' : ''; ?>">
                                    <a class="page-link" href="?q=<?php echo urlencode($searchQuery); ?>&page=<?php echo $i; ?>">
                                        <?php echo $i; ?>
                                    </a>
                                </li>
                            <?php endfor; ?>
                            
                            <?php if ($page < $searchResults['pages']): ?>
                                <li class="page-item">
                                    <a class="page-link" href="?q=<?php echo urlencode($searchQuery); ?>&page=<?php echo $page + 1; ?>">
                                        Next <i class="fas fa-chevron-right"></i>
                                    </a>
                                </li>
                            <?php endif; ?>
                        </ul>
                    </nav>
                <?php endif; ?>
            <?php endif; ?>
        </section>
    </main>
    
    <!-- Include Footer -->
    <?php include 'includes/footer.php'; ?>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.19/dist/sweetalert2.all.min.js"></script>
    
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

    <!-- Custom JS -->
    <script src="js/navigation.js"></script>
    <script src="js/main.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/wishlist.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/perfume-details.js"></script>
    <script src="js/search.js"></script>
    
    <!-- Initialize Auth for Search Page -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // İncele butonlarına tıklama olayı ekle
        const inceleButtons = document.querySelectorAll('.incele-btn');
        inceleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                if (typeof window.openPerfumeModal === 'function') {
                    window.openPerfumeModal(perfumeId);
                } else {
                    console.error('openPerfumeModal fonksiyonu bulunamadı');
                }
            });
        });
        
        // Sepete ekle butonlarına tıklama olayı ekle
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
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
                        title: 'Added to Cart',
                        text: `${perfumeName} (${perfumeSize}) has been added to your cart.`,
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
        
        // İstek listesi butonlarına tıklama olayı ekle
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        wishlistButtons.forEach(button => {
            button.addEventListener('click', function() {
                const perfumeId = this.getAttribute('data-id');
                if (typeof window.toggleWishlist === 'function') {
                    window.toggleWishlist(perfumeId);
                }
            });
        });
        // Check if login and register buttons exist
        const loginButton = document.getElementById('login-button');
        const registerButton = document.getElementById('register-button');
        
        // Custom login function that reloads the page after successful login
        function customLoginUser(email, password, rememberMe) {
            // Show loading
            Swal.fire({
                title: 'Logging In',
                text: 'Please wait...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Send login request
            fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    remember_me: rememberMe
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Login successful, user data:', data.user);
                    
                    // Show success message
                    Swal.fire({
                        title: 'Success',
                        text: 'Login successful. Welcome!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Store user data in session storage for persistence
                        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('userName', data.user.name);
                        
                        // Reload the page to update the header
                        window.location.reload();
                    });
                } else {
                    console.error('Login failed:', data.message);
                    
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'An error occurred during registration.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#9c27b0'
                    });
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while logging in. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#9c27b0'
                });
            });
        }
        
        // Custom register function that reloads the page after successful registration
        function customRegisterUser(name, email, password) {
            // Show loading
            Swal.fire({
                title: 'Registering',
                text: 'Please wait...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Send register request
            fetch('api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    Swal.fire({
                        title: 'Successful',
                        text: 'Registration successful. Welcome!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Store user data for persistence
                        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('userName', data.user.name);
                        
                        // Reload the page to update the header
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'An error occurred during registration.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#9c27b0'
                    });
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred during registration. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#9c27b0'
                });
            });
        }
        
        // Reinitialize login button if it exists
        if (loginButton) {
            loginButton.addEventListener('click', function(e) {
                e.preventDefault();
                Swal.fire({
                    title: 'Login',
                    html: `
                        <form id="login-form-modal" class="auth-form">
                            <div class="mb-3">
                                <label for="login-email-modal" class="form-label">Email</label>
                                <input type="email" class="form-control" id="login-email-modal" required>
                            </div>
                            <div class="mb-3">
                                <label for="login-password-modal" class="form-label">Password</label>
                                <input type="password" class="form-control" id="login-password-modal" required>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="remember-me-modal">
                                <label class="form-check-label" for="remember-me-modal">Remember me</label>
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Login',
                    cancelButtonText: 'Cancel',
                    focusConfirm: false,
                    preConfirm: () => {
                        const email = document.getElementById('login-email-modal').value;
                        const password = document.getElementById('login-password-modal').value;
                        const rememberMe = document.getElementById('remember-me-modal').checked;
                        
                        if (!email) {
                            Swal.showValidationMessage('Email is required');
                            return false;
                        }
                        
                        if (!password) {
                            Swal.showValidationMessage('Password is required');
                            return false;
                        }
                        
                        return { email, password, rememberMe };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const { email, password, rememberMe } = result.value;
                        customLoginUser(email, password, rememberMe);
                    }
                });
            });
        }
        
        // Reinitialize register button if it exists
        if (registerButton) {
            registerButton.addEventListener('click', function(e) {
                e.preventDefault();
                Swal.fire({
                    title: 'Register',
                    html: `
                        <form id="register-form-modal" class="auth-form">
                            <div class="mb-3">
                                <label for="register-name-modal" class="form-label">Name Surname</label>
                                <input type="text" class="form-control" id="register-name-modal" required>
                            </div>
                            <div class="mb-3">
                                <label for="register-email-modal" class="form-label">Email</label>
                                <input type="email" class="form-control" id="register-email-modal" required>
                            </div>
                            <div class="mb-3">
                                <label for="register-password-modal" class="form-label">Password</label>
                                <input type="password" class="form-control" id="register-password-modal" required>
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Register',
                    cancelButtonText: 'Cancel',
                    focusConfirm: false,
                    preConfirm: () => {
                        const name = document.getElementById('register-name-modal').value;
                        const email = document.getElementById('register-email-modal').value;
                        const password = document.getElementById('register-password-modal').value;
                        
                        if (!name) {
                            Swal.showValidationMessage('Name Surname is required');
                            return false;
                        }
                        
                        if (!email) {
                            Swal.showValidationMessage('Email is required');
                            return false;
                        }
                        
                        if (!password) {
                            Swal.showValidationMessage('Password is required');
                            return false;
                        }
                        
                        return { name, email, password };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const { name, email, password } = result.value;
                        customRegisterUser(name, email, password);
                    }
                });
            });
        }
        
        // Check authentication state on page load
        if (typeof checkAuthState === 'function') {
            checkAuthState();
        }
    });
    </script>
</body>
</html>
