/**
 * KAANI Perfume - Authentication Functions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Auth elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const profileDropdown = document.getElementById('profile-dropdown');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButtons = document.querySelectorAll('.logout-button');
    
    // Login button click
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Normalde bir modal açılacak, ancak şimdilik bir uyarı gösterelim
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
                            <label class="form-check-label" for="remember-me-modal">Remember Me</label>
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
                        Swal.showValidationMessage('Email address required');
                        return false;
                    }
                    
                    if (!password) {
                        Swal.showValidationMessage('Şifre gerekli');
                        return false;
                    }
                    
                    return { email, password, rememberMe };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { email, password, rememberMe } = result.value;
                    loginUser(email, password, rememberMe);
                }
            });
        });
    }
    
    // Register button click
    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            Swal.fire({
                title: 'Sign up',
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
                confirmButtonText: 'Sign up',
                cancelButtonText: 'Cancel',
                focusConfirm: false,
                preConfirm: () => {
                    const name = document.getElementById('register-name-modal').value;
                    const email = document.getElementById('register-email-modal').value;
                    const password = document.getElementById('register-password-modal').value;
                    
                    if (!name) {
                        Swal.showValidationMessage('Name and Surname required');
                        return false;
                    }
                    
                    if (!email) {
                        Swal.showValidationMessage('Email address required');
                        return false;
                    }
                    
                    if (!password) {
                        Swal.showValidationMessage('Password required');
                        return false;
                    }
                    
                    return { name, email, password };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { name, email, password } = result.value;
                    registerUser(name, email, password);
                }
            });
        });
    }
    
    // Initialize auth state
    checkAuthState();
    
    // Login user function
    function loginUser(email, password, rememberMe) {
        // Show loading
        Swal.fire({
            title: 'Logging in',
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
                    title: 'Successful',
                    text: 'Login successful. Welcome!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Store user data in session storage for persistence
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // Update auth state
                updateAuthState(data.user);
            } else {
                console.error('Login failed:', data.message);
                
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'An error occurred while logging in.',
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
    
    // Register user function
    function registerUser(name, email, password) {
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
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Update auth state
                updateAuthState(data.user);
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
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('#login-email').value;
            const password = this.querySelector('#login-password').value;
            const rememberMe = this.querySelector('#remember-me').checked;
            
            // Validate inputs
            if (!email || !password) {
                showAuthError('login-error', 'Please fill in all fields.');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
            submitButton.disabled = true;
            
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
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    if (data.success) {
                        // Close modal
                        $('#loginModal').modal('hide');
                        
                        // Show success message
                        Swal.fire({
                            title: 'Successful',
                            text: 'Login successful. Welcome!',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        
                        // Update auth state
                        updateAuthState(data.user);
                        
                        // Reset form
                        loginForm.reset();
                    } else {
                        showAuthError('login-error', data.message || 'An error occurred while logging in.');
                    }
                })
                .catch(error => {
                    console.error('Error during login:', error);
                    
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    showAuthError('login-error', 'An error occurred while logging in. Please try again later.');
                });
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('#register-name').value;
            const email = this.querySelector('#register-email').value;
            const password = this.querySelector('#register-password').value;
            const confirmPassword = this.querySelector('#register-confirm-password').value;
            
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                showAuthError('register-error', 'Please fill in all fields.');
                return;
            }
            
            if (password !== confirmPassword) {
                showAuthError('register-error', 'Passwords do not match.');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
            submitButton.disabled = true;
            
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
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    if (data.success) {
                        // Close modal
                        $('#registerModal').modal('hide');
                        
                        // Show success message
                        Swal.fire({
                            title: 'Successful',
                            text: 'Registration successful. Welcome!',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        
                        // Update auth state
                        updateAuthState(data.user);
                        
                        // Reset form
                        registerForm.reset();
                    } else {
                        showAuthError('register-error', data.message || 'An error occurred during registration.');
                    }
                })
                .catch(error => {
                    console.error('Error during registration:', error);
                    
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    showAuthError('register-error', 'An error occurred during registration. Please try again later.');
                });
        });
    }
    
    // Forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('#forgot-email').value;
            
            // Validate input
            if (!email) {
                showAuthError('forgot-error', 'Please enter your email address.');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
            submitButton.disabled = true;
            
            // Send forgot password request
            fetch('api/forgot_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email
                })
            })
                .then(response => response.json())
                .then(data => {
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    if (data.success) {
                        // Close modal
                        $('#forgotPasswordModal').modal('hide');
                        
                        // Show success message
                        Swal.fire({
                            title: 'Successful',
                            text: 'A password reset link has been sent to your email address.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#9c27b0'
                        });
                        
                        // Reset form
                        forgotPasswordForm.reset();
                    } else {
                        showAuthError('forgot-error', data.message || 'An error occurred while sending the password reset link.');
                    }
                })
                .catch(error => {
                    console.error('Error during forgot password:', error);
                    
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    showAuthError('forgot-error', 'An error occurred while sending the password reset link. Please try again later.');
                });
        });
    }
    
    // Logout button click
    if (logoutButtons) {
        logoutButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Send logout request
                fetch('api/logout.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Show success message
                            Swal.fire({
                                title: 'Successful',
                                text: 'Log out successful. Goodbye!',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });
                            
                            // Update auth state
                            updateAuthState(null);
                        } else {
                            Swal.fire({
                                title: 'Error',
                                text: data.message || 'An error occurred while logging out.',
                                icon: 'error',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#9c27b0'
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error during logout:', error);
                        
                        Swal.fire({
                            title: 'Error',
                            text: 'An error occurred while logging out. Please try again later.',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#9c27b0'
                        });
                    });
            });
        });
    }
    
    // Login button click
    const loginButtons = document.querySelectorAll('.login-button');
    if (loginButtons && loginButtons.length > 0) {
        loginButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Open login modal
                $('#loginModal').modal('show');
            });
        });
    }
    
    // Register button click
    if (registerButtons) {
        registerButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Open register modal
                $('#registerModal').modal('show');
            });
        });
    }
    
    // Check auth state
    function checkAuthState() {
        fetch('api/check_login.php')
            .then(response => response.json())
            .then(data => {
                if (data.logged_in) {
                    updateAuthState(data.user);
                } else {
                    updateAuthState(null);
                }
            })
            .catch(error => {
                console.error('Error checking auth state:', error);
                updateAuthState(null);
            });
    }
    
    // Update auth state
    function updateAuthState(user) {
        console.log('Updating auth state:', user ? 'User logged in' : 'User logged out');
        
        try {
            // Get all relevant elements
            const authButtonsContainer = document.querySelector('.d-flex.align-items-center');
            const userDropdowns = document.querySelectorAll('.user-dropdown');
            const loginButtons = document.querySelectorAll('#login-button');
            const registerButtons = document.querySelectorAll('#register-button');
            
            if (user) {
                // User is logged in
                document.body.classList.add('logged-in');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', user.name);
                
                // Handle user dropdowns in the header
                if (userDropdowns.length === 0 && authButtonsContainer) {
                    // Remove login and register buttons if they exist
                    loginButtons.forEach(button => {
                        if (button && button.parentNode) button.parentNode.removeChild(button);
                    });
                    
                    registerButtons.forEach(button => {
                        if (button && button.parentNode) button.parentNode.removeChild(button);
                    });
                    
                    // Create new user dropdown
                    const userDropdownDiv = document.createElement('div');
                    userDropdownDiv.className = 'dropdown user-dropdown';
                    userDropdownDiv.innerHTML = `
                        <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user"></i> ${user.name}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item logout-button" href="#"><i class="fas fa-sign-out-alt"></i> Log Out</a></li>
                        </ul>
                    `;
                    
                    // Insert the user dropdown before the wishlist icon
                    const wishlistIcon = document.getElementById('wishlist-link-icon');
                    if (wishlistIcon && authButtonsContainer) {
                        authButtonsContainer.insertBefore(userDropdownDiv, wishlistIcon);
                    } else if (authButtonsContainer) {
                        // If wishlist icon doesn't exist, append to the container
                        authButtonsContainer.appendChild(userDropdownDiv);
                    }
                } else {
                    // Update existing user dropdowns
                    userDropdowns.forEach(dropdown => {
                        dropdown.innerHTML = `
                            <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-user"></i> ${user.name}
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item logout-button" href="#"><i class="fas fa-sign-out-alt"></i> Log out</a></li>
                            </ul>
                        `;
                        dropdown.style.display = 'block';
                    });
                    
                    // Hide login/register buttons if they exist
                    loginButtons.forEach(button => {
                        if (button) button.style.display = 'none';
                    });
                    
                    registerButtons.forEach(button => {
                        if (button) button.style.display = 'none';
                    });
                }
                
                // Update profile dropdown if it exists (for sidebar navigation)
                const profileDropdown = document.querySelector('.profile-dropdown');
                if (profileDropdown) {
                    profileDropdown.innerHTML = `
                        <a class="nav-link dropdown-toggle" href="#" id="profileDropdownMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-user-circle"></i> ${user.name}
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="profileDropdownMenu">
                            <li><a class="dropdown-item logout-button" href="#">Log out</a></li>
                        </ul>
                    `;
                    profileDropdown.style.display = 'block';
                }
                
                // Update any other user-specific elements on the page
                document.querySelectorAll('.user-name-display').forEach(element => {
                    element.textContent = user.name;
                });
            } else {
                // User is logged out
                document.body.classList.remove('logged-in');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userName');
                
                // Remove user dropdowns
                userDropdowns.forEach(dropdown => {
                    if (dropdown && dropdown.parentNode) {
                        dropdown.parentNode.removeChild(dropdown);
                    }
                });
                
                // Create login and register buttons if they don't exist
                if ((loginButtons.length === 0 || registerButtons.length === 0) && authButtonsContainer) {
                    // Only create buttons if they don't exist
                    if (loginButtons.length === 0) {
                        const loginButton = document.createElement('a');
                        loginButton.href = '#';
                        loginButton.id = 'login-button';
                        loginButton.className = 'btn btn-outline-light me-2';
                        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                        
                        // Insert the login button before the wishlist icon
                        const wishlistIcon = document.getElementById('wishlist-link-icon');
                        if (wishlistIcon && authButtonsContainer) {
                            authButtonsContainer.insertBefore(loginButton, wishlistIcon);
                        } else if (authButtonsContainer) {
                            // If wishlist icon doesn't exist, append to the container
                            authButtonsContainer.appendChild(loginButton);
                        }
                        
                        // Add event listener
                        loginButton.addEventListener('click', function(e) {
                            e.preventDefault();
                            showLoginModal();
                        });
                    }
                    
                    if (registerButtons.length === 0) {
                        const registerButton = document.createElement('a');
                        registerButton.href = '#';
                        registerButton.id = 'register-button';
                        registerButton.className = 'btn btn-light';
                        registerButton.innerHTML = '<i class="fas fa-user-plus"></i> Sign up';
                        
                        // Insert the register button before the wishlist icon
                        const wishlistIcon = document.getElementById('wishlist-link-icon');
                        const loginButton = document.getElementById('login-button');
                        
                        if (loginButton && authButtonsContainer) {
                            // Insert after login button
                            loginButton.after(registerButton);
                        } else if (wishlistIcon && authButtonsContainer) {
                            // Insert before wishlist icon
                            authButtonsContainer.insertBefore(registerButton, wishlistIcon);
                        } else if (authButtonsContainer) {
                            // If wishlist icon doesn't exist, append to the container
                            authButtonsContainer.appendChild(registerButton);
                        }
                        
                        // Add event listener
                        registerButton.addEventListener('click', function(e) {
                            e.preventDefault();
                            showRegisterModal();
                        });
                    }
                } else {
                    // Show existing login/register buttons
                    loginButtons.forEach(button => {
                        if (button) button.style.display = 'inline-block';
                    });
                    
                    registerButtons.forEach(button => {
                        if (button) button.style.display = 'inline-block';
                    });
                }
                
                // Hide profile dropdown if it exists
                const profileDropdown = document.querySelector('.profile-dropdown');
                if (profileDropdown) {
                    profileDropdown.style.display = 'none';
                }
            }
            
            // Add event listeners to all logout buttons
            document.querySelectorAll('.logout-button').forEach(button => {
                if (button) {
                    // Remove existing event listeners by cloning and replacing
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    newButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        console.log('Logout button clicked');
                        
                        // Send logout request
                        fetch('api/logout.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Show success message
                                Swal.fire({
                                    title: 'Successful',
                                    text: 'Logout successful. Goodbye!',
                                    icon: 'success',
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                                
                                // Update auth state
                                updateAuthState(null);
                            } else {
                                Swal.fire({
                                    title: 'Error',
                                    text: data.message || 'An error occurred while logging out.',
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#9c27b0'
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error during logout:', error);
                            
                            Swal.fire({
                                title: 'Error',
                                text: 'An error occurred while logging out. Please try again later.',
                                icon: 'error',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#9c27b0'
                            });
                        });
                    });
                }
            });
            
            // Reinitialize Bootstrap dropdowns
            if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(element => {
                    try {
                        new bootstrap.Dropdown(element);
                    } catch (error) {
                        console.error('Error initializing dropdown:', error);
                    }
                });
            }
        } catch (error) {
            console.error('Error updating auth state:', error);
        }
    }
    
    // Helper function to show login modal
    function showLoginModal() {
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
                        <label class="form-check-label" for="remember-me-modal">Remember Me</label>
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
                    Swal.showValidationMessage('Email address required');
                    return false;
                }
                
                if (!password) {
                    Swal.showValidationMessage('Password required');
                    return false;
                }
                
                return { email, password, rememberMe };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { email, password, rememberMe } = result.value;
                loginUser(email, password, rememberMe);
            }
        });
    }
    
    // Helper function to show register modal
    function showRegisterModal() {
        Swal.fire({
            title: 'Sign up',
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
            confirmButtonText: 'Sign up',
            cancelButtonText: 'Cancel',
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('register-name-modal').value;
                const email = document.getElementById('register-email-modal').value;
                const password = document.getElementById('register-password-modal').value;
                
                if (!name) {
                    Swal.showValidationMessage('Name Surname required');
                    return false;
                }
                
                if (!email) {
                    Swal.showValidationMessage('Email address required');
                    return false;
                }
                
                if (!password) {
                    Swal.showValidationMessage('Password required');
                    return false;
                }
                
                return { name, email, password };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { name, email, password } = result.value;
                registerUser(name, email, password);
            }
        });
    }
    
    // Show auth error
    function showAuthError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }
    
    // Switch between login and register forms
    document.querySelectorAll('.switch-to-register').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            $('#loginModal').modal('hide');
            $('#registerModal').modal('show');
        });
    });
    
    document.querySelectorAll('.switch-to-login').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            $('#registerModal').modal('hide');
            $('#loginModal').modal('show');
        });
    });
    
    document.querySelectorAll('.switch-to-forgot').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            $('#loginModal').modal('hide');
            $('#forgotPasswordModal').modal('show');
        });
    });
    
    document.querySelectorAll('.switch-to-login-from-forgot').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            $('#forgotPasswordModal').modal('hide');
            $('#loginModal').modal('show');
        });
    });
});
