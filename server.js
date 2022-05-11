const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var cloudinary = require('cloudinary').v2;
require("dotenv").config();
cloudinary.config({
    cloud_name: `${process.env.cloudinary_cloud_name}`,
    api_key: `${process.env.cloudinary_api_key}`,
    api_secret: `${process.env.cloudinary_api_secret}`,
    secure: true,
});
require('./config/mongoose');
const multer = require("multer");
const fileUpload = multer();
const uploadImage = require("./config/cloudinary");
const mongoose = require('mongoose');
// socket.io
const { Server } = require("socket.io");
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});



const postSchema = new mongoose.Schema({
    image: { type: String, required: true, unique: true },
    caption: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
}, { timestamps: true });

const post = mongoose.model("post", postSchema);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/homepage/index.html');
})

app.get('/upload', function (req, res) {
    res.sendFile(__dirname + '/public/upload/index.html');
});

app.get('/upvote/:id', function (req, res) {
    post.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true }, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc);
            res.json(doc);
        }
    });
});

app.get('/downvote/:id', function (req, res) {
    post.findByIdAndUpdate(req.params.id, { $inc: { downvotes: 1 } }, { new: true }, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

app.post('/upload', fileUpload.single("imageupload"), function (req, res) {
    console.log(req.file);
    let caption = req.body.caption;
    let imageurl;
    uploadImage(req).then(async (result) => {
        console.log(result);
        imageurl = result.secure_url;
        post.create({ image: imageurl, caption: caption }, (err, post) => {
            if (err) {
                console.log(err);
            } else {
                console.log(post);
            }
        });
    }).catch((error) => {
        console.log(error);
        return res.json({
            error: 'not published',
        });
    });
    res.redirect('/');
});

app.get('/posts', function (req, res) {
    post.find({}, (err, posts) => {
        if (err) {
            console.log(err);
        } else {
            res.json(posts);
        }
    });
});


server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});