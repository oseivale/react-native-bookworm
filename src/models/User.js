import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profileImage: {
        type: String,
        default: ""
    },
}, {
    timestamps: true
});

// hash password before saving user to DB
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // The greated your salt value, the stronger the salting of your PW will be, 
    // however the process will also take longer
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Once hashing is done, call the next function
    // next();
})

// The Schema above will used to create the model
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model("User", userSchema);
// mongoose takes the above and converts it to "users"

export default User;

