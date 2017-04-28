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
var mime = require('mime-types');
var bodyParser = require('body-parser');
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
app.use(bodyParser.json());

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
});

app.post('/api/add_word', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;

    request.put('https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + encodeURIComponent(req.query.customization_id) + '/words/' + encodeURIComponent(req.query.word))
    .auth(username, password)
    .send({sounds_like: req.body.sounds_like})
    .send({display_as: req.query.display_as})
    .end(function(err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response.body);
    });
});

// COPY THIS
app.post('/api/delete_word', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;

    request.del('https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + encodeURIComponent(req.query.customization_id) + '/words/' + encodeURIComponent(req.query.word))
    .auth(username, password)
    .end(function(err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response.body);
    });
});

app.post('/api/list_words', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;

    request.get('https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + encodeURIComponent(req.query.customization_id) + '/words')
    .auth(username, password)
    .query(req.query)
    .end(function(err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response.body);
    });
});

app.post('/api/list_corpora', function(req, res) {
    var speech_to_text = new SpeechToTextV1 ({
        username: req.query.username,
        password: req.query.password
    });

    var params = req.query;

    speech_to_text.getCorpora(params, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
    });
});

app.post('/api/get_model', function(req, res) {
    var speech_to_text = new SpeechToTextV1 ({
        username: req.query.username,
        password: req.query.password
    });

    var params = req.query;

    speech_to_text.getCustomization(params, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
    });
});

app.post('/api/train', function(req, res) {
    var speech_to_text = new SpeechToTextV1 ({
        username: req.query.username,
        password: req.query.password
    });

    var params = req.query;

    speech_to_text.trainCustomization(params, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
    });
});

app.post('/api/list_models', function(req, res) {
    var speech_to_text = new SpeechToTextV1 ({
        username: req.query.username,
        password: req.query.password
    });

    speech_to_text.getCustomizations(null, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
    });
});

app.post('/api/create_model', function(req, res) {
    var speech_to_text = new SpeechToTextV1 ({
        username: req.query.username,
        password: req.query.password
    });

    var params = req.query;

    params.base_model_name = 'en-US_BroadbandModel';

    speech_to_text.createCustomization(params, function(err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
    });
});

app.post('/api/delete_model', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;

    request.del('https://stream.watsonplatform.net/speech-to-text/api/v1/customizations/' + encodeURIComponent(req.query.customization_id))
    .auth(username, password)
    .end(function(err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response.body);
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
app.post('/api/transcribe', function(req, res) {
    fileUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            return;
        }

        var speech_to_text = new SpeechToTextV1 ({
            username: req.query.username,
            password: req.query.password
        });

        var params = req.query;

        params.content_type = 'audio/wav';
        params.continuous = true;
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

app.post('/api/add_corpus', function(req, res) {
    fileUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            return;
        }

        var speech_to_text = new SpeechToTextV1 ({
            username: req.query.username,
            password: req.query.password
        });

        var params = req.query;

        params.corpus = fs.createReadStream(req.file.path);

        speech_to_text.addCorpus(params, function(err, data) {
            fs.unlinkSync(req.file.path);
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
