const express = require('express')
const app = express()
const formidable = require('formidable')

const port = process.env.PORT || 8080
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const fs = require('fs')
const fetch = require('node-fetch')
var bodyParser = require('body-parser'); 
var path = require('path');
var alert = require('alert');
var db;

// Atlas-mongodb
const mongoose = require('mongoose')
const connection = 'mongodb+srv://yuning:529566@cluster0.ynsfl.mongodb.net/imgDB?retryWrites=true&w=majority'
mongoose.connect(connection, { 
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true 
}, () => console.log('mongoose connected!'))
mongoose.connection.on('error', console.error)


const mongodb = require('mongodb')

let client = new mongodb.MongoClient(connection, { useNewUrlParser: true, useUnifiedTopology: true })

client.connect().then(client => {
  db = client.db()
}).catch(err => {
  console.log(err)
})


app.use('/', express.static('public'))

//I listen for socket connection
io.on('connect', (socket) => {
  //Once a user is connected I wait for him to send me figure on the event 'send_figure' or line with the event 'send_line'
  console.log('New connection')
  socket.on('send_figure', (figure_specs) => {
    //Here I received the figure specs, all I do is send back the specs to all other client with the event share figure
    socket.broadcast.emit('share_figure', figure_specs)
  })

  socket.on('send_line', (line_specs) => {
    //Here I received the line specs, all I do is send back the specs to all other client with the event share line
    socket.broadcast.emit('share_line', line_specs)
  })
})

//store images
app.post('/upload', (req, res, next) => {
  const form = formidable({ multiples: true });
  form.parse(req, function (err, fields, files) {
    //console.log('fields: ',fields);
    var data = fields.image.replace(/^data:image\/png;base64,/, "");
    var newpath = path.join(__dirname, 'public');
    var directory = path.join(newpath, 'images');

    imageUrl = path.join(directory, fields.username + "_" + fields.timestamp + ".png");
    fs.writeFile(imageUrl, data, 'base64', function (err) {
      if (err) throw err;
      //console.log('save image success');
      alert('successfully saved as'+imageUrl);
      var doc = {
        username: fields.username,
        datetime: fields.timestamp,
        imgPath: imageUrl
      };
      //insert
      db.collection('images').insertOne(doc, function (err, res) {
        if (err) throw err
        console.log('successfully saved into mongodb');
      });
      res.status(200).json({
        message: 'OK'
      });
    });
  });
});

//fetch images
app.get("/show", (req, res) => {
  db.collection('images').find({}).toArray(function (err, docs) {
    if (err) return res.status(500).send({ error: err });
    
    res.send(docs.length > 0 ? docs : 'No Data');
  });
});


http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


