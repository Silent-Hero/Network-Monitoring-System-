const express = require("express");
const { spawn } = require("child_process");

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Set the Content-Security-Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' http://localhost:3000"
  );
  next();
});

// Route handler for running the ping test
app.post("http://localhost:3000/ping", (req, res) => {
  // Extract the IP address and port number from the request body
  const { ipAddress, portNumber } = req.body;

  // Run the ping command
  const ping = spawn("ping", ["-c", "5", ipAddress, "-p", portNumber]);

  // Capture the output of the ping command
  let output = "";
  ping.stdout.on("data", (data) => {
    output += data.toString();
  });

  // Handle completion of the ping command
  ping.on("close", (code) => {
    if (code === 0) {
      // Ping test completed successfully
      res.json({ success: true, result: output });
    } else {
      // Ping test failed
      res.json({ success: false, result: output });
    }
  });
});

// Route handler for running the IPerf test
app.post("http://localhost:3000/iperf", (req, res) => {
  // Extract data from the request body
  const { serverIP, clientIP, iperfPort, testDuration } = req.body;

  // Run the IPerf test command
  const iperf = spawn("iperf", [
    "-c",
    serverIP,
    "-B",
    clientIP,
    "-p",
    iperfPort,
    "-t",
    testDuration,
  ]);

  // Capture the output of the IPerf test
  let output = "";
  iperf.stdout.on("data", (data) => {
    output += data.toString();
  });

  // Handle completion of the IPerf test
  iperf.on("close", (code) => {
    if (code === 0) {
      // Test completed successfully
      res.json({ success: true, result: output });
    } else {
      // Test failed
      res.json({ success: false, result: output });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
