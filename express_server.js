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
// renders the login page and passes it user id
app.get("/login", (req, res) => {
  let user_id = req.session.user_id
  res.render("urls_login", {user : users[user_id]})
});

//requests email address and password from the user
// runs a loop  to confirm that given email and pass are in the users DB
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

// home page showing HELLO
app.get("/", (req, res) => {
  if (userloggedin) {
    res.redirect("/urls")
  }
});

//listening to get info from the urlDatabase in JSON form
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//presents the user with with the form to change/edit the a long url, listens for long url submt
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id
  if (user_id === undefined || !user_id) {
    res.redirect("urls_login");
  } else {
    res.render("urls_new",{user : users[user_id]});
  }
});

app.get("/urls", (req, res) => {
   let userId = req.session.user_id
   let urlsForUser = userUrls(userId)

   res.render("urls_index", {urlsForUser: urlsForUser, user : users[userId]});
});

app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  let userId = req.session.user_id
  urlDatabase[newShort] = {};
  urlDatabase[newShort].longurl = req.body.longURL
  urlDatabase[newShort].newshort = newShort;
  urlDatabase[newShort].id = userId
  urlDatabase[newShort].longurl = req.body.longURL
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res)=> {
  const id = req.params.id
  const longURL = req.body.longURL;
  if (urlDatabase[id] === undefined) {
    urlDatabase[id].longurl = longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

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

  // let user_id = res.session.user_id
  res.redirect(303, "/urls")
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
    let user_id = req.session.user_id;
  if (user_id === urlDatabase[req.params.id].userId) {
      res.render("urls_show", {shortURL: req.params.id, url: urlDatabase[req.params.id].longurl, user : users[user_id]})
  } else {
    res.redirect(301, "/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.session.user_id
  if (id === urlDatabase[req.params.id].userId) {
    delete urlDatabase[req.params.id]
    res.redirect("/urls");
  } else {
    res.redirect(303, "/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  res.redirect(urlDatabase[short].longurl);
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