import cors from "cors";
import express from "express";
import subjectRouter from "./routes/subjects";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/subjects", subjectRouter);

app.get("/", (req, res) => {
  res.send("Hello, this is the Classroom Backend!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
