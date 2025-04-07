
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        console.log("✅ MongoDB is already connected."); // Connection exists
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = { bufferCommands: false };

        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/quickcart`, opts)
            .then((mongoose) => {
                console.log("✅ MongoDB connected successfully."); // Success message
                return mongoose;
            })
            .catch((err) => {
                console.error("❌ MongoDB connection error:", err);
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        console.log("✅ MongoDB connection established.");
        return cached.conn;
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error);
        throw error;
    }
}

export default connectDB;
