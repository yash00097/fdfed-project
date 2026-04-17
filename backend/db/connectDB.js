import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        const message = "MONGO_URI is not defined";

        if (process.env.NODE_ENV === "test") {
            console.warn(message);
            return null;
        }

        throw new Error(message);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);

        if (process.env.NODE_ENV === "test") {
            return null;
        }

        throw error;
    }
};
