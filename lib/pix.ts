// Helper para geração de QR Code Pix P2P Direto & Controle de Reserva Hold (Kurió City Tour)

export interface PixPayloadParams {
  chavePix: string
  nomeRecebedor: string
  cidadeRecebedor: string
  valor: number
  txid?: string
  descricao?: string
}

/**
 * Gera a string no padrão EMV BR Code Pix para pagamentos diretos sem intermediários.
 */
export function gerarPayloadPixStatico({
  chavePix,
  nomeRecebedor,
  cidadeRecebedor,
  valor,
  txid = 'KURIOCITYTOUR',
}: PixPayloadParams): string {
  // Higienizar valores
  const chave = chavePix.trim()
  const nome = nomeRecebedor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 25)
  const cidade = cidadeRecebedor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 15)
  const valorFormatted = valor.toFixed(2)

  // Montagem simplificada do BR Code Pix EMV
  const payloadFormat = '000201'
  const merchantAccount = `26580014br.gov.bcb.pix01${chave.length.toString().padStart(2, '0')}${chave}`
  const merchantCategory = '52040000'
  const transactionCurrency = '5303986'
  const transactionAmount = `54${valorFormatted.length.toString().padStart(2, '0')}${valorFormatted}`
  const countryCode = '5802BR'
  const merchantName = `59${nome.length.toString().padStart(2, '0')}${nome}`
  const merchantCity = `60${cidade.length.toString().padStart(2, '0')}${cidade}`
  const additionalData = `62${(4 + txid.length).toString().padStart(2, '0')}05${txid.length.toString().padStart(2, '0')}${txid}`

  const rawPayload = `${payloadFormat}${merchantAccount}${merchantCategory}${transactionCurrency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalData}6304`

  // Cálculo CRC16
  const crc = calcularCRC16(rawPayload)
  return `${rawPayload}${crc}`
}

function calcularCRC16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Calcula o saldo disponível considerando reservas de Hold ativas
 */
export function calcularSaldoDisponivel(
  metaTotal: number,
  valorArrecadadoConfirmado: number,
  reservasAtivasValor: number
): number {
  const disponivel = metaTotal - (valorArrecadadoConfirmado + reservasAtivasValor)
  return Math.max(0, disponivel)
}
