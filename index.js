const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Database = require("@replit/database");
const users = new Client();
await users.set("key", "value");
console.log(key);

app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.listen(3000, () => {
  console.log('server started');
});

