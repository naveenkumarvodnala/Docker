const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Establish the database link
const db = mysql.createConnection({
  host: "student-database.cr6iii6y2d6b.ap-south-2.rds.amazonaws.com",
  user: "admin",
  password: "password123",
  database: "studentdb",
});

db.connect((err) => {
  if (err) console.error("Database connection failed: " + err.stack);
  else console.log("Successfully connected to AWS RDS MySQL!");
});

// 2. CREATE API (Insert Student)
app.post("/students", (req, res) => {
  const { name, email, course } = req.body;
  const sql = "INSERT INTO students (name, email, course) VALUES (?, ?, ?)";
  db.query(sql, [name, email, course], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({
      message: "Student inserted successfully!",
      id: result.insertId,
    });
  });
});

// 3. READ API (Get all Students)
app.get("/students", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 4. DELETE API (Remove a Student)
app.delete("/students/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM students WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Student deleted!" });
  });
});

app.listen(5000, () => console.log("Backend server running on port 5000"));
