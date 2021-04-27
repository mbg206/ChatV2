const express = require('express');
const app = express();
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

const DatabaseClient= require("@replit/database");
const database = new DatabaseClient();

app.get('/', (req, res) => {
  res.render('index.ejs');
});
app.get('/createaccount', (req, res) => {
  res.render('createAccount.ejs');
});

app.listen(3000, () => {
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
      await database.set("users." + req.body.username + ".pass", req.body.pass);
      await database.set("users." + req.body.username + ".creation", Date());
      await database.set("users." + req.body.username + ".pfpUrl", "none");
      await database.set("users." + req.body.username + ".admin", "false");
      res.status(200);
      res.redirect('../?response=csuccess');
    }
  }
  console.log('Got body:', req.body);
});

app.post('/postlogin', async (req, res) => {
  var list = await database.list();
  if (list.includes("users." + req.body.username + ".creation")) {
    if (database.get("users." + req.body.username + ".creation" == req.body.pass)) {
      res.cookie('token', '1', {maxAge: 10000, httpOnly: true})
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

app.use("/", router);