const fs = require('fs');

let content = fs.readFileSync('d:/Code_Here/shivkarupa/shivkrupa-frontend/components/customer/ProductDetailModal.tsx', 'utf8');

// Find the end of the file
const parts = content.split('        </div >');
if (parts.length > 1) {
    const fixed = parts[0] + parts[1];
    fs.writeFileSync('d:/Code_Here/shivkarupa/shivkrupa-frontend/components/customer/ProductDetailModal.tsx', fixed);
    console.log('Fixed div');
} else {
    console.log('Not found');
}
