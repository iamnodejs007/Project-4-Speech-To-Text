var
express = require('express'),
passport = require('passport'),
User = require('../models/User.js'),
userRouter = express.Router()

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
