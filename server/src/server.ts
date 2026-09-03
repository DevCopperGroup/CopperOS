import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Servidor de Autenticação rodando em http://localhost:${env.PORT}`);
  console.log(`📡 Modo: ${env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  console.log('Fechando servidor HTTP...');
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});
