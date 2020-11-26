export const validaCPF = (documentoCPF: string): boolean => {

  let resto
  let soma = 0

  if(documentoCPF == undefined || documentoCPF.trim().length === 0 || documentoCPF === '00000000000') {
    return false
  }

  documentoCPF = documentoCPF.replace('.', '').replace('.', '').replace('-', '')

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(documentoCPF.substring(i - 1, i)) * (11 - i)
  }
  resto = (soma * 10) % 11

  if ((resto === 10) || (resto === 11)) {
    resto = 0
  }

  if (resto !== parseInt(documentoCPF.substring(9, 10))) {
    return false
  }

  soma = 0

  for (let i = 1; i <= 10; i++) {
    soma += parseInt(documentoCPF.substring(i-1, i)) * (12 - i)
  }

  resto = (soma * 10) % 11

  if ((resto === 10) || (resto === 11))  {
    resto = 0
  }

  if (resto !== parseInt(documentoCPF.substring(10, 11))) {
    return false
  }

  return true
}