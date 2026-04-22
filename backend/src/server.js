const http = require('http');
const app  = require('./app');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;
// backend - server.js ou index.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
const server = http.createServer(app);

// Initialisation WebSocket (Socket.io)
initSocket(server);

server.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 Environnement : ${process.env.NODE_ENV}`);
  console.log(`❤️  Health check  : http://localhost:${PORT}/api/health\n`);
});

// Arrêt propre
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Arrêt propre du serveur...');
  server.close(() => process.exit(0));
});
