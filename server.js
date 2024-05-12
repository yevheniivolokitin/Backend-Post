const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");

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
   console.log("Connected to database");

   const createPostsTable = `
      CREATE TABLE IF NOT EXISTS Posts (
         id INT AUTO_INCREMENT PRIMARY KEY,
         title VARCHAR(255),
         content TEXT,
         image_url VARCHAR(255),
         username VARCHAR(255),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
   `;

   db.query(createPostsTable, (err, result) => {
      if (err) {
         throw err;
      }
      console.log("Posts table created successfully");
   });
});

app.post("/create", (req, res) => {
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
// Добавляем маршрут для получения всех постов
app.get("/main", (req, res) => {
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
   const sql = "INSERT INTO login(`name`,`email`,`password`) VALUES (?)";
   const values = [req.body.name, req.body.email, req.body.password];
   db.query(sql, [values], (err, data) => {
      if (err) {
         return res.json("Error");
      }
      return res.json(data);
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
   console.log("listening");
});
