const express = require("express");
const app = express();
const appRoutes = require("./src/api-routes/index");
require("dotenv/config");
const { scheduleFetchJob } = require("./src/jobs/jobs");
const cors = require('cors')

app.use(cors())

const body_parser = require("body-parser");
scheduleFetchJob();

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
