
import { Server } from '../server/server'
import { carteirasRoute } from './modules/carteiras/carteiras.route'

const server = new Server()
server.bootstrap([
  carteirasRoute
])
  .then(server => {
  console.log('Servidor ligado: ', server.aplicacao.address());
}).catch(error => {
  console.log('Servidor falhou ao iniciar', error);
  process.exit(1);
})
