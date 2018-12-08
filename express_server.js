const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
var PORT = 8080;

// This declares EJS and tells Express to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['super secure'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


// The GET routes are telling express to listen for requests to a certain path and run code or get stuff when it sees one.
// The POST routes are meant to submit data to a specific resource


// This keeps track of all url's and their shortened forms
var urlDatabase = {

  "b2xVn2": {
    shorturl: "b2xVn2",
    userId: "userRandomID",
    longurl: "http://www.lighthouselabs.ca",
  },
  "9sm5xK": {
    shorturl: "9sm5xK",
    userId: "userRandomID",
    longurl: "http://www.google.com"
  },
  "8uwsno": {
    shorturl: "8uwsno",
    userId: "twjsanderson",
    longurl: "http://www.yahoo.ca"
  }
};

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('simple', 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('easy', 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "tom@example.com",
    password: bcrypt.hashSync('kpop', 10)
  },
  "twjsanderson": {
    id: "twjsanderson",
    email: "twjsanderson@yahoo.ca",
    password: bcrypt.hashSync('1234', 10)
  }
}

app.use(bodyParser.urlencoded({extended: true}));

// this get route listens for the user id info to put into cookies
// passes it user id and renders the login page
app.get("/login", (req, res) => {
  let user_id = req.session.user_id
  res.render("urls_login", {user : users[user_id]})
});

//requests email address and password from the user
// runs a loop  to confirm that given email and pass are in the users DB
// if email and pass are found redirect to urls else send error messages
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  for (let Id in users) {
    if (users[Id].email === email) {
      if (bcrypt.compareSync(password, users[Id].password)) {
          req.session.user_id = Id;
          res.redirect("/urls")
        } else {
          res.statuScode = 403;
          return res.send("That password is wrong!")
        }
      }
    }
    res.statuScode = 403;
    return res.send("That email doesn't exist!")
  });

// if user logged in redirect to /urls if not redirect to /login
app.get("/", (req, res) => {
  let user_id = req.session.user_id
  if (user_id === userID(user_id)) {
    res.redirect("/urls")
  } else if (user_id === undefined || !user_id) {
    res.redirect("/login")
  }
});

//listening to get info from the urlDatabase in JSON form
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//if user is undefined or not present, redirect to login
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id
  if (user_id === undefined || !user_id) {
    res.redirect("urls_login");
  } else {
    res.render("urls_new",{user : users[user_id]});
  }
});

// take user id from cookies = userId, plug in userId to function userUrls = variable urlsForUser
// render urls_index with the newly created object
app.get("/urls", (req, res) => {
   let userId = req.session.user_id
   let urlsForUser = userUrls(userId)
   res.render("urls_index", {urlsForUser: urlsForUser, user : users[userId]});
});

// does the work to add newly created user to the users database and redirect to /urls
app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  let userId = req.session.user_id
  urlDatabase[newShort] = {};
  urlDatabase[newShort].shorturl = newShort;
  urlDatabase[newShort].userId = userId
  urlDatabase[newShort].longurl = req.body.longURL
  res.redirect("/urls");
});

// if user is logged in they will be able to edit a long url
// if they are not logged in it will redirect them to the login page
app.post("/urls/:id", (req, res)=> {
  let userId = req.session.user_id
  let short = req.params.id
  let longURL = req.body.longURL;
  if (urlDatabase[short].userId === userId) {
    urlDatabase[short].longurl = longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

//register button send you to register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

// register page will generate a random id, take a valid email & password
// it will updtae the users database by putting a new object into the db
// if no email or password error messages
app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    res.statusCode = 400;
    res.send("You did not enter an email or password!")
  }

  for (let userid in users) {
    if (users[userid].email === email) {
      res.statuScode = 400;
      return res.send("That email already exists!")
    }
  }

  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  res.redirect(303, "/urls")
});

//clears all cookies, redirects to /urls
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
});

//says hello world to the user
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// if user_id is undefined, no user_id or user_id is not in urlDatabase redirect to error messages
// if user_id is in urlDatabase redirect to urls_show
app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id === urlDatabase[req.params.id].userId) {
    res.render("urls_show", {shortURL: req.params.id, url: urlDatabase[req.params.id].longurl, user : users[user_id]})
  } else if (user_id === undefined || !user_id) {
    res.status(303).send("No user present!")
  } else {
    res.status(303).send("Not the right user account!")
  }
});

// working
// if user_id in urlDatabase delete entry else redirect to /urls
app.post("/urls/:id/delete", (req, res) => {
  let id = req.session.user_id
  if (id === urlDatabase[req.params.id].userId) {
    delete urlDatabase[req.params.id]
    res.redirect("/urls");
  } else {
    res.status(303).send("Not the right user account!")
  }
});

//working
//redirects to the webpage of short url, anyone can use this
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  console.log(urlDatabase[short].shorturl);
  if (short === urlDatabase[short].shorturl) {
    res.redirect(urlDatabase[short].longurl);
  } else if (short !== urlDatabase[short].shorturl) {
    res.status(303).send("URL does not exist!")
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

function generateRandomString() {
  let ranNum = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 7; i++)
    ranNum += possible.charAt(Math.floor(Math.random() * possible.length));

  return ranNum;
};

function userUrls(id){
  let obj = {};
    for (var key in urlDatabase){
      if ( id === urlDatabase[key].userId) {
          obj[key] = urlDatabase[key];
      }
    }
  return obj;
}

function userID(input){
  let ID = "";
    for (let key in urlDatabase){
      if (input === urlDatabase[key].shorturl) {
        ID = input;
      }
    }
  return ID;
}