const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./authMiddleware"); // Убедитесь, что authMiddleware правильно импортирован

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "posts",
});
db.connect((err) => {
   if (err) {
      throw err;
   }

   console.log("Connected ");
});

app.post("/create", authenticateToken, (req, res) => {
   const { title, content, image_url, username } = req.body;
   const sql =
      "INSERT INTO Posts (`title`, `content`, `image_url`,`username`) VALUES (?, ?, ?, ?)";
   const values = [title, content, image_url, username];

   db.query(sql, values, (err, result) => {
      if (err) {
         console.error("Error adding post: ", err);
         res.status(500).json({
            error: "An error occurred while adding the post",
         });
      } else {
         console.log("Post added successfully");
         res.status(200).json({ message: "Post added successfully" });
      }
   });
});

app.get("/main", authenticateToken, (req, res) => {
   const sql = "SELECT * FROM Posts";

   db.query(sql, (err, results) => {
      if (err) {
         console.error("Error fetching posts: ", err);
         res.status(500).json({
            error: "An error occurred while fetching posts",
         });
      } else {
         res.status(200).json(results);
      }
   });
});

app.post("/signup", (req, res) => {
   const { user_id, name, email, password } = req.body;
   const loginSql =
      "INSERT INTO login (`user_id`, `name`, `email`, `password`) VALUES (?, ?, ?, ?)";
   const profilesSql =
      "INSERT INTO Profiles (`user_id`, `name`, `email`) VALUES (?, ?, ?)";

   const loginValues = [user_id, name, email, password];
   const profilesValues = [user_id, name, email];

   db.query(loginSql, loginValues, (err, data) => {
      if (err) {
         console.error("Error adding user to login table: ", err);
         return res.json("Error");
      }
      db.query(profilesSql, profilesValues, (err, data) => {
         if (err) {
            console.error("Error adding user to Profiles table: ", err);
            return res.json("Error");
         }
         return res.json(data);
      });
   });
});

app.post("/login", (req, res) => {
   const { email, password } = req.body;
   const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";

   db.query(sql, [email, password], (err, data) => {
      if (err) {
         return res.status(500).json({ error: "Internal server error" });
      }

      if (data.length > 0) {
         // Генерация токена JWT
         const token = jwt.sign({ email: email }, "your_secret_key", {
            expiresIn: "1h",
         });
         return res.status(200).json({ token: token });
      } else {
         return res.status(401).json({ error: "Authentication failed" });
      }
   });
});

app.listen(8081, () => {
   console.log("Connected to database");
});
