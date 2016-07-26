var
  express = require('express'),
  app = express(),
  dotenv = require('dotenv').load({silent: true}),
  logger = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  ejs = require('ejs'),
  ejsLayouts = require('express-ejs-layouts'),
  flash = require('connect-flash'),
  session = require('express-session'), // used to create cookies
  cookieParser = require('cookie-parser'),
  methodOverride = require('method-override'),
  passport = require('passport'),
  port = process.env.PORT || 3000,
  passportConfig = require('./config/passport.js'),
  userRoutes = require('./routes/users.js'),
  speechRoutes = require('./routes/speeches.js')



// mongoose server
mongoose.connect(process.env.DB_URL, function(err){
  if (err) return console.log(err);
  console.log("Connected to mLabs (text-to-speech)");
})

// middleware
app.use(express.static('./public'))
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

// ejs configuration
app.set('view engine', 'ejs')
app.use(ejsLayouts)
app.use(flash())

// this is the session and passport middleware
app.use(session({
  cookie: {maxTime: 60000000}, // 16.6 hours in milliseconds
  secret: "Waz", // this adds an encrypter version of this secret so that a user cant just add a cookie in the browser and be logged in...very cruial
  resave: true, // if you are continually using the site, you will stay logged in as long as you want
  saveUninitialized: false // means, "do you want to create a cookie even if the login fails?".. answer is NO
}))
app.use(passport.initialize())
app.use(passport.session()) // this is what allows the cookie to get created, when necessary

app.use(function(req, res, next) {
  res.locals.user = req.user
  next()
})

app.get('/', function(req, res){
  res.render('landing.ejs', {flash: req.flash('loginMessage')})
})


app.use('/', speechRoutes)

app.use('/', userRoutes)

// server
app.listen(port, function(){
  console.log("Server is running on port: ", port);
})
