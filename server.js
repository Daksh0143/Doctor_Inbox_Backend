require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/auth.routes");
const mailboxRoutes = require("./routes/mailbox.routes");
const warmupRoutes = require("./routes/warmup.routes");
const healthRoutes = require("./routes/health.routes");

app.use(express.json());
app.use(cors({
    origin: "*",
}))

// Public route
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mailboxes", mailboxRoutes);
app.use("/api/v1/warmup", warmupRoutes);
app.use("/api/v1/health", healthRoutes);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

module.exports = app;