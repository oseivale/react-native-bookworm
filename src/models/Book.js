import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    user: {
        // connecting a book to a user --> referencing another model to get the ID - DB association
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true })

const Book = mongoose.model("Book", bookSchema);

export default Book;