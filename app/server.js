const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    application: "Blue Indigo",
    status: "running",
    platform: process.env.PLATFORM || "local"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy"
  });
});

app.listen(port, () => {
  console.log(`Blue Indigo listening on port ${port}`);
});