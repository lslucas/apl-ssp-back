import * as restify from 'restify'
import { EventEmitter } from 'events'
import { NotFoundError } from 'restify-errors'

export abstract class Roteador extends EventEmitter {
  abstract aplicacaoRotas(aplicacao: restify.Server)

  envelopar(documento: any): any {
    return documento
  }

  enveloparTudo(documentos: any[], opcoes: any = {}): any {
    return documentos
  }

  transmitir(response: restify.Response, next: restify.Next) {
    return (documento) => {
      if(documento) {
        this.emit('beforeRender', documento)
        response.json(this.envelopar(documento))
      }

      if(!documento) {
        throw new NotFoundError('Documento não encontrado.')
      }

      return next(-' =')
    }
  }

  transmitirTudo(response: restify.Response, next: restify.Next, opcoes: any = {}) {
    return (documentos: any[]) => {
      if (documentos) {
        documentos.forEach((documento, indice, array) => {
          this.emit('beforeRender', documento)
          array[indice] = this.envelopar(documento)
        })
        response.json(this.enveloparTudo(documentos, opcoes))
      } else {
        response.json(this.enveloparTudo([]))
      }

      return next(false)
    }
  }
}