const express = require("express");
const helmet = require("helmet");
const dbFun = require("./dbFunctions");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secrets = require("./config/secrets.js")

const server = express();
server.use(helmet());
server.use(express.json());

//Register
server.post("/api/register", (req, res) => {
  const credentials = req.body;
  const hash = bcrypt.hashSync(credentials.password, 10);
  credentials.password = hash;

  dbFun
    .addUser(credentials)
    .then((dbRes) => {
      res.status(200).json(dbRes);
    })
    .catch((dbErr) => {
      res.status(500).json(dbErr);
    });
});

//Login
server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  dbFun
    .findByUsername(username)
    .then((user) => {
      if (user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user);
          // the server needs to return the token to the client
        // this doesn't happen automatically like it happens with cookies
        res.status(200).json({ message: `Welcome: ${user.username}! you have a token`, token });
      } else {
        res.status(401).json({ error: "You shall not pass!" });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

function generateToken(user) {
    const payload = {
        subject: user.id,
        username: user.username
    }

    const options = {
        expiresIn: '1h'
    };

    return jwt.sign(payload, secrets.jwtSecret, options)
}

//Read
server.get("/api/users", (req, res) => {
  dbFun
    .findUsers()
    .then((dbRes) => {
      res.status(200).json(dbRes);
    })
    .catch((dbErr) => {
      res.status(500).json(dbErr);
    });
});

// Sanity check
server.get("/", (req, res) => {
  res.status(200).json({ hello: "Hello World" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`API running on port ${PORT}`));
