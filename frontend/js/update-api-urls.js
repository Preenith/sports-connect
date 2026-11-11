// This script helps update all fetch calls in HTML files to use API_BASE_URL
// Run this in Node.js: node frontend/js/update-api-urls.js

const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'login.html',
    'signup.html',
    'facilities.html',
    'facility-details.html',
    'booking.html',
    'my-bookings.html',
    'profile.html',
    'admin.html'
];

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, '../', file);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add config.js script if not present
        if (!content.includes('js/config.js')) {
            content = content.replace(
                '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>',
                '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n    <script src="js/config.js"></script>'
            );
        }
        
        // Replace fetch('/api/ with fetch(`${API_BASE_URL}/
        content = content.replace(/fetch\(`\/api\//g, 'fetch(`${API_BASE_URL}/');
        content = content.replace(/fetch\('\/api\//g, "fetch(`${API_BASE_URL}/");
        content = content.replace(/fetch\("\/api\//g, 'fetch(`${API_BASE_URL}/');
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${file}`);
    } else {
        console.log(`Not found: ${file}`);
    }
});

console.log('Done!');
