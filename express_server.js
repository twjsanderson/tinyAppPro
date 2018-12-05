const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
var PORT = 8080;

// This declares EJS and tells Express to use EJS as its templating engine
app.set("view engine", "ejs");

// This keeps track of all url's and their shortened forms
var urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get(cookieParser('/', (req, res) => {
  res.cookie('name', 'Tom', { domain: 'google.com'});
});

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {                                     // This post method takes an input via req and sends a response via res.send
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
});

app.post("/urls/:id", (req, res)=> {
  const { id } = req.params
  const { longURL } = req.body;
  urlDatabase[id] = longURL
  res.redirect(303, "/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {urls: urlDatabase})       //"urls_index" refers to the the .ejs file (page) where this will render to the urlDatabase
});

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {shortURL: req.params.id, urls: urlDatabase})   // "urls_show" refers to the .ejs (page) file where these paths will render to
});                                                                       // req.param() takes an address bar input after /urls/<user input ":id"> and renders it
                                                                          // this line will also render the value from the urls urlDatabase when put into the .ejs file
app.post("/urls/:id/delete", (req, res) => {                                //This post will delete a URL resource
  delete urlDatabase[req.params.id]
  res.redirect(303, "/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.shortURL                                       //this line will take an address input and store the value in shortURL, that is attached to logURL variable
  res.redirect(urlDatabase[longURL]);                                     //once the above is done it will be redirected to the value at urlDatabse[longURl]
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let ranNum = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    ranNum += possible.charAt(Math.floor(Math.random() * possible.length));

  return ranNum;
};


