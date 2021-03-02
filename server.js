const express = require("express");
const app = express();
const appRoutes = require("./src/api-routes/index");
require("dotenv/config");

const body_parser = require("body-parser");

app.use(body_parser.json());

app.use(
  body_parser.urlencoded({
    extended: true,
  })
);

app.use("/api", appRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server listening at ${process.env.PORT}`);
});