const express = require('express');
const app = express();
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    db.query('SELECT * FROM blog ORDER BY idblog DESC', (err, results) => {
        if (err) {
            console.error('Error fetching blogs:', err);
            return res.status(500).send('Internal server error');
        }
        res.render('index', { user: req.session.user, blogs: results });
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { fullName, email, password, confirmpassword } = req.body;
    console.log(`Registering user:`, fullName, email);

    try {
        // Hash the password
        const hash = await bcrypt.hash(password, 10);

        // Optionally split fullName into first and last name
        const [first_name, ...rest] = fullName.trim().split(' ');
        const last_name = rest.join(' ');

        // Insert user into database
        db.query(
            'INSERT INTO username (first_name, last_name, email, password, authen) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, hash, 1],
            (err, results) => {
                if (err) {
                    console.error('Error saving user to database:', err);
                    return res.status(500).send('Internal server error');
                }
                console.log('User registered successfully:', results.insertId);
                res.redirect('/login');
            }
        );
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Internal server error');
    }
});

router.post('/login', (req, res) => {
    const {email, password } = req.body;

    db.query('SELECT * FROM username WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        // const user = results[0];

        // Compare the hashed password
        const match = await bcrypt.compare(password, results[0].password);
        if (!match) {
            return res.status(401).send('Invalid email or password');
        } else {

            req.session.user = results[0].email; // Store user info in session

            // Authentication successful
            console.log('Session user:', req.session.user);
            console.log('Session ID:', req.sessionID);
            console.log('User logged in successfully:', results[0]);
            res.redirect('/blogs'); // Redirect to a protected route after login
        }
    });
})

router.get('/logout', (req, res) => {
    req.session.destroy( () => {
        res.redirect('/login');
    });
});

module.exports = router;
