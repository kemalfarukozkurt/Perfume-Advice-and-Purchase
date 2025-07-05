/**
 * KAANI Perfume - Profile Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const birthDate = document.getElementById('birth_date').value;
            const address = document.getElementById('address').value.trim();
            const currentPassword = document.getElementById('current_password').value;
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            // Validate form
            if (!name) {
                showAlert('error', 'Ad soyad alanı boş bırakılamaz.');
                return;
            }
            
            if (!currentPassword) {
                showAlert('error', 'Mevcut şifre alanı boş bırakılamaz.');
                return;
            }
            
            // Check if new password and confirm password match
            if (newPassword && newPassword !== confirmPassword) {
                showAlert('error', 'Yeni şifre ve şifre tekrarı eşleşmiyor.');
                return;
            }
            
            // Show loading state
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Güncelleniyor...';
            submitBtn.disabled = true;
            
            // Prepare data
            const formData = {
                name: name,
                phone: phone,
                birth_date: birthDate,
                address: address,
                current_password: currentPassword,
                new_password: newPassword
            };
            
            // Send update request
            fetch('api/update_profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                if (data.success) {
                    // Clear password fields
                    document.getElementById('current_password').value = '';
                    document.getElementById('new_password').value = '';
                    document.getElementById('confirm_password').value = '';
                    
                    // Show success message
                    showAlert('success', data.message || 'Profil bilgileriniz başarıyla güncellendi.');
                } else {
                    // Show error message
                    showAlert('error', data.message || 'Profil güncellenirken bir hata oluştu.');
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                showAlert('error', 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            });
        });
    }
    
    // Helper function to show alerts
    function showAlert(type, message) {
        Swal.fire({
            icon: type === 'success' ? 'success' : 'error',
            title: type === 'success' ? 'Başarılı!' : 'Hata!',
            text: message,
            confirmButtonText: 'Tamam',
            confirmButtonColor: '#6c5ce7'
        });
    }
});
