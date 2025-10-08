const express = require('express');
const router = express.Router();
const db = require('../db');

// Step 1 - Configuration
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Step 2 - Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive: true});
}

// Step 3 - Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

// Step 4 - File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept file      
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject file
    }  
};

// Step 5 - Initialize multer with storage and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1 * 1024 * 1024 } }); // Limit file size to 5MB

// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

router.get('/blog', isLoggedIn, (req, res) => {
    
    db.query('SELECT * FROM blog order by idblog desc', (err, results) => {
        if (err) {
            console.error('Error fetching blog:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log('Fetched blog:', results);
        res.render('index', { user: req.session.user, blogs: results });
    });
});

router.get('/post_blog', isLoggedIn, (req, res) => {
    res.render('post_blog', { user: req.session.user });
})

router.post('/post_blog', isLoggedIn, upload.single('imageInput'), (req, res) => {
    const { title, category, tags, hiddenContent} = req.body;
    // const {title, content} = req.body;
    const userId = req.session.userid;
    const userFullname = req.session.user.first_name + ' ' + req.session.user.last_name;

    console.log('Received blog post:', { title, category, tags, hiddenContent});

    res.send('Blog post received!');
})

module.exports = router;