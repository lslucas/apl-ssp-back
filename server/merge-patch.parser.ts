import * as restify from '../node_modules/restify'
import { BadRequestError } from '../node_modules/restify-errors'

const mergePatchContentType = 'application/merge-patch+json'

export const mergePatchBodyParser = (request: restify.Request, response: restify.Response, next) => {
  if(request.getContentType() === mergePatchContentType && request.method === 'PATCH') {
    
    // acesso ao body original
    (<any>request).rawBody = request.body

    try {
      request.body = JSON.parse(request.body)
    } catch(error) {
      return next(new BadRequestError(`Invalid content: ${error.message}`))
    }    
  }
  return next()
}