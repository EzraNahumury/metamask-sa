import express from "express";
import { config } from "./config.js";
import { buildRouter } from "./routes.js";

const app = express();
app.use("/", buildRouter());

app.listen(config.PORT, () => {
  console.log(`merchants listening at http://localhost:${config.PORT}`);
  console.log(`recipient: ${config.MERCHANT_RECIPIENT}`);
});
