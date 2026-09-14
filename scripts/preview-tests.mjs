import { preview } from 'astro';

// Use the API so the test runner owns the server process even in agent environments.
const server = await preview({
  base: '/recipes/',
  server: { host: '127.0.0.1', port: 4322 },
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
