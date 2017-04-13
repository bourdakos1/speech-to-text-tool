var path = require('path');
var express = require('express');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var AuthorizationV1 = require('watson-developer-cloud/authorization/v1');
var fileUpload = require('express-fileupload');
var request = require('superagent');
var multer = require('multer');
var fs = require('fs');
var crypto = require('crypto');
var mime = require('mime-types')
var app = express();

var PORT = process.env.VCAP_APP_PORT || 8080; //bluemix

// using webpack-dev-server and middleware in development environment
if(process.env.NODE_ENV !== 'production') {
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var webpack = require('webpack');
  var config = require('./webpack.config');
  var compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/dist/index.html')
});

app.get('*', function(req, response) {
    response.sendFile(__dirname + '/dist/index.html');
});

app.post('/api/token', function(req, res) {
    var stt = new SpeechToTextV1({
        username: req.query.username,
        password: req.query.password
    });

    var authService = new AuthorizationV1(stt.getCredentials());

    authService.getToken(function(err, token) {
        if (err) {
            res.send(err);
            return;
        } else {
            res.send({token: token});
        }
    });
});

app.post('/api/test_credentials', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;

    request.post('https://stream.watsonplatform.net/speech-to-text/api/v1/')
    .auth(username, password)
    .end(function(err, response) {
        res.send({valid: !(err.status == 401)});
    });
})

app.post('/api/list_classifiers', function(req, res) {
    var speech_to_text = new SpeechToTextV1 ({
        username: '5b4f8307-0a64-4114-93f4-4d28a30a2e82',
        password: 'Vuolrx2GcF7m'
    });

    speech_to_text.getCustomizations(null, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
	});
});

app.post('/api/delete_classifier', function(req, res) {
    var visual_recognition = new VisualRecognitionV3({
        api_key: req.query.api_key,
        version_date: req.query.version || '2016-05-19'
    });

    visual_recognition.deleteClassifier({classifier_id: req.query.classifier_id }, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
    });
});

app.post('/api/classifier_details', function(req, res) {
    var visual_recognition = new VisualRecognitionV3({
        api_key: req.query.api_key,
        version_date: req.query.version || '2016-05-19'
    });

    visual_recognition.getClassifier({classifier_id: req.query.classifier_id }, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
	});
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '.tmp/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
        var type = file.mimetype;
        if (type !== 'application/zip' && type !== 'application/x-zip-compressed' && type !== 'multipart/x-zip' && type !== 'application/x-compressed') {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
        } else {
            cb(null, raw.toString('hex') + Date.now() + '.zip');
        }
    });
  }
});

// Multer config
const upload = multer({
    limits: {
        files: 1,
        fileSize: 200 * 1024 * 1024 // 2mb
    },
    fileFilter: function(req, file, cb) {
        // var type = file.mimetype;
        // if (type !== 'image/png' && type !== 'image/jpg' && type !== 'image/jpeg') {
        //     cb(new Error('Invalid image type'));
        // } else {
            cb(null, true);
        // }
    },
    storage: storage
});

var fileUpload = upload.single('file')
app.post('/api/classify', function(req, res) {
    fileUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            return;
        }

        var speech_to_text = new SpeechToTextV1 ({
          username: req.query.username,
          password: req.query.password
        });

        var params = req.query

        params.content_type = 'audio/wav';
        params.continuous = true;

        // var params = req.query;
        params.audio = fs.createReadStream(req.file.path);

        console.log(mime.lookup(req.file.path));

        speech_to_text.recognize(params, function(err, data) {
            fs.unlinkSync(req.file.path);
            if (err) {
                res.send(err);
                return;
            }
            res.send(data);
        });

    });
});

app.post('/api/detect_faces', function(req, res) {
    fileUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            return;
        }

        var visual_recognition = new VisualRecognitionV3({
            api_key: req.query.api_key,
            version_date: req.query.version || '2016-05-19'
        });

        var params = req.query;

        params.images_file = fs.createReadStream(req.file.path);

        visual_recognition.detectFaces(params, function(err, data) {
            fs.unlinkSync(req.file.path);
            if (err) {
                res.send(err);
                return;
            }
            res.send(data);
        });
    });
});

const zipUpload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024 // 100mb
    },
    fileFilter: function(req, file, cb) {
        var type = file.mimetype;
        if (type !== 'application/zip' && type !== 'application/x-zip-compressed' && type !== 'multipart/x-zip' && type !== 'application/x-compressed') {
            cb(new Error('Invalid zip file'));
        } else {
            cb(null, true);
        }
    },
    storage: storage
});

var filesUpload = zipUpload.array('files')
app.post('/api/create_classifier', function(req, res) {
    filesUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            return;
        }

        var visual_recognition = new VisualRecognitionV3({
            api_key: req.query.api_key,
            version_date: req.query.version || '2016-05-19'
        });

        var params = {
            name: req.query.name
        }

        for (var file in req.files) {
            console.log(req.files[file])
            if (req.files[file].originalname == 'NEGATIVE_EXAMPLES') {
                params['negative_examples'] = fs.createReadStream(req.files[file].path);
            } else {
                params[req.files[file].originalname + '_positive_examples'] = fs.createReadStream(req.files[file].path);
            }
        }

        visual_recognition.createClassifier(params, function(err, data) {
            for (var file in req.files) {
                fs.unlinkSync(req.files[file].path);
            }
            if (err) {
                res.send(err);
                return;
            }
            res.send(data);
        });
    });
});

app.post('/api/update_classifier', function(req, res) {
    filesUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            return;
        }

        var visual_recognition = new VisualRecognitionV3({
            api_key: req.query.api_key,
            version_date: req.query.version || '2016-05-19'
        });

        var params = {
            classifier_id: req.query.classifier_id
        }

        for (var file in req.files) {
            console.log(req.files[file])
            if (req.files[file].originalname == 'NEGATIVE_EXAMPLES') {
                params['negative_examples'] = fs.createReadStream(req.files[file].path);
            } else {
                params[req.files[file].originalname + '_positive_examples'] = fs.createReadStream(req.files[file].path);
            }
        }

        visual_recognition.retrainClassifier(params, function(err, data) {
            for (var file in req.files) {
                fs.unlinkSync(req.files[file].path);
            }
            if (err) {
                res.send(err);
                return;
            }
            res.send(data);
        });
    });
});

app.listen(PORT, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  }
});
