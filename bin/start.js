#!/usr/bin/env node
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// __filename equivalent
const __filename = fileURLToPath(import.meta.url);

// __dirname equivalent
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

// Get JSON file from CLI argument
const jsonFile = process.argv[2];
let configData = {};
if (jsonFile) {
  const fullPath = path.resolve(process.cwd(), jsonFile);
  if (fs.existsSync(fullPath)) {
    configData = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    console.log("Loaded JSON:", fullPath);
  } else {
    console.warn("JSON file not found:", fullPath);
  }
} else {
  console.log("No JSON file provided. You can pass it like: npx my-react-app ./data.json");
}

// Serve React build
app.use(express.static(path.join(__dirname, "../dist")));

// Serve JSON to React app
app.get("/config.json", (req, res) => {
  res.json(configData);
});

// SPA fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`🚀 React app running at http://localhost:${port}`);
});
