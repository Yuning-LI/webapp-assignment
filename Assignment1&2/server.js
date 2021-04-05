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


const mongodb = require('mongodb')
const MONGO_URL = process.env.MONGO_DB_CONNECTION_STRING

let client = new mongodb.MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

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

    });
  });
});





http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


