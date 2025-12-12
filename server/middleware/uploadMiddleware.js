const multer = require('multer');
const path = require('path');

// --- 1. Define Storage Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Log the field name to confirm what Multer is seeing
        console.log('Multer processing field:', file.fieldname); 
        // Define separate folders for different file types
        let destDir;
        if (file.fieldname === 'logo_image') {
            destDir = path.join(__dirname, '../uploads/logos');
        } else if (file.fieldname === 'gallery_images') {
            destDir = path.join(__dirname, '../uploads/gallery');
        } else {
            // This case handles any unexpected field names
            destDir = path.join(__dirname, '../uploads/other');
        }

        // Ensure destination directory exists (avoid Multer ENOENT)
        const fs = require('fs');
        try {
            fs.mkdirSync(destDir, { recursive: true });
        } catch (err) {
            // If directory creation fails, pass the error to Multer
            return cb(err);
        }
        cb(null, destDir);
    },
    filename: (req, file, cb) => {
        // Create a unique file name: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// --- 2. Configure Multer Middleware ---
const upload = multer({
    storage: storage,
    limits: { 
        // Set maximum file size (e.g., 5MB per file)
        fileSize: 5 * 1024 * 1024 
    }
}).fields([
    // This MUST EXACTLY MATCH the 'name' attribute in your HTML/JSX file inputs
    { name: 'logo_image', maxCount: 1 },         // Single file upload
    { name: 'gallery_images', maxCount: 10 }     // Multiple files upload (up to 10)
]);

// --- 3. Export the Middleware ---
module.exports = upload;