/**
 * KAANI Perfume - Orders Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize orders events
    initOrdersEvents();
    
    // Check auth state to update UI
    checkAuthState();
    
    /**
     * Initialize orders event listeners
     */
    function initOrdersEvents() {
        // Review modal events
        const reviewModal = document.getElementById('reviewModal');
        if (reviewModal) {
            // When the review modal is shown, load order items
            reviewModal.addEventListener('show.bs.modal', function(event) {
                const button = event.relatedTarget;
                const orderId = button.getAttribute('data-order-id');
                
                // Set order ID in the form
                document.getElementById('order_id').value = orderId;
                
                // Load order items for review
                loadOrderItemsForReview(orderId);
            });
            
            // Rating stars
            const ratingStars = document.querySelectorAll('.rating-stars i');
            ratingStars.forEach(star => {
                star.addEventListener('mouseover', function() {
                    const rating = parseInt(this.dataset.rating);
                    updateStars(rating);
                });
                
                star.addEventListener('mouseout', function() {
                    const currentRating = parseInt(document.getElementById('rating').value);
                    updateStars(currentRating);
                });
                
                star.addEventListener('click', function() {
                    const rating = parseInt(this.dataset.rating);
                    document.getElementById('rating').value = rating;
                    updateStars(rating);
                });
            });
            
            // Submit review button
            const submitReviewButton = document.getElementById('submitReview');
            if (submitReviewButton) {
                submitReviewButton.addEventListener('click', submitReview);
            }
        }
        
        // Invoice download buttons
        const invoiceButtons = document.querySelectorAll('button[data-order-id]');
        invoiceButtons.forEach(button => {
            if (!button.hasAttribute('data-bs-toggle')) { // Skip review modal buttons
                button.addEventListener('click', function() {
                    const orderId = this.getAttribute('data-order-id');
                    downloadInvoice(orderId);
                });
            }
        });
    }
    
    /**
     * Load order items for review
     * @param {string} orderId - The order ID
     */
    function loadOrderItemsForReview(orderId) {
        // Show loading state
        const selectElement = document.getElementById('perfume_id');
        selectElement.innerHTML = '<option value="">Loading...</option>';
        selectElement.disabled = true;
        
        // Send request to get order items
        fetch(`api/get_order_items.php?order_id=${orderId}`)
            .then(response => response.json())
            .then(data => {
                // Reset select element
                selectElement.innerHTML = '<option value="">Select Product</option>';
                selectElement.disabled = false;
                
                if (data.success && data.items.length > 0) {
                    // Add options for each item
                    data.items.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.perfume_id;
                        option.textContent = `${item.name} (${item.brand})`;
                        selectElement.appendChild(option);
                    });
                } else {
                    // Show error message
                    selectElement.innerHTML = '<option value="">Products could not be loaded</option>';
                    selectElement.disabled = true;
                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Hata!',
                        text: data.message || 'An error occurred while loading the order products.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#6c5ce7'
                    });
                }
            })
            .catch(error => {
                console.error('Error loading order items:', error);
                selectElement.innerHTML = '<option value="">Products could not be loaded</option>';
                selectElement.disabled = true;
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error has occurred. Please try again later.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#6c5ce7'
                });
            });
    }
    
    /**
     * Update rating stars
     * @param {number} rating - The rating value (1-5)
     */
    function updateStars(rating) {
        const stars = document.querySelectorAll('.rating-stars i');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star text-warning';
            } else {
                star.className = 'far fa-star';
            }
        });
    }
    
    /**
     * Submit a review
     */
    function submitReview() {
        // Get form values
        const orderId = document.getElementById('order_id').value;
        const perfumeId = document.getElementById('perfume_id').value;
        const rating = document.getElementById('rating').value;
        const reviewText = document.getElementById('review_text').value.trim();
        
        // Validate form
        if (!perfumeId) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Please select the product you wish to review.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6c5ce7'
            });
            return;
        }
        
        if (rating === '0') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Please rate the product.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6c5ce7'
            });
            return;
        }
        
        if (!reviewText) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Please write your comment.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6c5ce7'
            });
            return;
        }
        
        // Show loading state
        const submitButton = document.getElementById('submitReview');
        const originalHtml = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
        submitButton.disabled = true;
        
        // Send request to add review
        fetch('api/add_review.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                perfume_id: perfumeId,
                rating: rating,
                review: reviewText,
                order_id: orderId
            })
        })
        .then(response => response.json())
        .then(data => {
            // Reset button state
            submitButton.innerHTML = originalHtml;
            submitButton.disabled = false;
            
            if (data.success) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('perfume_id').value = '';
                document.getElementById('rating').value = '0';
                document.getElementById('review_text').value = '';
                updateStars(0);
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Thank you for your review.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#6c5ce7'
                });
            } else {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.message || 'An error occurred while sending your review.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#6c5ce7'
                });
            }
        })
        .catch(error => {
            console.error('Error submitting review:', error);
            submitButton.innerHTML = originalHtml;
            submitButton.disabled = false;
            
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error has occurred. Please try again later.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6c5ce7'
            });
        });
    }
    
    /**
     * Download invoice for an order
     * @param {string} orderId - The order ID
     */
    function downloadInvoice(orderId) {
        // Show loading state
        const button = document.querySelector(`button[data-order-id="${orderId}"]:not([data-bs-toggle])`);
        const originalHtml = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        button.disabled = true;
        
        // Send request to generate invoice
        fetch(`api/generate_invoice.php?order_id=${orderId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                // Reset button state
                button.innerHTML = originalHtml;
                button.disabled = false;
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `fatura-${orderId}.pdf`;
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(error => {
                console.error('Error downloading invoice:', error);
                button.innerHTML = originalHtml;
                button.disabled = false;
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred while downloading the invoice. Please try again later.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#6c5ce7'
                });
            });
    }
});
