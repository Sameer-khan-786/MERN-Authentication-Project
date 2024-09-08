import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js"

dotenv.config();

const app = express();

export const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));   // allows us to make requests from different domai

app.use(express.json());   // allows us to parse json data from the request body
app.use(cookieParser());   // allows us to parse cookies from the request header

app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port: ", PORT)
});

//  gOvxQrJ2JNXuJnzX

