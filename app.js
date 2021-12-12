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
const Doctor = require('./models/doctor.js');


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
    // name: 'session',
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
// app.use(flash());

// Passport Usage
app.use(passport.initialize());
app.use(passport.session()); // REMEMBER app.use(session) must come before passport.session.
// this below line tells that we will be using a local strategy
passport.use('user-local',new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // serializing the user in session
passport.deserializeUser(User.deserializeUser()); // deserializing the user out of the session.

passport.use(new LocalStrategy(Doctor.authenticate()));
passport.serializeUser(Doctor.serializeUser()); // serializing the user in session
passport.deserializeUser(Doctor.deserializeUser()); // deserializing the user out of the session.

// set admin context and others things like admin templates
app.use('/homepage/doc/*', function adminContext(req, res, next) {
    // set admin context
    req.isAdmin = true;
    next();
  });
  
  
  // then get roles for authenticated user in your passport stategy:
  app.use(function getUserRoles(req, res, next) {
    req.userRoleNames = [];
  
    if (req.isAuthenticated()) {
      req.userRoleNames.push('authenticated');
    } else {
      req.userRoleNames.push('unAuthenticated');
      return next(); // skip role load if dont are authenticated
    }
  
    // get user roles, you may get roles from DB ...
    // and if are admin add its role
    req.userRoleNames.push('administrator');
  
    next();
  
  });

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.currentDoctor = req.isAdmin;
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

app.post('/login', passport.authenticate('user-local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    const { email } = req.body;
    // req.flash('success', 'Welcome Back');

    const user = await User.findOne({ email: email });
    const redirectUrl = req.session.returnTo || `/homepage/${user._id}`;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

app.get('/logout', async (req, res) => {
    req.logout();
    // req.flash('success', "Logged Out Successfully");
    res.redirect('/login');
})

app.post('/register', async (req, res) => {
    try {
        const { email, password, Cpassword, username, gender, age, weight, height, pastcomp, bloodgroup, pincode} = req.body;
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
                bloodgroup: bloodgroup,
                weight: weight,
                height: height,
                pastComp: pastcomp,
                pincode: pincode,
            });

            // await user.save();
            console.log(user);
            const registeredUser = await User.register(user, password);
            // console.log(registeredUser);
            req.logIn(registeredUser, (err) => {
               console.log("HEHE");
                if (err) {
                    console.log(err);
                }
                else {
                    res.redirect(`/homepage/${user._id}`);
                }
            });
        }


    } catch (err) {
        // req.flash('error', err.message);
        res.redirect('/register');
    }
})
app.get("/homepage/:id", async(req,res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    res.render('homepage/homePatient.ejs', {user});
})


// doctor side
app.post('/docregister', async(req,res) => {
    try {
        const { email, password, Cpassword, username, gender, dpost, experience, contact, pincode, hospitalAdd} = req.body;
        if (Cpassword !== password) {
            // req.flash('error', "Both passwords must match");
            console.log("PASSWORD NOT MATCH");
            res.redirect('/register');
        } else {
            // Now we will add entry of user in our database
            const doctor = new Doctor({
                email: email,
                gender: gender,
                username: username,
                post: dpost,
                experience: experience,
                contact: contact,
                hospitalADD: hospitalAdd,
                pincode: pincode,
            });
            // await user.save();

            // console.log(user);
            // console.log(user, password);
            const registeredUser = await Doctor.register(doctor, password);
            // console.log(registeredUser);
            req.logIn(registeredUser, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.redirect(`/homepage/doc/${doctor._id}`);
                }
            });
        }


    } catch (err) {
        // req.flash('error', err.message);
        console.log(err.message)
        res.redirect('/register');
    }
})



app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    const { email } = req.body;
    // req.flash('success', 'Welcome Back');

    const user = await Doctor.findOne({ email: email });
    const redirectUrl = req.session.returnTo || `/homepage/doc/${user._id}`;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

app.get('/homepage/doc/:id', async(req,res) => {
    const {id} = req.params;
    const doc = await Doctor.findById(id);

    res.render('homepage/doc.ejs', {doc});
})

app.listen(8080, (req, res) => {
    console.log(`LISTENING TO PORT 8080!!`);
})