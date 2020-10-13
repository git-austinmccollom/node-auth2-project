const express = require("express");
const helmet = require("helmet");
const dbFun = require("./dbFunctions");
const bcrypt = require("bcryptjs");

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
