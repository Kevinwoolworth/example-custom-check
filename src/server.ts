import express, { Request, Response } from 'express'; // Import types
import customLint from './eslint'; // Your existing function logic

const app = express();
app.use(express.json({ limit: '50mb' }));
const port = process.env.PORT || 8080;

// The route that wraps your Netlify function
app.post('/custom-check', async (req: Request, res: Response) => { // Add types
  try {
    // 1. Create a Request object that looks like what a Netlify Function receives.
    const webRequest = new Request(`http://${req.headers.host}${req.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-apollo-signature': req.headers['x-apollo-signature'] as string,
      },
      body: JSON.stringify(req.body),
    });

    // 2. Call your original handler. Netlify functions expect a second 'context'
    //    argument, so we pass a dummy empty object.
    const webResponse = await customLint(webRequest, {} as any);

    // 3. Send the response from your function back to the client.
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.status(webResponse.status).send(await webResponse.text());

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}/custom-check`);
});
