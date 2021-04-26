const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const DatabaseClient= require("@replit/database");
const database = new DatabaseClient();

app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.listen(3000, () => {
  console.log('server started');
});