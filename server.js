var
  express = require('express'),
  app = express(),
  dotenv = require('dotenv').load({silent: true}),
  AWS = require('aws-sdk'),
  watson = require('watson-developer-cloud'),
  speech_to_text = watson.speech_to_text({
    username: process.env.STT_USERNAME,
    password: process.env.STT_PASSWORD,
    version: 'v1'
  }),
  logger = require('morgan'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  ejs = require('ejs'),
  ejsLayouts = require('express-ejs-layouts'),
  flash = require('connect-flash'),
  session = require('express-session'), // used to create cookies
  cookieParser = require('cookie-parser'),
  expressSession = require('express-session'),
  methodOverride = require('method-override'),
  hash = require('bcrypt-nodejs'),
  path = require('path'),
  passport = require('passport'),
  port = process.env.PORT || 3000,
  passportConfig = require('./config/passport.js'),
  userRoutes = require('./routes/users.js')

const S3_BUCKET = process.env.S3_BUCKET



// mongoose server
mongoose.connect('mongodb://localhost/project-4', function(err){
  if (err) return console.log(err);
  console.log("Connected to MongoDB (Project-4)");
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
  cookie: {_expires: 60000000}, // 16.6 hours in milliseconds
  secret: "yeayeayea", // this adds an encrypter version of this secret so that a user cant just add a cookie in the browser and be logged in...very cruial
  resave: true, // if you are continually using the site, you will stay logged in as long as you want
  saveUninitialized: false // means, "do you want to create a cookie even if the login fails?".. answer is NO
}))
app.use(passport.initialize())
app.use(passport.session()) // this is what allows the cookie to get created, when necessary

app.use(function(req, res, next) {
  res.locals.user = req.user
  next()
})


var params;
app.get('/sign-s3', function(req, res) {
  var
    s3 = new AWS.S3(),
    fileName = req.query['file-name'],
    fileType = req.query['file-type'],
    s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    }
  params = {
      Bucket: S3_BUCKET,
      Key: fileName
    }

  s3.getSignedUrl('putObject', s3Params, function(err, data) {
    if(err){
      console.log(err)
      return res.end()
    }
    var returnData = {
      signedRequest: data,
      url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + fileName
    }
    res.write(JSON.stringify(returnData));
    res.end();
  })
})

app.get('/transcribe', function(req, res) {
  console.log(req.query.keyword);
  var transcript;
  var s3 = new AWS.S3();
  var stream = s3.getObject(params).createReadStream()
  var params2 = {
      audio: stream,
      content_type: 'audio/wav',
      timestamps: true,
      word_confidence: true,
      word_alternatives_threshold: 0.01,
      continuous: true,
      keywords: [req.query.keyword],
      keywords_threshold: 0.001
    };

  speech_to_text.recognize(params2, function(error, transcript) {
    if (error)
     console.log('error:', error);
    else
    //  console.log(JSON.stringify(transcript, null, 2));
     res.json(JSON.stringify(transcript, null, 2))
  });
})

app.post('/upload', function(req, res) {
  res.json({message: "POSTED", body: req.body})
})

app.get('/', function(req, res){
  res.render('landing.ejs', {flash: req.flash('loginMessage')})
})

app.get('/index', function(req, res){
  res.render('index.ejs')
})

app.use('/', userRoutes)

// server
app.listen(port, function(){
  console.log("Server is running on port: ", port);
})
