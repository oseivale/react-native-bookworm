import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async (req, res, next) => {
    try {
        // GET token
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "No authentication token, access denied." });

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(401).json({ message: "Token is not valid" });

        req.user = user;
        // When next is called, it will move on to the next function 
        // within th handler (see bookRoutes create "/" route)
        next()
    } catch (error) {
        console.lerror("Authentication error:", error.message);
        res.status(401).json({ message: "Token is not valid" })
    }
}

export default protectedRoute;