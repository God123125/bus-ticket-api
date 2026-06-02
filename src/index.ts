import express, { Request, Response } from "express";
import cors from "cors";
import appRouter from "./routes/routers";
import * as model from "./models";
import { logColors, log } from "./utils/log.util";
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
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const url = req.url;
    res.on("finish", () => {
      log(
        `${res.statusCode > 399 ? logColors.FgRed : logColors.FgGreen}${res.statusCode}${logColors.Reset} ${req.method.padEnd(8)}: ${url}`,
      ); // \t${req.get('user-agent')}
    });
    next();
  });
}
app.use("/api", appRouter);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
model.connect();
