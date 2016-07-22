var
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  speechSchema = new Schema({
    speech: String,
    results: Schema.Types.Mixed,
    posted_by: {type: Schema.Types.ObjectId, ref: 'User'}
  },
  {
    timestamps: true
  });


var Speech = mongoose.model('speech', speechSchema)

module.exports = Speech
