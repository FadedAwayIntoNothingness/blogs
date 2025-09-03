const express = require('express');
const session = require('express-session');
const db = require('./db');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Middleware setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'TellMeYoursFirst',
    resave: false,
    saveUninitialized: true
}));

// Routes
// app.get('/', (req, res) => {
//     res.render('index');
// });

// app.get('/login', (req, res) => {
//     res.render('login');
// });

// app.get('/register', (req, res) => {
//     res.render('register');
// });

// Route for authentication
app.use('/', require('./routes/auth')); // Use the auth routes.
app.use('/', require('./routes/blogs')); // Use the blogs routes.

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});