
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { app } = require("../app");

// Test 1: Health endpoint
test("GET /health returns healthy status", async () => {
    const response = await request(app)
        .get("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "ok");
    assert.equal(response.body.service, "job-service");
});

// Test 2: Create a job successfully
test("POST /api/jobs creates a job", async () => {
    const response = await request(app)
        .post("/api/jobs")
        .send({
            type: "email",
            payload: {
                to: "test@example.com"
            }
        });

    assert.equal(response.status, 201);
    assert.ok(response.body.job_id);
    assert.equal(response.body.type, "email");
    assert.deepEqual(response.body.payload, {
        to: "test@example.com"
    });
    assert.equal(response.body.status, "queued");
    assert.ok(response.body.created_at);
});

// Test 3: Reject missing type
test("POST /api/jobs rejects missing type", async () => {
    const response = await request(app)
        .post("/api/jobs")
        .send({
            payload: {
                to: "test@example.com"
            }
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.error,
        "A valid type and payload object are required"
    );
});

// Test 4: Reject empty type
test("POST /api/jobs rejects empty type", async () => {
    const response = await request(app)
        .post("/api/jobs")
        .send({
            type: "   ",
            payload: {
                to: "test@example.com"
            }
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.error,
        "A valid type and payload object are required"
    );
});

// Test 5: Reject array as payload
test("POST /api/jobs rejects array payload", async () => {
    const response = await request(app)
        .post("/api/jobs")
        .send({
            type: "email",
            payload: ["test@example.com"]
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.error,
        "A valid type and payload object are required"
    );
});

// Test 6: Retrieve an existing job
test("GET /api/jobs/:id retrieves an existing job", async () => {
    const createResponse = await request(app)
        .post("/api/jobs")
        .send({
            type: "email",
            payload: {
                to: "retrieve@example.com"
            }
        });

    assert.equal(createResponse.status, 201);

    const jobId = createResponse.body.job_id;

    const response = await request(app)
        .get(`/api/jobs/${jobId}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.job_id, jobId);
    assert.equal(response.body.type, "email");
    assert.equal(response.body.status, "queued");
});

// Test 7: Return 404 for a non-existent job
test("GET /api/jobs/:id returns 404 for unknown job", async () => {
    const response = await request(app)
        .get("/api/jobs/non-existent-job-id");

    assert.equal(response.status, 404);
    assert.equal(response.body.error, "job not found");
});
