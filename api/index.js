import express from "express";
import mysql from "mysql";
import cors from "cors";
import multer from "multer"; // Import multer
import path from "path"; // Import path for file handling

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Set the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the file name
  },
});

const upload = multer({ storage }); // Create multer instance

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Khushi@23",
  database: "test",
});

app.get("/", (req, res) => {
  res.json("hello this is backend");
});

app.get("/books", (req, res) => {
  const q = "SELECT * FROM books";
  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json(data);
  });
});

// Use multer middleware to handle file uploads when adding books
app.post("/books", upload.single('cover'), (req, res) => {
  const q = "INSERT INTO books(`title`, `desc`, `price`, `cover`) VALUES (?)";

  const values = [
    req.body.title,
    req.body.desc,
    req.body.price,
    req.file ? `/uploads/${req.file.filename}` : null, // Save the path to the image
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});

// Delete a book by ID
app.delete("/books/:id", (req, res) => {
  const bookId = req.params.id;
  const q = "DELETE FROM books WHERE id = ?";

  db.query(q, [bookId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});

// Use multer middleware to handle file uploads when updating books
app.put("/books/:id", upload.single('cover'), (req, res) => {
  const bookId = req.params.id;
  
  // Check if a new file was uploaded
  const q = "UPDATE books SET `title`= ?, `desc`= ?, `price`= ?, `cover`= ? WHERE id = ?";
  
  const values = [
    req.body.title,
    req.body.desc,
    req.body.price,
    req.file ? `/uploads/${req.file.filename}` : req.body.cover, // Use new cover if uploaded, else keep existing
  ];

  db.query(q, [...values, bookId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});

app.listen(8800, () => {
  console.log("Connected to backend.");
});
