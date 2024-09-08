# MERN-Authentication-Project

Project is Live at this Link: https://main--fancy-fudge-0225e7.netlify.app/login      &&          https://mern-authentication-project.onrender.com

To run this project on your local machine, run the 3 commands below in the terminal:
run install
npm run build
npm run start


Steps to create this project:
Step 1:  npm init -y   (which gives  package json file in the root of directory)
Step 2:  install all required packages for project 
         npm install express            (For server and backend)
         npm install cookie-parser      (to parse cookie from request)
         npm install mailtrap           (to send emails)
         npm install bcryptjs           (to hash the passwords)
         npm install dotenv             (to be able to treat the data in .env file which will be environment variables)
         npm install jsonwebtoken       (where we can create, decode tokens and have authentication)
         npm install mongoose           (database)
         npm install crypto             ()

Step 3: install a dev dependency       npm i nodemon -D
Step 4:  edit this in package.json file       "type": "module",       to use import and export syntax in the project
                                              "scripts": { "dev": "nodemon backend/index.js" }   to run the server using nodemon
                                            
Step 5: use npm run dev to run the server
step 6: create a .env file and add the following variables
         MONGO_URI=mongodb+srv://sameerkhanbgsu:gOvxQrJ2JNXuJnzX@cluster0.qvmgf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

Step 7: create a folder called db and create a file called connectDB.js and add the following code to connect to the database
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
         
Step 8: create routes folder and create a file called auth.route.js and add the following code to create routes for the user
         import express from "express";

        const router  = express.Router();

        router.get("/signup", signup);
        router.get("/login", login);
        router.get("/logout", logout);
        export default router;

Step 9: create a folder called controllers and create a file called auth.controller.js and add the following code to create controllers for the user
         export const signup = async (req, res) => {
	        res.send("Signup route");
        }
        export const login = async (req, res) => {
	       res.send("login route");
        }
        export const logout = async (req, res) => {
	       res.send("logout route");
        }

Step 10: create a folder called modles and create a file called user.model.js and add the following code to create a schema for the user
        import mongoose from "mongoose";

        const userSchema = new mongoose.Schema({
	       email: {type: String, required: true, unique: true},
	       password: {type: String, required: true},
	       name: {type: String, required: true},
	       lastLogin: {type: Date, default: Date.now()},
	       isVerified: {type: Boolean, default: false},
	       resetPasswordToken: String,
	       resetPasswordExpiresAt: Date,
	       verificationToken: String,
	       varificationTokenExpiresAt: Date
        }, {timestamps: true});

        export const User = mongoose.model("User", userSchema);

Step 11: working with signup route
         create a folder called controller and create a file called auth.controller.js and add the following code to create a controller for the signup route
         export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		if (!email || !password || !name) {
			throw new Error("Please fill all the fields");
		}

		const userAlreadyExists = await User.findOne({ email });
		if (userAlreadyExists) { return res.status(400).json({success: false, message: "User already exists" }) }

		const hashedPassword = await bcryptjs.hash(password, 10);
		// 12345 = $2a$10$jhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhg
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		const user = new User({ 
			email, 
			password: hashedPassword, 
			name,
			verificationToken,
			varificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
		})

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		res.status(201).json({
			 success: true,
			  message: "User created successfully",
			   user: {
				...user._doc,
			    password: undefined
			},
	 });

	} catch (error) {
		res.status(400).json({ success: false, message: error.message })
	  }
    }

Step 12: create a folder called utils and create a file called generateTokenAndSetCookie.js and add the following code to generate a token and set it as a cookie
         import jwt from 'jsonwebtoken';

         export const generateTokenAndSetCookie = (res, userId) => {
	     const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		     expiresIn: '7d',
	     });

	     res.cookie('token', token, {
		     httpOnly: true, 
		     secure: process.env.NODE_ENV === 'production', 
		     sameSite: 'strict',
		     maxAge: 7 * 24 * 60 * 60 * 1000,
         });

         return token;
         };

Step 13: Send verification email to user using mailtrap 
         create a folder called mailtrap and create these files called email.js, emailTemplates.js and mailtrap.config.js.

step 14: get verification token from url and verify the user



 
