const express = require("express");
const cors = require("cors");
const { Client } = require("pg");
const { Signer } = require("@aws-sdk/rds-signer");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
let client; // Keeps the DB client accessible globally to your API routes

async function startServer() {
  // 1. Generate your IAM Auth Token
  const signer = new Signer({
    hostname: "database-1-instance-1.cr6iii6y2d6b.ap-south-2.rds.amazonaws.com",
    port: 5432,
    username: "postgres",
    region: "ap-south-2",
  });

  const token = await signer.getAuthToken();

  // 2. Initialize the client configuration
  client = new Client({
    host: "database-1-instance-1.cr6iii6y2d6b.ap-south-2.rds.amazonaws.com",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: token,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // 3. Handle background connection drops so Node doesn't crash
  client.on("error", (err) => {
    console.error("⚠️ Database background error:", err.message);
  });

  try {
    // 4. Connect to the database
    await client.connect();
    console.log("🚀 Successfully connected to Aurora PostgreSQL via IAM!");

    const res = await client.query("SELECT NOW();");
    console.log("⏰ Database Time Check:", res.rows[0].now);

    // 5. START EXPRESS SERVER ONLY AFTER DB IS READY
    app.listen(PORT, () => {
      console.log(`✅ Express backend API active at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Direct connection attempt failed:", error.message);
    process.exit(1);
  }
}

// --- API ROUTES FOR REACT FRONTEND ---

// GET API (Fetch All Students)
app.get("/students", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT * FROM students ORDER BY id DESC;",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching students:", err.message);
    res.status(500).send(err.message);
  }
});

// POST API (Insert Student)
app.post("/students", async (req, res) => {
  const { name, email, course } = req.body;
  try {
    const sql =
      "INSERT INTO students (name, email, course) VALUES ($1, $2, $3) RETURNING id;";
    const result = await client.query(sql, [name, email, course]);
    res.send({
      message: "Student inserted successfully!",
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("Error inserting student:", err.message);
    res.status(500).send(err.message);
  }
});

// DELETE API (Remove Student)
app.delete("/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await client.query("DELETE FROM students WHERE id = $1;", [id]);
    res.send({ message: "Student deleted!" });
  } catch (err) {
    console.error("Error deleting student:", err.message);
    res.status(500).send(err.message);
  }
});

// Kickstart the execution block
startServer();
