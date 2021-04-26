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
  res.render('index.ejs')
});

app.listen(3000, () => {
  console.log('server started');
});

app.post('/login', (req, res) => {
    console.log('Got body:', req.body);
    res.sendStatus(200);
});

async function createAccount(username, name, pass) {
  let keyLocation = "users." + id + ".";
  await database.set(keyLocation + "username", username);
  await database.set(keyLocation + "name", name);
  await database.set(keyLocation + "pass", pass);
  await database.set(keyLocation + "creation", Date());
  await database.set(keyLocation + "pfpUrl", "");
  await database.set(keyLocation + "admin", "false");
}

app.use("/", router);