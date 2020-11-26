export const ambiente = {
  server: {
    nomeAplicacao: process.env.APPLICATION_NAME || 'apl-ssp-back',
    port: process.env.SERVER_PORT || 3000,
  },
  database: {
    url: process.env.DB_URL || 'mongodb+srv://admin:VpfGXEQPu4Gn989O@cluster0.k1fow.mongodb.net/carteiras?retryWrites=true&w=majority',
  },
  seguranca: {
    nivelSegurancaBcrypt: process.env.SALT_ROUNDS || 7,
  }
}