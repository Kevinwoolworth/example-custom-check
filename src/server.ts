// --- START OF FINAL DEBUGGING SERVER ---

console.log('[DEBUG] Server script started.');

try {
  // All imports are moved inside the try block to catch import-time errors.
  console.log('[DEBUG] Importing dependencies...');
  const express = require('express');
  // Explicitly import the types for Express
  const { Request, Response } = require('express'); 
  const { default: customLint } = require('./eslint');
  console.log('[DEBUG] Dependencies imported successfully.');

  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const port = process.env.PORT || 8080;

  console.log('[DEBUG] Setting up /custom-check route...');
  // Add the explicit types to the request and response objects
  app.post('/custom-check', async (req: typeof Request, res: typeof Response) => {
    try {
      const webRequest = new Request(`http://${req.headers.host}${req.url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-apollo-signature': req.headers['x-apollo-signature'] as string,
        },
        body: JSON.stringify(req.body),
      });

      const webResponse = await customLint(webRequest, {} as any);

      // Add the explicit types for the forEach loop
      webResponse.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value);
      });
      res.status(webResponse.status).send(await webResponse.text());

    } catch (error) {
      console.error('[ERROR] Error inside /custom-check handler:', error);
      res.status(500).send('Internal Server Error during request.');
    }
  });
  console.log('[DEBUG] Route setup complete.');

  console.log('[DEBUG] Starting server listener...');
  app.listen(port, () => {
    console.log(`[SUCCESS] Server is alive and listening at http://localhost:${port}/custom-check`);
  });

} catch (startupError) {
  // This is the most important part. It catches the hidden crash.
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!!  APPLICATION FAILED TO START (CRASH)   !!!');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!! The error is:');
  console.error(startupError);
  // The process must exit, otherwise Cloud Run might not collect the log.
  process.exit(1); 
}

// --- END OF FINAL DEBUGGING SERVER ---
