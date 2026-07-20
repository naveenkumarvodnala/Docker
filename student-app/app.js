require("dotenv").config();

const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.json());

const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
})

db.connect((err) => {
    if(err){
        console.log("Database Connection Failed",`${err}`);
        return;
    }
    console.log("Connected to sql");
});

app.get("/", (req,res)=>{
    res.send("Student Management API Running")
});

app.get("/Students", (req,res)=>{
    db.query("SELECT * FROM students",(err, result)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.json(result)
    })
})

app.post('/students', (req,res)=>{
    const {name,email,course} = req.body;

    db.query('INSERT INTO students(name,email,course) VALUES(?,?,?)',
        [name, email,course],
        (err) => {
            if(err){
                return res.status(500).json(err)
            }
            res.send("Student Added Successfully");
        }

    )
})

app.listen(process.env.PORT, () =>{
    console.log(`Server Runing on ${process.env.PORT}`)
})