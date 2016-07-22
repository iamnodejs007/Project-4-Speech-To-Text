var
  mongoose = require('mongoose'),
  findOrCreate = require('mongoose-findorcreate'),
  bcrypt = require('bcrypt-nodejs'),
  Schema = mongoose.Schema,
  User = new Schema({
    local: {
      name: String,
      email: String,
      password: String
    }},
    {
      timestamps: true
  })

  User.plugin(findOrCreate)

  User.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
    //hashSync prevent other shits running before this happens
  }

  User.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password)
    //compareSync
  }

var User = mongoose.model('User', User)

module.exports = User
