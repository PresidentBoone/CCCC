/**
 * Universal Navbar Initialization
 * Handles navbar functionality across all authenticated pages
 */

(function() {
    'use strict';

    // Wait for DOM and Firebase
    function initializeNavbar(auth, db) {
        console.log('🔧 Initializing universal navbar...');

        const profileDropdown = document.getElementById('ccProfileDropdown');
        const profileButton = document.getElementById('ccProfileButton');
        const dropdownMenu = document.getElementById('ccDropdownMenu');
        const themeToggle = document.getElementById('ccThemeToggle');
        const profileLoading = document.getElementById('ccProfileLoading');
        const profileContent = document.getElementById('ccProfileContent');
        const dropdownHeader = document.getElementById('ccDropdownHeader');
        const logoutBtn = document.getElementById('ccLogoutBtn');
        const navbarLogo = document.getElementById('ccNavbarLogo');

        // Theme Management
        function initTheme() {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.body.setAttribute('data-theme', savedTheme);
            updateThemeButton(savedTheme);
            updateLogo(savedTheme);
        }

        function updateThemeButton(theme) {
            if (themeToggle) {
                themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        }

        function updateLogo(theme) {
            if (navbarLogo) {
                navbarLogo.src = theme === 'dark' ? 'images/whiteclearcc.png' : 'images/blackcc.png';
            }
        }

        function toggleTheme() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
            updateLogo(newTheme);
        }

        // Dropdown Management
        function toggleDropdown(event) {
            event?.stopPropagation();
            const isOpen = dropdownMenu?.classList.contains('show');
            
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            dropdownMenu?.classList.add('show');
            profileDropdown?.classList.add('open');
        }

        function closeDropdown() {
            dropdownMenu?.classList.remove('show');
            profileDropdown?.classList.remove('open');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!profileDropdown?.contains(event.target)) {
                closeDropdown();
            }
        });

        // User Profile Management
        async function loadUserData(user) {
            try {
                // Show loading state
                if (profileLoading) profileLoading.style.display = 'block';
                if (profileContent) profileContent.style.display = 'none';

                // Load user document from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};

                // Hide loading, show content
                if (profileLoading) profileLoading.style.display = 'none';
                if (profileContent) profileContent.style.display = 'block';

                // Update UI
                updateNavbarUI(user, userData);
                
                console.log('✅ Navbar user data loaded');
            } catch (error) {
                console.error('Error loading navbar user data:', error);
                // Show default state on error
                if (profileLoading) profileLoading.style.display = 'none';
                if (profileContent) profileContent.style.display = 'block';
                updateNavbarUI(user, {});
            }
        }

        function updateNavbarUI(user, userData) {
            // Update profile avatar
            const avatarImg = document.createElement('img');
            avatarImg.id = 'ccUserAvatar';
            avatarImg.className = 'cc-user-avatar';
            avatarImg.src = userData.profilePhotoURL || user.photoURL || 'images/default-avatar.png';
            avatarImg.alt = 'Profile';
            
            if (profileContent) {
                profileContent.innerHTML = '';
                profileContent.appendChild(avatarImg);
            }

            // Update dropdown header
            if (dropdownHeader) {
                const displayName = userData.name || user.displayName || 'Student';
                const email = user.email || '';

                dropdownHeader.innerHTML = `
                    <div class="cc-dropdown-welcome">Hello,</div>
                    <div class="cc-dropdown-name">${displayName}</div>
                    <div class="cc-dropdown-email">${email}</div>
                `;
            }

            // Update dropdown links
            updateDropdownLinks();
        }

        function updateDropdownLinks() {
            const links = document.querySelectorAll('.cc-dropdown-link:not(.cc-logout-link)');
            const linkData = [
                { href: '/dashboard', icon: '📊', text: 'Dashboard' },
                { href: '/essay-coach', icon: '✍️', text: 'Essay Coach' },
                { href: '/timeline', icon: '📅', text: 'Timeline' },
                { href: '/testprep', icon: '📝', text: 'Test Prep' },
                { href: 'scholarship.html', icon: '💰', text: 'Scholarships' },
                { href: 'document.html', icon: '📄', text: 'Documents' },
                { href: '/profile', icon: '👤', text: 'Profile' }
            ];

            links.forEach((link, index) => {
                if (linkData[index]) {
                    link.href = linkData[index].href;
                    link.innerHTML = `
                        <span class="cc-dropdown-link-icon">${linkData[index].icon}</span>
                        <span>${linkData[index].text}</span>
                    `;
                }
            });

            // Update logout link
            if (logoutBtn) {
                logoutBtn.innerHTML = `
                    <span class="cc-dropdown-link-icon">🚪</span>
                    <span>Logout</span>
                `;
            }
        }

        // Logout handler
        async function handleLogout(event) {
            event.preventDefault();
            try {
                await signOut(auth);
                window.location.href = '/';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to logout. Please try again.');
            }
        }

        // Event Listeners
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        if (profileButton) {
            profileButton.addEventListener('click', toggleDropdown);
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Initialize theme
        initTheme();

        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                loadUserData(user);
            } else {
                // Redirect to login if not authenticated
                const publicPages = ['/', '/index', '/about', '/pricing', '/login', '/signup'];
                const currentPage = window.location.pathname;

                if (!publicPages.includes(currentPage) && !publicPages.includes(currentPage.replace('.html', ''))) {
                    window.location.href = '/login';
                }
            }
        });

        console.log('✅ Universal navbar initialized');
    }

    // Export to global scope
    window.initializeNavbar = initializeNavbar;

})();
