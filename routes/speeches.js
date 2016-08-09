var
  express = require('express'),
  passport = require('passport'),
  Speech = require('../models/Speech.js'),
  speechRouter = express.Router()

speechRouter.route('/speeches')
  .get(function(req, res){
    Speech.find({}, function(err, speeches){
      if (err) throw err;
      res.json(speeches)
    })
  })
  .post(function(req, res){
    console.log(req.body);
    var newSpeech = new Speech(req.body)
    newSpeech.posted_by = req.user
    newSpeech.save(function(err, speech){
      if (err) return console.log(err);
      Speech.populate(speech, {path:"posted_by"}, function(err, speech){
        if (err) return console.log(err);
      })
      console.log("hello");
      console.log(speech);
      console.log("hello");
      res.json({serverSays: "Speech successfully created", speech: speech})
    })
  })

speechRouter.route('/speeches/:id')
  .delete(function(req, res){
    Speech.findByIdAndRemove(req.params.id, function(err, speech){
      if (err) throw err;
      res.json({message: "Successfully deleted item", speech: speech})
    })
  })

module.exports = speechRouter
