const cors = require("cors");
const express = require("express");
const probe = require("kube-probe");
const config = require("./config");

const mainApi = express();
mainApi.use(
  cors({
    origin: config.corsOrigins,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

mainApi.get("/", (_req, res) => {
  res.json({
    message: `Hello World! Commit: ${process.env.COMMIT_SHA}, BuildNumber: ${process.env.BUILD_NUMBER}, AppName: ${process.env.APPLICATION_NAME}`,
  });
});

mainApi.get("/a-path", (req, res) => {
  res.json({ message: "Hello from a path!", query: req.query });
});

// In reality, you would probably have your liveness and readiness probes
// returning 200 only when the application is actually ready (e.g. connectivity to DB)
const probeApi = express();
probe(probeApi, {
  livenessURL: "/health/live",
  readinessURL: "/health/ready",
});

module.exports = {
  mainApi,
  probeApi,
};
