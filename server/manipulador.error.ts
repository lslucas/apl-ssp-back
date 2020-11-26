import * as restify from '../node_modules/restify'

export const manipuladorError = (request: restify.Request, response: restify.Response, error, done) => {

  Object.defineProperty(error, 'toJSON', {
    value() {
      const alt = {}

      Object.getOwnPropertyNames(this).forEach(function (key) {
        alt[key] = this[key]
      }, this)
      return alt
    },
    configurable: true,
    writable: true
  })

  error.toJSON = () => {
    return { 
      message: error.message
    }
  }

  switch(error.name) {
    case 'MongoError':
      if(error.code === 11000) {
        error.statusCode = 400
        error.message = `Chave com valor duplicado: ${JSON.stringify(error.keyValue)}`
      }
      break
    case 'ValidationError':
      error.statusCode = 400
      break
  }
  
  done()
}
