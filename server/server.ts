import * as restify from '../node_modules/restify';
import * as mongoose from '../node_modules/mongoose'

import { ambiente } from '../src/common/ambiente'
import { Roteador } from '../src/common/rota'
import { mergePatchBodyParser } from './merge-patch.parser'
import { manipuladorError } from './manipulador.error'

export class Server {

  aplicacao: restify.Server

  iniciarBancoDados() {
    (<any>mongoose).Promise = global.Promise
    return mongoose.connect(ambiente.database.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
  }

  initRoutes(roteadores: Roteador[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {

        const aplicacao = ambiente.server.nomeAplicacao
        const port = ambiente.server.port

        this.aplicacao = restify.createServer({
          name: `Servidor ${aplicacao}.`,
          version: '1.0.0'
        });

        this.aplicacao.use(restify.plugins.queryParser());
        this.aplicacao.use(restify.plugins.bodyParser());
        this.aplicacao.use(mergePatchBodyParser);

        // rotas
        for (let roteador of roteadores) {
          roteador.aplicacaoRotas(this.aplicacao)
        }

        this.aplicacao.listen(port, () => {
          resolve(this.aplicacao)
        })

        this.aplicacao.on('restifyError', manipuladorError);
      } catch (error) {
        reject(error);
      }
    })
  }

  bootstrap(roteadores: Roteador[] = []): Promise<Server> {
    return this.iniciarBancoDados().then(() =>
      this.initRoutes(roteadores).then(() => this))
  }

  shutdown() {
    return mongoose.disconnect().then(() => {
      this.aplicacao.close()
    })
  }
}