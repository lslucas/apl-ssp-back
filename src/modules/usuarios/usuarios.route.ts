import * as restify from '../../../node_modules/restify'
import { ModeloRoteador } from '../../common/modelo.roteador'
import { Usuario } from './usuarios.model'
import { NotFoundError } from '../../../node_modules/restify-errors'

class UsuariosRoteador extends ModeloRoteador<typeof Usuario> {

  constructor() {
    super(Usuario)
    this.on('beforeRender', documento => {
      // delete documento.password  
      documento.password = undefined
    })
  }

  // findByEmail = (request: restify.Request, response: restify.Response, next: restify.Next) => {
  //   if (request.query.email) {
  //     Usuario.find({ email: request.query.email })
  //       .then(this.transmitirTudo(response, next))
  //       .catch(next)
  //   } else next()
  // }

  findByEmail = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    if(request.query.email) {
      Usuario.findByEmail(request.query.email)
        .then(usuario => {
          if(usuario) {
            return [usuario]
          }
          return []
        })
        .then(this.transmitirTudo(response, next, {
          // quantidadeDocumentosPagina: this.quantidadeDocumentosPagina,
          url: request.url,
        }))
        .catch(next)
    } else {
      next()
    }
  }

  save = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    let documento = new this.modelo(request.body)

    if(documento.cpf) {
      documento.cpf = documento.cpf.replace('.', '').replace('.', '').replace('-', '')
    }

    documento.save()
      .then(this.transmitir(response, next))
      .catch(next)
  }

  update = (request: restify.Request, response: restify.Response, next: restify.Next) => {

    if (request.body.cpf) {
      request.body.cpf = request.body.cpf.replace('.', '').replace('.', '').replace('-', '')
    }

    // propriedade 'new' em 'options' serve para retornar o objeto modificado pelo método e não o que está no momento no banco de dados antes da atualização
    const options = { new: true, runValidators: true /*, overwrite: true */ }
    this.modelo.findByIdAndUpdate(request.params.id, request.body, options)
      .then(this.transmitir(response, next))
      .catch(next)
  }

  aplicacaoRotas(aplicacao: restify.Server) {

    // aplicacao.get(`${this.basePath}`, this.findAll)
    // // aplicacao.get('/usuarios', this.findAll)
    aplicacao.get('/usuarios', restify.plugins.conditionalHandler([
      { version: '1.0.0', handler: this.findAll},
      { version: '2.0.0', handler: [this.findByEmail, this.findAll] }
    ]))
    aplicacao.post('/usuarios', this.save)
    aplicacao.get('/usuarios/:id', [this.validaID, this.findById])
    aplicacao.put('/usuarios/:id', [this.validaID, this.replaceAll])
    aplicacao.patch('/usuarios/:id', [this.validaID, this.update])
    aplicacao.del('/usuarios/:id', [this.validaID, this.delete])
  }
}

export const usuariosRoteador = new UsuariosRoteador()