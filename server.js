const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER, // PostgreSQL user
  host: process.env.DB_HOST, // Database host (localhost or db container)
  database: process.env.DB_NAME, // Database name
  password: process.env.DB_PASS, // Database password
  port: process.env.DB_PORT, // Database port
});

// POST: Create a student
app.post("/students", async (req, res) => {
  try {
    const { studentID, studentName, course, presentDate } = req.body;

    // Check if the student already exists
    const result = await pool.query(
      "SELECT * FROM students WHERE studentID = $1",
      [studentID]
    );
    if (result.rows.length > 0) {
      return res.status(409).json({ message: "Student already exists" });
    }

    // Insert new student
    await pool.query(
      "INSERT INTO students (studentID, studentName, course, presentDate) VALUES ($1, $2, $3, $4)",
      [studentID, studentName, course, presentDate]
    );

    res.status(201).json({ message: "Student created successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating student", error: error.message });
  }
});

// GET: Retrieve all students
app.get("/students", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching students", error: error.message });
  }
});

// PUT: Update a student's details
app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, course, presentDate } = req.body;

    // Check if the student exists
    const result = await pool.query(
      "SELECT * FROM students WHERE studentID = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update student details
    await pool.query(
      "UPDATE students SET studentName = $1, course = $2, presentDate = $3 WHERE studentID = $4",
      [studentName, course, presentDate, id]
    );

    res.json({ message: "Student updated successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating student", error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
