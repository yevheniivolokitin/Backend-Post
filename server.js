const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

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
   const { title, content, image_url } = req.body;
   const sql =
      "INSERT INTO Posts (`title`, `content`, `image_url`) VALUES (?, ?, ?)";
   const values = [title, content, image_url];

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
   const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";

   db.query(sql, [req.body.email, req.body.password], (err, data) => {
      if (err) {
         return res.json("Error");
      }
      if (data.length > 0) {
         return res.json("Success");
      } else {
         return res.json("Failed");
      }
   });
});

app.listen(8081, () => {
   console.log("listening");
});
