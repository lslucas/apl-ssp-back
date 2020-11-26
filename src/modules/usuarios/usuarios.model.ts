import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'
// import * as generoEnum from  '../comum/enums/genero.enum'
import { validaEmail } from '../comum/validadores/email.validador'
import { generoEnum } from '../comum/enums/genero.enum'
import { validaCPF } from '../comum/validadores/cpf.validador'
import { ambiente } from '../comum/ambiente'

export interface Usuario extends mongoose.Document {
  nome: string,
  email: string,
  password: string,
  genero?: string,
  cpf: string,
}

export interface UsuarioModel extends mongoose.Model<Usuario> {
  findByEmail(email: string): Promise<Usuario>
}

const usuarioSchema = new mongoose.Schema({
  nome: {
    required: true,
    type: String,
    maxlength: 80,
    minlength: 3
  },
  email: {
    required: true,
    unique: true,
    type: String,
    match: validaEmail,
  },
  password: {
    required: true,
    type: String,
    select: false, // não retorna em selects
  },
  genero: {
    required: true,
    type: String,
    enum: generoEnum
  },
  cpf: {
    required: true,
    type: String,
    validate: {
      validator: validaCPF,
      message: '{PATH}: CPF inválido ({VALUE})'
    }
  }
})

usuarioSchema.statics.findByEmail = function(email: string) {
  // return this.findOne({ email: email})
  return this.findOne({ email })
}

const hashPassword = function (object, next) {
  bcrypt.hash(object.password, ambiente.seguranca.nivelSegurancaBcrypt)
    .then(hash => {
      object.password = hash
      next()
    }).catch(next)
}

const saveMiddleware = function (next) {
  const usuario: Usuario = this
  if (!usuario.isModified('password')) {
    next()
  } else {
    hashPassword(usuario, next)
  }
}

const updateMiddlewares = function (next) {
  if(!this.getUpdate().password) {
    next()
  } else {
    hashPassword(this.getUpdate(), next)
  }
}

usuarioSchema.pre('save', saveMiddleware)
usuarioSchema.pre('findOneAndUpdate', updateMiddlewares)
usuarioSchema.pre('update', updateMiddlewares)

export const Usuario = mongoose.model<Usuario, UsuarioModel>('Usuario', usuarioSchema)