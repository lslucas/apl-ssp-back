import * as mongoose from 'mongoose'
import * as restify from 'restify'
import { NotFoundError } from 'restify-errors'
import { Roteador } from './rota'

export abstract class ModeloRoteador<Generico extends mongoose.Document> extends Roteador {

  basePath: string
  quantidadeDocumentosPagina: number = 3

  constructor(protected modelo: mongoose.Model<Generico>) {
    super()
    this.basePath = `/${modelo.collection.name}`
  }

  protected prepareOne(query: mongoose.DocumentQuery<Generico, Generico>): mongoose.DocumentQuery<Generico, Generico> {
    return query
  }

  envelopar(documento: any): any {

    let recurso = Object.assign({
      _links: {}
    }, documento.toJSON())

    recurso._links.self = `${this.basePath}/${recurso._id}`

    return recurso
  }

  enveloparTudo(documentos: any[], opcoes: any = {}): any {

    const recurso: any = {
      _links: {
        self: `${opcoes.url}`
      },
      data: documentos
    }

    if (opcoes.pagina && opcoes.count && opcoes.quantidadeDocumentosPagina) {
      if (opcoes.pagina > 1) {
        recurso._links.paginaAnterior = `${this.basePath}?_pagina=${opcoes.pagina - 1}`
      }

      const quantidaDocumentosRestantes = opcoes.count - (opcoes.pagina * opcoes.quantidadeDocumentosPagina)
      if (quantidaDocumentosRestantes > 0) {
        recurso._links.proximaPagina = `${this.basePath}?_pagina=${opcoes.pagina + 1}`
      }

      recurso._links.primeiraPagina = `${this.basePath}?_pagina=${1}`

      const ultimaPagina = Math.ceil(opcoes.count / this.quantidadeDocumentosPagina)
      recurso._links.ultimaPagina = `${this.basePath}?_pagina=${ultimaPagina}`
    }

    return recurso
  }

  validaID = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
      next(new NotFoundError('Documento não encontrado'))
    }
    next()
  }

  findAll = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    let pagina = parseInt(request.query._pagina || 1)
    pagina = pagina > 0
      ? pagina
      : 1

    const pularParaPagina = (pagina - 1) * this.quantidadeDocumentosPagina

    this.modelo
      .countDocuments({})
      .exec()
      .then(contador => {
        this.modelo.find()
          .skip(pularParaPagina)      //
          .limit(this.quantidadeDocumentosPagina)  // define a quantidade de objetos retornados, usado para paginação
          .then(this.transmitirTudo(response, next, { // opcoes
            pagina: pagina,
            count: contador,
            quantidadeDocumentosPagina: this.quantidadeDocumentosPagina,
            url: request.url
          }))
      }).catch(next)
  }

  // findById = (request: restify.Request, response: restify.Response, next: restify.Next) => {
  //   this.modelo.findById(request.params.id)
  //     .then(this.transmitir(response, next))
  //     .catch(next)
  // }

  findById = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    this.prepareOne(this.modelo.findById(request.params.id))
      .then(this.transmitir(response, next))
      .catch(next)
  }

  save = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    let documento = new this.modelo(request.body)
    documento.save()
      .then(this.transmitir(response, next))
      .catch(next)
  }

  replaceAll = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    const options = { runValidators: true, overwrite: true }
    this.modelo.update({ _id: request.params.id }, request.body, options)
      .exec()
      .then(resultado => {
        if (resultado.n) {
          return this.modelo.findById(request.params.id)
        } else {
          throw new NotFoundError('Documento não encontrado')
        }
      })
      .then(this.transmitir(response, next))
      .catch(next)
  }

  update = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    // propriedade 'new' em 'options' serve para retornar o objeto modificado pelo método e não o que está no momento no banco de dados antes da atualização
    const options = { new: true, runValidators: true , /* overwrite: true */}
    this.modelo.findByIdAndUpdate(request.params.id, request.body, options)
      .then(this.transmitir(response, next))
      .catch(next)
  }

  delete = (request: restify.Request, response: restify.Response, next: restify.Next) => {
    this.modelo.remove({ _id: request.params.i })
      .exec()
      .then((resultadoComando: any) => {
        if (resultadoComando.result.n) {
          response.send(204)
        } else {
          throw new NotFoundError('Documento não encontrado')
        }
        return next()
      }).catch(next)
  }

}