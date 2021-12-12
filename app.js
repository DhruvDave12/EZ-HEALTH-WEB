if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

// Establishing MongoConnection
mongoose.connect('mongodb://localhost:27017/ezhealthData');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
});

const app = express();
app.engine('ejs', ejsMate);
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))


const sessionConfig = {
    name: 'session',
    secret: 'thisisatempsecret',
    resave: false,
    saveUninitialized: true,

    // Fancier Options for cookies like setting an expiration date.
    cookie: {
        httpOnly: true, // makes it not accessible on other client js
        // secure: true, // cookies can be secured only with https.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());
// Passport
// Passport Usage


app.use(passport.initialize());
app.use(passport.session()); // REMEMBER app.use(session) must come before passport.session.
// this below line tells that we will be using a local strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // serializing the user in session
passport.deserializeUser(User.deserializeUser()); // deserializing the user out of the session.

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req,res) => {
    res.render('auth/main.ejs');
})

app.get('/login', (req,res) => {
    res.render('auth/login.ejs');
})

app.get('/register', (req,res) => {
    res.render('auth/reg.ejs');
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    const { email } = req.body;
    req.flash('success', 'Welcome Back');

    const user = await User.findOne({ email: email });
    const redirectUrl = req.session.returnTo || `/homepage/${user._id}`;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

app.get('/logout', async (req, res) => {
    req.logout();
    req.flash('success', "Logged Out Successfully");
    res.redirect('/login');
})

app.post('/register', async (req, res) => {
    try {
        const { email, password, Cpassword, username, gender, age} = req.body;
        if (Cpassword !== password) {
            // req.flash('error', "Both passwords must match");
            console.log("PASSWORD NOT MATCH");
            res.redirect('/register');
        } else {
            // Now we will add entry of user in our database
            const user = new User({
                email: email,
                age: age,
                gender: gender,
                username: username,
            });
            // console.log(user, password);
            const registeredUser = await User.register(user, password);
            // console.log(registeredUser);
            req.login(registeredUser, () => {
                // Add error feature here.
                console.log("I AM HERE");
                // req.flash('success', 'Welcome back');
                res.redirect(`homepage/${user._id}`);
            });
        }


    } catch (err) {
        
        req.flash('error', err.message);
        res.redirect('/register');
    }
})

app.get("/homepage/:id", async(req,res) => {
    res.send("LOGGED IN TO HOMEPAGE CONGRATS");
})
app.listen(8080, (req, res) => {
    console.log(`LISTENING TO PORT 8080!!`);
})