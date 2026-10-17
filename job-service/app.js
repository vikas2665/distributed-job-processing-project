
const express = require("express");
const { randomUUID } = require("crypto");

const app = express();

// Middleware to parse incoming JSON
app.use(express.json());

// Temporary in-memory storage
let jobs = [];

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "job-service"
    });
});

// Create a job
app.post("/api/jobs", (req, res) => {
    const type = req.body.type;
    const payload = req.body.payload;

    // Validate request
    if (
        typeof type !== "string" ||
        type.trim() === "" ||
        payload === undefined ||
        payload === null ||
        typeof payload !== "object" ||
        Array.isArray(payload)
    ) {
        return res.status(400).json({
            error: "A valid type and payload object are required"
        });
    }

    // Generate unique job ID
    const id = randomUUID();

    const job = {
        job_id: id,
        type: type,
        payload: payload,
        status: "queued",
        created_at: new Date().toISOString()
    };

    // Store job temporarily in memory
    jobs.push(job);

    return res.status(201).json(job);
});

// Retrieve a job by ID
app.get("/api/jobs/:id", (req, res) => {
    const id = req.params.id;

    const job = jobs.find(job => job.job_id === id);

    if (!job) {
        return res.status(404).json({
            error: "job not found"
        });
    }

    return res.status(200).json(job);
});

// Export app for server startup and testing
module.exports = { app };
