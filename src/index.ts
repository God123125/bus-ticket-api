import express, { Request, Response } from "express";
import cors from "cors";
import appRouter from "./routes/routers";
import * as model from "./models";
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello from expressJs",
    version: 1,
  });
});
app.use("/api", appRouter);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
model.connect();
