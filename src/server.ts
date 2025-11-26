import express from 'express';
import customLint from './eslint'; // Your existing serverless function

// Create an Express application
const app = express();

// The customLint function expects the request body to be raw JSON.
// We configure Express to parse the JSON body of incoming requests.
app.use(express.json({ limit: '50mb' }));

// Get the port from the environment variable for Cloud Run, or default to 8080.
const port = process.env.PORT || 8080;

// This is an adapter. It creates a route that listens for POST requests.
// When a request comes in, it converts the Express request into a format
// your serverless function understands, calls it, and sends back the response.
app.post('/custom-check', async (req, res) => {
  try {
    // 1. Construct a Web Standard `Request` object that `customLint` expects.
    const webRequest = new Request(`http://${req.headers.host}${req.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any other headers that might be important
        'x-apollo-signature': req.headers['x-apollo-signature'] as string,
      },
      body: JSON.stringify(req.body),
    });

    // 2. Call your original handler with the converted request.
    const webResponse = await customLint(webRequest);

    // 3. Convert the Web Standard `Response` back into an Express response.
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.status(webResponse.status).send(await webResponse.text());

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the Express server and listen on the configured port.
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
