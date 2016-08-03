var
  express = require('express'),
  passport = require('passport'),
  User = require('../models/User.js'),
  userRouter = express.Router(),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  dotenv = require('dotenv').load({silent: true}),
  aSync = require('async'),
  bcrypt = require('bcrypt-nodejs'),
  crypto = require('crypto');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    secure: true
})

userRouter.route('/login')
.get(function(req, res){
  res.render('login', {flash: req.flash('loginMessage')})
})
.post(passport.authenticate('local-login',{
  successRedirect: '/main',
  failureRedirect: '/login'
}))

userRouter.route('/signup')
.get(function(req, res){
  res.render('signup', {flash: req.flash('signupMessage')})
})
.post(passport.authenticate('local-signup',{
  successRedirect: '/main',
  failureRedirect: '/signup'
}))

userRouter.get('/profile', isLoggedIn, function(req, res){
  res.render('profile', {user: req.user, strategy: req.query.strategy})
})

// forgot password route that sends an email to the user with a link to reset their password
userRouter.route('/forgot')
  .get(function(req, res) {
    res.render('forgot', {user: req.user, flash: req.flash('hello')})
  })
  .post(function(req, res, next) {
  aSync.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({'local.email': req.body.email}, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }
        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        from: "Password Reset <" + process.env.EMAIL + ">",
        to: user.local.name + "<" + user.local.email + ">",
        subject: 'Speech-To-Text Password Reset',
        html: '<p>You are receiving this email because you (or someone else) has requested to reset your password for your account.</p><br>' +
        '<p>Please open the following link to reset your password</p><br>' + req.headers.host + '/reset/' + token + '<br><br>If you did not request this, disregard this email.',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      }
      transporter.sendMail(mailOptions, function(error, info) {
        req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
        done(error, 'done');
      });
    }
  ], function(error) {
    if (error) return next(error);
    console.log("made it to the end");
    res.redirect('/forgot');
  });
});

userRouter.route('/reset/:token')
  .get(function(req, res) {
    User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
     if (!user) {
       req.flash('error', 'Password reset token is invalid or has expired.');
       return res.redirect('/forgot');
     }
     res.render('reset', {user: req.user, flash: req.flash('hello')} );
   })
  })
  .post(function(req, res) {
    aSync.waterfall([
     function(done) {
       User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
         console.log(user);
         if (!user) {
           req.flash('error', 'Password reset token is invalid or has expired.');
           res.render('reset');
         }

         user.local.password = user.generateHash(req.body.password);
         user.local.resetPasswordToken = undefined;
         user.local.resetPasswordExpires = undefined;

         user.save(function(err) {
             done(err, user);
         });
       });
     },
   function(user, done) {
     var mailOptions = {
       from: "Password Reset <" + process.env.EMAIL + ">",
       to: user.local.name + "<" + user.local.email + ">",
       subject: 'Your password has been reset successfully',
       html: '<p>Your password has been reset for your Speech-To-Text account</p>',
       text: 'Hello,\n\n' +
         'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
     };
     transporter.sendMail(mailOptions, function(err, info) {
       req.flash('success', 'Success! Your password has been changed.');
       done(err);
     });
   }
   ], function(err) {
     res.redirect('/');
   });
  })

userRouter.get('/main', isLoggedIn, function(req, res){
  res.render('index.ejs', {user: req.user})
})

userRouter.get('/user/:id', function(req, res){
  User.findById(req.params.id, function(err, user){
    res.render('update', {user: user})
  })
})

userRouter.patch('/user/:id', function (req, res){
  User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, user){
    if(err) console.log(err)
    res.redirect('/profile')
  })
})

userRouter.get('/user/:id/delete', function(req, res){
  req.logout()
  User.findByIdAndRemove(req.params.id, function(err, item){
    if (err) throw err;
    res.redirect("/")
  })
})

userRouter.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

userRouter.route('/user/:id/speech')
.post(function(req, res){
  User.findById(req.params.id, function(err, user){
    if (err) { return console.log(err) }
    user.save(function(err){
      if (err) return console.log(err);
      res.json({sucess: true, user: user})
    })
  })
})
.get(function(req, res){
  User.findById(req.params.id, function(err, user) {
    if (err) return console.log(err);
    res.json(user)
  })
})

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next()
  res.redirect('/')
  return next()
}

module.exports = userRouter
