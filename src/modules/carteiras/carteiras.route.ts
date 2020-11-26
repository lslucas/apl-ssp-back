import * as restify from '../../../node_modules/restify'
import { ModeloRoteador } from '../../common/modelo.roteador'
import { NotFoundError } from '../../../node_modules/restify-errors'
import { Carteiras, CarteirasDocument } from './carteiras.model'

class CarteirasRoute extends ModeloRoteador<typeof Carteiras> {
  constructor() {
    super(Carteiras)
  }

  envelopar(documento) {
    let documentoOriginal = super.envelopar(documento)
    documentoOriginal._links.menu = `${this.basePath}/${documentoOriginal._id}/items`
    return documentoOriginal
  }

  findMenu = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    Carteiras.findById(request.params.id, "+menu")
      .then(carteira => {
        if (!carteira) {
          throw new NotFoundError('Ativo não encontrado')
        } else {
          response.json(carteira.menu)
        }
      }).catch(next)
  }

  replaceMenu = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    Carteiras.findById(request.params.id)
      .then(carteira => {
        if(!carteira) {
          throw new NotFoundError('Ativo não encontrado')
        } else {
          carteira.recomendacoes = request.body // provavel um ARRAY de MenuItem
          return carteira.save()
        }
      }).then(carteira => {
        response.json(carteira.recomendacoes)
        return next()
      }).catch(next)
  }

  aplicacaoRotas(aplicacao: restify.Server) {
    aplicacao.get('/carteiras', this.findAll)
    aplicacao.post('/carteiras', this.save)
    aplicacao.get('/carteiras/:id', [this.validaID, this.findById])
    aplicacao.put('/carteiras/:id', [this.validaID, this.replaceAll])
    aplicacao.patch('/carteiras/:id', [this.validaID, this.update])
    aplicacao.del('/carteiras/:id', [this.validaID, this.delete])
  
    aplicacao.get('/carteiras/:id/recomendacoes', [this.validaID, this.findMenu])
    aplicacao.put('/carteiras/:id/recomendacoes', [this.validaID, this.replaceMenu])
  }
}

export const carteirasRoute = new CarteirasRoute();