var
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('../models/user.js')

passport.serializeUser(function(user, done){
  //create cookie
  done(null, user.id)
  //similar to next in middle ware, but it also handles error.  Kinda like
  //go on to the next thing but don't use cookie
})

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user)
  })
})

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  //what are we logging in with? email!
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){
  //function for checking if email is used, password
  User.findOne({'local.email': email}, function(err, user){
    //looking for user's email within the local email
    if(err) return done(err)
    if(user) return done(null, false, req.flash('signupmessage', 'That email is taken.'))
    var newUser = new User()
    newUser.local.name = req.body.name
    newUser.local.email = email
    newUser.local.password = newUser.generateHash(password)
    newUser.save(function(err){
      if(err) return console.log(err)
      return done(null, newUser, null)
    })
  })
}))

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){
  User.findOne({'local.email': email}, function(err, user){
    if(err) return done(err)
    if(!user) return done(null, false, req.flash('loginMessage', 'No user found...'))
    if(!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Wrong password...'))
    return done(null, user)
  })
}))

module.exports = passport
