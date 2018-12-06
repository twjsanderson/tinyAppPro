const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
var PORT = 8080;

// This declares EJS and tells Express to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(cookieParser());

// This keeps track of all url's and their shortened forms
var urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "tom@example.com",
    password: "k-pop-rules"
  }
}

app.use(bodyParser.urlencoded({extended: true}));

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect(303, "/urls")
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username : req.cookies.username});
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {urls: urlDatabase, username : req.cookies.username});
});

app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
});

app.post("/urls/:id", (req, res)=> {
  const { id } = req.params
  const { longURL } = req.body;
  urlDatabase[id] = longURL
  res.redirect(303, "/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const { id } = generateRandomString();
  const { email } = req.body.email;
  const { password } = req.body.password;
  user[id] = id
  user.id.email = email
  user.id.password = password
  res.cookie("user_id", req.body.id)
  res.redirect(303, "/urls")

});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {shortURL: req.params.id, urls: urlDatabase, username : req.cookies.username})
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect(303, "/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.shortURL
  res.redirect(urlDatabase[longURL]);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let ranNum = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 7; i++)
    ranNum += possible.charAt(Math.floor(Math.random() * possible.length));

  return ranNum;
};


