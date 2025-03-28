import cors from "cors";

const corsMiddleware = cors({
  origin: "http://localhost:5174 ",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH","HEAD"],
  allowedHeaders: ["Content-Type", "Authorization"],
   credentials: true,
});

export default corsMiddleware;
