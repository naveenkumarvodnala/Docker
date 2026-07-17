const express = require("express");
const cors = require("cors");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// 1. Initialize the Stateless DynamoDB Document Client
const baseClient = new DynamoDBClient({ region: "ap-south-2" });
const docClient = DynamoDBDocumentClient.from(baseClient);

// 2. CREATE: Save a Student Item
app.post("/students", async (req, res) => {
  const { name, email, course } = req.body;

  // Create a unique identifier since we aren't using auto-incrementing SQL IDs
  const uniqueId = "STU_" + Date.now();

  const command = new PutCommand({
    TableName: "Students",
    Item: {
      studen_id: uniqueId, // Partition Key
      name: name,
      email: email,
      course: course,
      createdAt: new Date().toISOString(),
    },
  });

  try {
    await docClient.send(command);
    // Return the id back so React can immediately assign a list key
    res.send({ message: "Student saved to DynamoDB!", id: uniqueId });
  } catch (err) {
    console.error("DynamoDB Write Error:", err.message);
    res.status(500).send(err.message);
  }
});

// 3. READ: Query/Scan All Student Items
app.get("/students", async (req, res) => {
  const command = new ScanCommand({
    TableName: "Students",
  });

  try {
    const data = await docClient.send(command);

    // Remap DynamoDB's partition key field 'student_id' to match your React template's 'id' expectation
    const formattedStudents = data.Items.map((item) => ({
      id: item.studen_id,
      name: item.name,
      email: item.email,
      course: item.course,
    }));

    res.json(formattedStudents);
  } catch (err) {
    console.error("DynamoDB Scan Error:", err.message);
    res.status(500).send(err.message);
  }
});

// 4. DELETE: Remove an Item by Partition Key
app.delete("/students/:id", async (req, res) => {
  const { id } = req.params;

  const command = new DeleteCommand({
    TableName: "Students",
    Key: {
      studen_id: id, // Look up target item exactly by Partition Key
    },
  });

  try {
    await docClient.send(command);
    res.send({ message: "Student removed from DynamoDB!" });
  } catch (err) {
    console.error("DynamoDB Delete Error:", err.message);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverless Backend active at http://localhost:${PORT}`);
});
