require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const path = require("path");


const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const noteSchema = new mongoose.Schema({
    title: String,
    description: String
});

const Note = mongoose.model("Note", noteSchema);

// Create Note
app.post("/notes", async (req, res) => {
    const note = await Note.create(req.body);
    res.json(note);
});

// Get All Notes
app.get("/notes", async (req, res) => {
    const notes = await Note.find();
    res.json(notes);
});

// Update Note
app.put("/notes/:id", async (req, res) => {
    const note = await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(note);
});

// Delete Note
app.delete("/notes/:id", async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note Deleted" });
});

app.listen(5000, () => {
    console.log("Server Running on Port 5000");
});