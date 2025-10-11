#!/bin/bash

# Files that still need navbar updates
files=("public/signup.html" "public/about.html" "public/pricing.html" "public/testprep-practice.html")

navbar_html='    <!-- ============================================
         UNIVERSAL NAVBAR
         ============================================ -->
    <nav class="cc-navbar">
        <!-- Logo Section -->
        <a href="index.html" class="cc-logo-section">
            <div class="cc-logo">
                <img id="ccNavbarLogo" src="images/whiteclearcc.png" alt="College Climb Logo">
            </div>
            <div class="cc-brand-text">
                <h1>College</h1>
                <h2>Climb</h2>
            </div>
        </a>

        <!-- Right Side Navigation -->
        <div class="cc-nav-right">
            <!-- Theme Toggle -->
            <button class="cc-theme-toggle" id="ccThemeToggle" aria-label="Toggle theme">
                ☀️
            </button>
            
            <!-- Navigation Links -->
            <a href="login.html" class="cc-nav-link">Login</a>
            <a href="signup.html" class="cc-nav-button">Get Started</a>
        </div>
    </nav>'

navbar_js='
    <!-- Universal Navbar JavaScript -->
    <script type="module">
        function initTheme() {
            const savedTheme = localStorage.getItem("theme") || "dark";
            document.body.setAttribute("data-theme", savedTheme);
            updateThemeButton(savedTheme);
            updateLogo(savedTheme);
        }

        function updateThemeButton(theme) {
            const themeToggle = document.getElementById("ccThemeToggle");
            if (themeToggle) {
                themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
            }
        }

        function updateLogo(theme) {
            const logo = document.getElementById("ccNavbarLogo");
            if (logo) {
                logo.src = theme === "dark" ? "images/whiteclearcc.png" : "blackcc.png";
            }
        }

        function toggleTheme() {
            const currentTheme = document.body.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateThemeButton(newTheme);
            updateLogo(newTheme);
        }

        document.addEventListener("DOMContentLoaded", function() {
            initTheme();
            const themeToggle = document.getElementById("ccThemeToggle");
            if (themeToggle) {
                themeToggle.addEventListener("click", toggleTheme);
            }
        });
    </script>'

echo "Batch updating navbar across remaining HTML files..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Check if file already has cc-navbar
        if grep -q "cc-navbar" "$file"; then
            echo "  ✅ $file already has universal navbar"
            continue
        fi
        
        # Add navbar after <body> tag
        sed -i '' "/<body[^>]*>/a\\
$navbar_html" "$file"
        
        # Add JavaScript before </body>
        sed -i '' "s|</body>|$navbar_js</body>|" "$file"
        
        echo "  ✅ Updated $file"
    else
        echo "  ❌ File not found: $file"
    fi
done

echo "✅ Batch navbar update complete!"
