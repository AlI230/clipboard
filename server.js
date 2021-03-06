const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const db = require('./db');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const Note = require('./models/notes');
const passport = require('passport');
const morgan = require('morgan');
const { forwardAuthenticated, ensureAuthenticated } = require('./middleware/auth');

const app = express();

// Ejs middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', 'views');

// BodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Server logs
app.use(morgan('short'));

// ExpressSession middleware
app.use(session({
    secret: '1503',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// MongoDB connection
db.once('open', ()=> {
    console.log('Connected to MongoDB')
});

// Router paths
const user = require('./router/user');
const notes = require('./router/notes');

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});

app.get('/', (req, res)=> {
    Note.find({}, (err, notes)=>{
        if(err) return req.flash('error_msg', 'Something went wrong');
        if(!notes || notes.length === 0) {
            res.render('index', {notes: false});
        }
        else {
            res.render('index', {notes: notes});
        }
    });
});

app.use('/user', user);

app.use('/notes', ensureAuthenticated, notes);

const port = 3000;

app.listen(port, ()=> {
    console.log(`Server up and running on port ${port}`)
});