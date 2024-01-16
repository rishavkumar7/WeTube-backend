import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    path: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use(express.json({limit: "16kb"}));

app.use(express.static("public"));

app.use(cookieParser());

// routes import
import userRoute from "./routes/user.route.js"

// routes declarations
app.use("/api/v1/users", userRoute);

export { app };