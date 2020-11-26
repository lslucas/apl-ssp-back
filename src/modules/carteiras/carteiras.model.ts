import * as mongoose from '../../../node_modules/mongoose'

export interface RecomendacaoPorCasa extends mongoose.Document {
  nome: string,
  porcentagemParticipacao: number,
  DYesperado: number,
  precoTeto: number,
  inicio: Date,
}

export interface CarteirasDocument extends mongoose.Document {
  ativo: string,
  setor: string,
  recomendacoes: RecomendacaoPorCasa[],
  createdAt: Date,
  updatedAt: Date,
}

const recomendacoesPorCasaSchema = new mongoose.Schema({
  nome: {
    required: true,
    type: String,
  },
  porcentagemParticipacao: {
    required: true,
    type: Number,
    min: 0,
  },
  DYesperado: {
    required: false,
    type: Number,
  },
  precoTeto: {
    required: false,
    type: Number,
  },
  inicio: {
    required: false,
    type: Date,
  }
})

const carteirasSchema = new mongoose.Schema({
  ativo: {
    required: true,
    type: String,
  },
  setor: {
    required: false,
    type: String
  },
  recomendacaoPorCasa: {
    required: true,
    type: [recomendacoesPorCasaSchema],
    default: [],
  }
})

export const Carteiras = mongoose.model<CarteirasDocument>('Carteiras', carteirasSchema, 'Carteiras');
