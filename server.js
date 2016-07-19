var
  express = require('express'),
  app = express(),
  dotenv = require('dotenv').load({silent: true}),
  AWS = require('aws-sdk'),
  multer  = require('multer'),
  upload = multer(),
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
  port = process.env.PORT || 3000

const S3_BUCKET = process.env.S3_BUCKET



// mongoose server
mongoose.connect('mongodb://localhost/project-4', function(err){
  if (err) return console.log(err);
  console.log("Connected to MongoDB (Project-4)");
})

// s3.getObject({Bucket: 'bucket', Key: 'key'}, function(err, data) {
//   // ...
// });

//
// var s3 = new AWS.S3();
// var params = {Bucket: S3_BUCKET, Key: fileName};
// s3.getObject(params, function(err, data) {
//   console.log(data);
// }
// var file = require('fs').createWriteStream('/path/to/file.jpg');
// s3.getObject(params).createReadStream().pipe(file);

// var files = ['sample.wav'];
// for (var file in files) {
//   var params = {
//     audio: fs.createReadStream(files[file]),
//     content_type: 'audio/wav',
//     timestamps: true,
//     word_alternatives_threshold: 0.9,
//     continuous: true
//   };
//
//   speech_to_text.recognize(params, function(error, transcript) {
//     if (error)
//       console.log('error:', error);
//     else
//       console.log(JSON.stringify(transcript, null, 2));
//   });
// }

// middleware
app.use(express.static('./public'))
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }));

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
      word_alternatives_threshold: 0.7,
      continuous: true,
      keywords: [req.query.keyword],
      keywords_threshold: 0.3
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

// // Handle the form POST containing an audio file and return transcript (from mobile)
// app.post('/transcribe', function(req, res){
//     console.log(req.files);
//     var file = req.files
//     var readStream = fs.createReadStream(file.path);
//     console.log("opened stream for " + file.path);
//
//     var params = {
//         audio:readStream,
//         content_type:'audio/l16; rate=16000; channels=1',
//         continuous:"true"
//     };
//
//     speechToText.recognize(params, function(err, response) {
//
//         readStream.close();
//
//         if (err) {
//             return res.status(err.code || 500).json(err);
//         } else {
//             var result = {};
//             if (response.results.length > 0) {
//                 var finalResults = response.results.filter( isFinalResult );
//
//                 if ( finalResults.length > 0 ) {
//                    result = finalResults[0].alternatives[0];
//                 }
//             }
//             return res.send( result );
//         }
//     });
// });
//
// function isFinalResult(value) {
//     return value.final == true;
// }




// server
app.listen(port, function(){
  console.log("Server is running on port: ", port);
})
