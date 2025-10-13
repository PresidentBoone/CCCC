#!/bin/bash

# 🖼️ Image Optimization Script
# Converts images to WebP format for better performance

echo "🖼️  College Climb - Image Optimization Script"
echo "=============================================="
echo ""

# Check if cwebp is installed (WebP encoder)
if ! command -v cwebp &> /dev/null; then
    echo "⚠️  cwebp not found. Installing..."
    
    # Install based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install webp
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y webp
    else
        echo "❌ Unsupported OS. Please install webp manually."
        exit 1
    fi
fi

# Create WebP versions of images
echo "📁 Finding images in /public/images..."
echo ""

IMAGE_DIR="public/images"
TOTAL=0
CONVERTED=0
SKIPPED=0

# Find all PNG and JPG images
for img in "$IMAGE_DIR"/*.{png,jpg,jpeg,PNG,JPG,JPEG} 2>/dev/null; do
    # Skip if no files found
    [ -e "$img" ] || continue
    
    TOTAL=$((TOTAL + 1))
    
    # Get filename without extension
    filename=$(basename "$img")
    name="${filename%.*}"
    webp_file="$IMAGE_DIR/$name.webp"
    
    # Check if WebP version already exists
    if [ -f "$webp_file" ]; then
        echo "⏭️  Skipping $filename (WebP exists)"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    # Convert to WebP
    echo "🔄 Converting $filename to WebP..."
    cwebp -q 85 "$img" -o "$webp_file" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        # Get file sizes
        original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
        webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file")
        
        # Calculate savings
        savings=$((100 - (webp_size * 100 / original_size)))
        
        echo "   ✅ Saved ${savings}% ($(numfmt --to=iec-i --suffix=B $original_size) → $(numfmt --to=iec-i --suffix=B $webp_size))"
        CONVERTED=$((CONVERTED + 1))
    else
        echo "   ❌ Failed to convert $filename"
    fi
    echo ""
done

# Summary
echo "=============================================="
echo "📊 Summary:"
echo "   Total images found: $TOTAL"
echo "   Converted: $CONVERTED"
echo "   Skipped: $SKIPPED"
echo ""

if [ $CONVERTED -gt 0 ]; then
    echo "✅ Image optimization complete!"
    echo ""
    echo "💡 Next steps:"
    echo "   1. The original files are kept as fallbacks"
    echo "   2. The performance-optimizer.js will auto-detect WebP support"
    echo "   3. Browsers will load WebP when supported, fallback otherwise"
else
    echo "✅ All images already optimized!"
fi

echo ""
