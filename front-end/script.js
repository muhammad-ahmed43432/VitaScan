// ============================================================================
// LocalStorage Database Functions (Temporary for FYP Part-1)
// ============================================================================
// NOTE: This is a temporary solution using browser localStorage.
// In production, this will be replaced with a proper backend database.
// Data is stored locally in the browser and will persist until cleared.
// ============================================================================
const DB_KEY = 'vitaScanUsers';

// Initialize users database in localStorage
function initUserDatabase() {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify([]));
    }
}

// Get all users from localStorage
function getAllUsers() {
    initUserDatabase();
    const usersJson = localStorage.getItem(DB_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

// Save user to localStorage
function saveUser(userData) {
    const users = getAllUsers();
    
    // Check if email already exists
    const emailExists = users.some(user => user.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
        throw new Error('An account with this email already exists.');
    }
    
    // Check if username already exists
    const usernameExists = users.some(user => user.username.toLowerCase() === userData.username.toLowerCase());
    if (usernameExists) {
        throw new Error('This username is already taken.');
    }
    
    // Add new user
    const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        password: userData.password, // In production, this would be hashed
        createdAt: new Date().toISOString(),
        verified: false // Email verification status
    };
    
    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    return newUser;
}

// Find user by email or username
function findUser(identifier) {
    const users = getAllUsers();
    return users.find(user => 
        user.email.toLowerCase() === identifier.toLowerCase() || 
        user.username.toLowerCase() === identifier.toLowerCase()
    );
}

// Validate user credentials
function validateCredentials(identifier, password) {
    const user = findUser(identifier);
    if (!user) {
        return { success: false, message: 'Invalid username/email or password.' };
    }
    if (user.password !== password) {
        return { success: false, message: 'Invalid username/email or password.' };
    }
    return { success: true, user };
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link and handle protected routes
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close mobile menu
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
            
            // Check for protected sections (will be handled by protection logic below)
        });
    });

    // Login Form Handler with Validation and Backend Simulation
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const formMessage = document.getElementById('formMessage');

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // Real-time validation
    function validateField(field, value) {
        const errorElement = document.getElementById(field.id + '-error');
        let isValid = true;
        let errorMessage = '';

        // Remove previous error/success states
        field.classList.remove('error', 'success');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }

        if (field.hasAttribute('required') && !value.trim()) {
            isValid = false;
            errorMessage = `${field.previousElementSibling?.querySelector('.label-text')?.textContent || 'This field'} is required`;
        } else if (field.id === 'username' && value.trim()) {
            if (value.trim().length < 3) {
                isValid = false;
                errorMessage = 'Username must be at least 3 characters';
            } else if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
                isValid = false;
                errorMessage = 'Username can only contain letters, numbers, and underscores';
            }
        } else if (field.id === 'password' && value.trim()) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters';
            }
        }

        if (!isValid && errorMessage) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
            }
        } else if (value.trim()) {
            field.classList.add('success');
        }

        return isValid;
    }

    // Add real-time validation
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            validateField(this, this.value);
        });
        usernameInput.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this, this.value);
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            validateField(this, this.value);
        });
        passwordInput.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this, this.value);
            }
        });
    }

    // Form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous messages
            hideFormMessage();
            
            // Validate all fields
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const usernameValid = validateField(usernameInput, username);
            const passwordValid = validateField(passwordInput, password);

            if (!usernameValid || !passwordValid) {
                showFormMessage('Please fix the errors above before submitting.', 'error');
                return;
            }

            // Show loading state
            setLoadingState(true);

            try {
                // Simulate backend API call
                // In a real application, this would be: await fetch('/api/login', { ... })
                const response = await simulateBackendAuth(username, password);
                
                if (response.success) {
                    // Store login state
                    setLoginState(true, username);
                    showFormMessage('Login successful! Redirecting...', 'success');
                    // Redirect to intended page or stay on login
                    redirectAfterLogin();
                } else {
                    showFormMessage(response.message || 'Invalid username or password. Please try again.', 'error');
                    usernameInput.classList.add('error');
                    passwordInput.classList.add('error');
                }
            } catch (error) {
                showFormMessage('An error occurred. Please try again later.', 'error');
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Authenticate user against localStorage database
    async function simulateBackendAuth(username, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Validate against localStorage database
        const result = validateCredentials(username, password);
        
        if (result.success) {
            return {
                success: true,
                message: 'Login successful',
                user: { 
                    username: result.user.username, 
                    email: result.user.email,
                    id: result.user.id 
                }
            };
        } else {
            return {
                success: false,
                message: result.message || 'Invalid username or password'
            };
        }
    }

    function setLoadingState(isLoading) {
        if (loginBtn) {
            loginBtn.disabled = isLoading;
            const btnText = loginBtn.querySelector('.btn-text');
            const btnLoader = loginBtn.querySelector('.btn-loader');
            
            if (isLoading) {
                if (btnText) btnText.style.display = 'none';
                if (btnLoader) btnLoader.style.display = 'flex';
            } else {
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        }
    }

    function showFormMessage(message, type = 'info') {
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type} show`;
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function hideFormMessage() {
        if (formMessage) {
            formMessage.classList.remove('show');
            formMessage.textContent = '';
        }
    }

    // Authentication Functions
    function setLoginState(isLoggedIn, username = null) {
        if (isLoggedIn) {
            sessionStorage.setItem('isLoggedIn', 'true');
            if (username) {
                sessionStorage.setItem('username', username);
            }
        } else {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
        }
    }

    function isUserLoggedIn() {
        return sessionStorage.getItem('isLoggedIn') === 'true';
    }

    function getLoggedInUsername() {
        return sessionStorage.getItem('username');
    }

    function logout() {
        setLoginState(false);
        // Redirect to login if on protected page
        const currentHash = window.location.hash;
        if (currentHash === '#scan' || currentHash === '#download') {
            window.location.hash = '#login';
        }
    }

    // Protected sections that require login
    const protectedSections = ['#scan', '#download'];

    // Check authentication when page loads or hash changes
    function checkProtectedAccess() {
        const currentHash = window.location.hash;
        if (protectedSections.includes(currentHash) && !isUserLoggedIn()) {
            // Store the intended destination
            sessionStorage.setItem('redirectAfterLogin', currentHash);
            // Redirect to login
            window.location.hash = '#login';
            // Show message
            setTimeout(() => {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    const formMessage = document.getElementById('formMessage');
                    if (formMessage) {
                        formMessage.textContent = 'Please login to access this section.';
                        formMessage.className = 'form-message info show';
                    }
                }
            }, 100);
            return false;
        }
        return true;
    }

    // Check on page load
    checkProtectedAccess();

    // Check on hash change (navigation)
    window.addEventListener('hashchange', function() {
        checkProtectedAccess();
    });

    // Intercept clicks on protected navigation links (using existing navLinks)
    navLinks.forEach(link => {
        const originalClick = link.onclick;
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Check if it's a protected section
            if (protectedSections.includes(href) && !isUserLoggedIn()) {
                e.preventDefault();
                e.stopPropagation();
                // Store intended destination
                sessionStorage.setItem('redirectAfterLogin', href);
                // Redirect to login
                window.location.hash = '#login';
                // Scroll to login section
                setTimeout(() => {
                    const loginSection = document.querySelector('#login');
                    if (loginSection) {
                        loginSection.scrollIntoView({ behavior: 'smooth' });
                        const formMessage = document.getElementById('formMessage');
                        if (formMessage) {
                            formMessage.textContent = 'Please login to access this section.';
                            formMessage.className = 'form-message info show';
                        }
                    }
                }, 100);
                return false;
            }
        });
    });

    // Redirect to intended page after successful login
    function redirectAfterLogin() {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin');
        if (redirectTo && isUserLoggedIn()) {
            sessionStorage.removeItem('redirectAfterLogin');
            setTimeout(() => {
                window.location.hash = redirectTo;
                const targetSection = document.querySelector(redirectTo);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 1500);
        }
    }


    // Admin Mode Toggle - Hide/Show Sign Up Section
    const adminModeToggle = document.getElementById('adminModeToggle');
    const signupSection = document.getElementById('signupSection');

    if (adminModeToggle && signupSection) {
        // Check URL parameter or localStorage for admin mode
        const urlParams = new URLSearchParams(window.location.search);
        const isAdminMode = urlParams.get('admin') === 'true' || localStorage.getItem('adminMode') === 'true';
        
        if (isAdminMode) {
            adminModeToggle.checked = true;
            signupSection.style.display = 'none';
        }

        adminModeToggle.addEventListener('change', function() {
            if (this.checked) {
                signupSection.style.display = 'none';
                localStorage.setItem('adminMode', 'true');
            } else {
                signupSection.style.display = 'block';
                localStorage.removeItem('adminMode');
            }
        });
    }

    // Scan Form Handler - Image Upload and Submit
    const scanForm = document.getElementById('scanForm');
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const scanBtn = document.getElementById('scanBtn');
    const scanResult = document.getElementById('scanResult');

    // Click to upload
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', function() {
            imageInput.click();
        });

        // File input change
        imageInput.addEventListener('change', function(e) {
            handleFileSelect(e.target.files[0]);
        });

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }

    // Handle file selection
    function handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPG, PNG, JPEG)');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Read and display preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadArea.style.display = 'none';
            scanBtn.disabled = false;
            scanResult.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // Remove image
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            imageInput.value = '';
            imagePreview.style.display = 'none';
            uploadArea.style.display = 'block';
            scanBtn.disabled = true;
            scanResult.style.display = 'none';
        });
    }

    // Submit scan form
    if (scanForm) {
        scanForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!imageInput.files || imageInput.files.length === 0) {
                alert('Please select an image first');
                return;
            }

            // Show loading state
            scanBtn.disabled = true;
            scanBtn.textContent = 'Scanning...';
            scanResult.style.display = 'none';

            // Simulate scanning process (demo only - no actual processing)
            setTimeout(function() {
                scanBtn.textContent = 'Scan Image for Analysis';
                scanBtn.disabled = false;
                scanResult.style.display = 'block';
                
                // Scroll to result
                scanResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 2000);
        });
    }

    // Download Report Handler
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // Check if jsPDF is available
            if (typeof window.jspdf !== 'undefined') {
                const { jsPDF } = window.jspdf;
                
                // Create a new PDF document
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                let yPosition = 20;
                
                // Set font and colors
                doc.setFontSize(20);
                doc.setTextColor(76, 175, 80); // Primary green
                doc.setFont(undefined, 'bold');
                doc.text('VITA SCAN', pageWidth / 2, yPosition, { align: 'center' });
                
                yPosition += 10;
                doc.setFontSize(16);
                doc.setTextColor(33, 150, 243); // Primary blue
                doc.text('VITAMIN ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });
                
                yPosition += 15;
                doc.setDrawColor(200, 200, 200);
                doc.line(20, yPosition, pageWidth - 20, yPosition);
                
                yPosition += 10;
                doc.setFontSize(11);
                doc.setTextColor(100, 100, 100);
                doc.setFont(undefined, 'normal');
                const reportDate = new Date().toLocaleDateString();
                const reportTime = new Date().toLocaleTimeString();
                doc.text(`Report Date: ${reportDate}`, 20, yPosition);
                doc.text(`Report Time: ${reportTime}`, pageWidth - 20, yPosition, { align: 'right' });
                
                yPosition += 15;
                doc.setFontSize(14);
                doc.setTextColor(76, 175, 80);
                doc.setFont(undefined, 'bold');
                doc.text('PATIENT INFORMATION', 20, yPosition);
                
                yPosition += 8;
                doc.setFontSize(11);
                doc.setTextColor(50, 50, 50);
                doc.setFont(undefined, 'normal');
                doc.text('This is a sample report for demonstration purposes.', 20, yPosition);
                
                yPosition += 15;
                doc.setFontSize(14);
                doc.setTextColor(76, 175, 80);
                doc.setFont(undefined, 'bold');
                doc.text('VITAMIN ANALYSIS RESULTS', 20, yPosition);
                
                yPosition += 8;
                doc.setFontSize(11);
                doc.setTextColor(50, 50, 50);
                doc.setFont(undefined, 'normal');
                const vitamins = [
                    'Vitamin A: Normal Range',
                    'Vitamin B12: Normal Range',
                    
                ];
                
                vitamins.forEach(vitamin => {
                    yPosition += 7;
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(vitamin, 25, yPosition);
                });
                
                yPosition += 15;
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.setFontSize(14);
                doc.setTextColor(76, 175, 80);
                doc.setFont(undefined, 'bold');
                doc.text('RECOMMENDATIONS', 20, yPosition);
                
                yPosition += 8;
                doc.setFontSize(11);
                doc.setTextColor(50, 50, 50);
                doc.setFont(undefined, 'normal');
                doc.text('This is a sample report generated by Vita Scan.', 20, yPosition);
                yPosition += 7;
                doc.text('For actual medical advice, please consult with a healthcare professional.', 20, yPosition);
                
                // Footer
                const totalPages = doc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFontSize(9);
                    doc.setTextColor(150, 150, 150);
                    doc.text('Vita Scan - Visual Health Screening System | Final Year Project - Part 1', pageWidth / 2, pageHeight - 10, { align: 'center' });
                    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
                }
                
                // Save the PDF
                const fileName = `VitaScan_Sample_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
                
                // Show feedback
                downloadBtn.textContent = 'Downloading...';
                downloadBtn.disabled = true;
                
                setTimeout(() => {
                    downloadBtn.textContent = 'Download Sample PDF Report';
                    downloadBtn.disabled = false;
                }, 2000);
            } else {
                // Fallback if jsPDF is not loaded
                alert('PDF library not loaded. Please refresh the page and try again.');
            }
        });
    }

    // Smooth scroll for navigation links (only for non-protected sections)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Skip if it's a protected section and user is not logged in
            if (protectedSections.includes(href) && !isUserLoggedIn()) {
                // Already handled by protection logic above
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll animation for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

