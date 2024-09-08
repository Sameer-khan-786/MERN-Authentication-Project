import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		console.log("mongo_uri", process.env.MONGO_URI)
		const conn = await mongoose.connect(process.env.MONGO_URI)
		console.log(`MongoDB Connected: ${conn.connection.host}`)
	} catch (error) {
		console.error(`Error: ${error.message}`)
		process.exit(1) // faliure exit code
	}
};