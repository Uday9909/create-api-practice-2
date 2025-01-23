const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Path to the data.json file
const dataFilePath = path.join(__dirname, 'data.json');

const loadBooks = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return []; 
    }
};


const saveBooks = (books) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving data to file', err);
    }
};

// Load books from data.json at the start
let books = loadBooks();

// **POST /books** - Create a new book
app.post('/books', (req, res) => {
    const { book_id, title, author, genre, year, copies } = req.body;

    // Input validation
    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ error: 'All fields are required: book_id, title, author, genre, year, copies' });
    }

    // Check if the book already exists (optional)
    const existingBook = books.find(b => b.book_id === book_id);
    if (existingBook) {
        return res.status(400).json({ error: 'Book with this ID already exists' });
    }

    // Create a new book object
    const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);

    // Save the updated books to data.json
    saveBooks(books);

    res.status(201).json(newBook);
});

// **GET /books** - Retrieve all books
app.get('/books', (req, res) => {
    res.json(books);
});

// **GET /books/:id** - Retrieve a specific book by ID
app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.book_id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
});

// **PUT /books/:id** - Update a book by ID
app.put('/books/:id', (req, res) => {
    const book = books.find(b => b.book_id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const { title, author, genre, year, copies } = req.body;

    // Update the fields that were provided
    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (year) book.year = year;
    if (copies) book.copies = copies;

    // Save the updated books to data.json
    saveBooks(books);

    res.json(book);
});

// **DELETE /books/:id** - Delete a book by ID
app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.book_id === req.params.id);
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    // Remove the book from the array
    books.splice(bookIndex, 1);

    // Save the updated books to data.json
    saveBooks(books);

    res.json({ message: 'Book deleted' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
