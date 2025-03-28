import session from "express-session";
import dotenv from "dotenv";

dotenv.config();
const sessionMiddleware = session({
  secret: process.env.JWT_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true nếu chạy HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, 
  },
});

export default sessionMiddleware;

