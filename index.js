const express = require("express");
const helmet = require("helmet");
const dbFun = require("./dbFunctions");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("./config/secrets.js")

const server = express();
server.use(helmet());
server.use(express.json());

//Middleware

const restricted = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: "jwt error"})
            } else {
                req.jwt = decodedToken;
                next();
            }
        });
    } else {
        res.status(401).json({ message: "you shall not pass"})
    }
}

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
        username: user.username,
        role: user.role
    }

    const options = {
        expiresIn: '1h'
    };

    return jwt.sign(payload, jwtSecret, options)
}

//Read
server.get("/api/users", restricted, (req, res) => {
  dbFun
    .findUsers()
    .then((dbRes) => {
      res.status(200).json(dbRes);
    })
    .catch((dbErr) => {
      res.status(500).json(dbErr);
    });
});

//Logout
server.get("/api/logout", (req, res) => {
    if (req.session) {
        req.session.destroy( err => {
            if(err) {
                res.send("error logging out");
            } else {
                res.send("good bye");
            }
        })
    } else {
        res.send("you aren't logged in, or you don't have a session")
    }
})

// Sanity check
server.get("/", (req, res) => {
  res.status(200).json({ hello: "Hello World" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`API running on port ${PORT}`));
