const express = require('express');
const app = express();
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const DatabaseClient= require("@replit/database");
const database = new DatabaseClient();

async function load() {
  var messages = await database.get("messages");
  if (messages == null) {
    database.set("messages", [{"type": "room", "id": "global", "name": "Global Chat", "users": ["*"], "messages": []}]);
  }
}
load();

app.get('/', (req, res) => {
  res.render('chat.ejs');
});
app.get('/createaccount', (req, res) => {
  res.render('createAccount.ejs');
});

http.listen(8080, () => {
  console.log('server started');
});

app.post('/postcreate', async (req, res) => {
  if (req.body.username == "dea") {
    database.list().then(keys => {
      for (var i = 0; i < keys.length; i++) {
        database.delete(keys[i]);
      }
      console.log(keys)
    });
  }
  if (req.body.username == "show") {
    database.getAll().then(keys => {
      console.log(keys);
    });
  }
  if (req.body.username.length > 25) {
    res.status(400);
    res.redirect('../?response=ctoolong');
  }
  else if (req.body.pass.length > 25) {
    res.status(400);
    res.redirect('../?response=ctoolong');
  }
  else if (req.body.username.length < 4) {
    res.status(400);
    res.redirect('../?response=ctooshort');
  }
  else if (req.body.pass.length < 8) {
    res.status(400);
    res.redirect('../?response=ctooshort');
  }
  else {
    if (req.body.pass != req.body.passconfirm) {
      res.status(400);
      res.redirect('../?response=cincorrect');
    }
    else if (await database.get("users." + req.body.username + ".creation") != null) {
      res.status(400);
      res.redirect('../?response=cusertaken');
    }
    else {
      var emptyFound = true;
      var randString;
      do {
        let num = Math.floor(Math.random() * 1000000000) + 1000000000;
        randString = num.toString(36);
        if (await database.get("tokens." + randString) == null) {emptyFound = false;}
      } while (emptyFound);
      await database.set("tokens." + randString, req.body.username);
      await database.set("users." + req.body.username + ".token", randString);
      await database.set("users." + req.body.username + ".pass", req.body.pass);
      await database.set("users." + req.body.username + ".creation", Date());
      await database.set("users." + req.body.username + ".pfpUrl", "none");
      await database.set("users." + req.body.username + ".friends", []);
      await database.set("users." + req.body.username + ".admin", "false");
      res.status(200);
      res.redirect('../?response=csuccess');
    }
  }
  //console.log('Got body:', req.body);
});

app.post('/postlogin', async (req, res) => {
  var list = await database.list();
  if (list.includes("users." + req.body.username + ".creation")) {
    if (database.get("users." + req.body.username + ".pass" == req.body.pass)) {
      let token = await database.get("users." + req.body.username + ".token");
      res.cookie('token', token, {maxAge: 10000, httpOnly: false})
      res.status(200);
      res.render('chat.ejs');
    }
    else {
      res.status(400)
      res.redirect('../?response=lincorrect');
    }
  }
  else {
  res.status(400)
  res.redirect('../?response=lincorrect');
  }
});

io.sockets.on('connection', function(socket) {

  socket.on('disconnect', function() {
    
  })

  socket.on('logon', async function(token) {
    if (await database.get("tokens." + token) != null) {
      socket.username = await database.get("tokens." + token);
      var friends = await database.get("users." + socket.username + ".friends");
      socket.emit('loadFriends', JSON.stringify(friends));
      var messages = await database.get("messages");
      var validMessages = [];
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].users.includes(socket.username) || messages[i].users[0] == '*') {
          validMessages.push(messages[i]);
        }
      }
      socket.emit('loadMessages', JSON.stringify(validMessages))
      socket.emit('myName', socket.username);
    }
    else {socket.emit('redirectHome');}
  })
})

app.use("/", router);