var
  mongoose = require('mongoose'),
  findOrCreate = require('mongoose-findorcreate'),
  bcrypt = require('bcrypt-nodejs'),
  Schema = mongoose.Schema,
  userSchema = new Schema({
    local: {
      name: String,
      email: String,
      password: String,
      resetPasswordToken: String,
      resetPasswordExpires: Date
    }},
    {
      timestamps: true
  })

  userSchema.plugin(findOrCreate)

  userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
    //hashSync prevent other shits running before this happens
  }

  userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password)
    //compareSync
  }

var User = mongoose.model('User', userSchema)

module.exports = User
