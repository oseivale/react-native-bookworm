import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectedRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE a book
router.post("/", protectedRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        // Upload the image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        // Once upload is completed, you get an image URL
        const imageUrl = uploadResponse.secure_url;
        // Save to the database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        })

        await newBook.save()

        res.status(201).json(newBook)
    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({ message: error.message });
    }
})

// Example request would come from the frontend that looks like below:
// const response = await fetch("http://localhost:3000/api/books?page=3&limit=5");

// Pagination => infinite scroll & loading

// GET all books
router.get("/", protectedRoute, async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 }) // descending order
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });

    } catch (error) {
        console.log("Error in get all books route", error);
        res.status(500).json({ message: "Internal server error." })
    }
})

// GET all recommended books by the logged in user
router.get("/user", protectedRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error("Get user books error:", error.message);
        res.status(500).json({ message: "Server error." })
    }
})

// DELETE a book recommendation
router.delete("/:d", protectedRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        // Check if user is the creator of the book
        if (book.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Unauthorized" });

        // Example of how cloudinary stores the image url
        // https://res.cloudinary.com/de1rm4uto/image/upload/v1741568358/gyup61vejflxxw8igvi0.png 
        // Delete image from Cloudinary as well
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary", deleteError)
            }
        }

        // Delete from DB
        await book.deleteOne();
        res.json({ message: "Book deleted successfully." });
    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({ message: "Internal server error." })
    }
})

export default router;