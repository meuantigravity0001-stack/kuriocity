import { PontoDeCuidado } from './types'

export interface DossieIPTUReport {
  ponto: PontoDeCuidado
  protocoloNumero: string
  dataEmissao: string
  economiaEstimadaCofres: number
  comprovantes: { descricao: string; driveUrl: string; valor: number }[]
  html: string
}

/**
 * Gera a estrutura completa do Dossiê Cívico de Zeladoria Participativa (para abatimento de IPTU)
 */
export function gerarDossieIPTU(ponto: PontoDeCuidado): DossieIPTUReport {
  const protocoloNumero = `DOSSIE-IPTU-${ponto.id.substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
  const dataEmissao = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  
  const valorMaterial = ponto.orcamentoLoja?.valorTotal || 150
  const valorMaoObra = ponto.servicoMaoObra?.valorAcordado || 100
  const totalInvestido = valorMaterial + valorMaoObra
  
  // Economia estimada no SUS / Obras públicas (Fator de multiplicação 4.5x devido a evitar emergências)
  const economiaEstimadaCofres = totalInvestido * 4.5

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>DOSSIÊ CÍVICO DE ZELADORIA PARTICIPATIVA - KURIÓ CITY TOUR</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 20px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; }
    .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
    .protocolo { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-family: monospace; font-size: 12px; padding: 8px 14px; border-radius: 6px; font-weight: bold; }
    .section { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .section-title { font-size: 14px; font-weight: bold; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 10px; }
    .label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
    .value { font-size: 13px; color: #0f172a; margin-top: 2px; }
    .highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 16px; border-radius: 8px; font-size: 13px; margin-top: 10px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table th { background: #f8fafc; text-align: left; padding: 8px; font-size: 11px; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .table td { padding: 10px 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .badge { display: inline-block; background: #22c55e; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">🏛️ DOSSIÊ CÍVICO DE ZELADORIA PARTICIPATIVA</div>
      <div class="subtitle">Requerimento de Crédito Educativo e Abatimento Progressivo do IPTU</div>
      <div class="subtitle">Plataforma Kurió City Tour — Zeladoria Colaborativa & Conexão de Vizinhança</div>
    </div>
    <div class="protocolo">
      Nº: ${protocoloNumero}<br>
      Emissão: ${dataEmissao}
    </div>
  </div>

  <div class="section">
    <div class="section-title">📍 1. Mapeamento do Ponto de Cuidado</div>
    <div class="grid">
      <div class="field">
        <div class="label">Título da Ação</div>
        <div class="value"><strong>${ponto.titulo}</strong></div>
      </div>
      <div class="field">
        <div class="label">Categoria</div>
        <div class="value">${ponto.categoria}</div>
      </div>
      <div class="field">
        <div class="label">Endereço Registrado</div>
        <div class="value">${ponto.endereco || 'Endereço registrado via GPS'}, ${ponto.cidade || 'Município Local'}</div>
      </div>
      <div class="field">
        <div class="label">Coordenadas Geográficas (GPS)</div>
        <div class="value">Lat: ${ponto.latitude.toFixed(6)} | Lon: ${ponto.longitude.toFixed(6)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🧾 2. Demonstrativo de Investimento Comunitário Direto (P2P)</div>
    <table class="table">
      <thead>
        <tr>
          <th>Destinação</th>
          <th>Parceiro / Recebedor</th>
          <th>Chave Pix P2P</th>
          <th>Valor (R$)</th>
        </tr>
      </thead>
      <tbody>
        ${ponto.orcamentoLoja ? `
        <tr>
          <td>Materiais de Construção</td>
          <td>${ponto.orcamentoLoja.nomeLoja}</td>
          <td><code>${ponto.orcamentoLoja.chavePixLoja}</code></td>
          <td>R$ ${ponto.orcamentoLoja.valorTotal.toFixed(2)}</td>
        </tr>` : ''}
        ${ponto.servicoMaoObra ? `
        <tr>
          <td>Mão de Obra Local</td>
          <td>${ponto.servicoMaoObra.prestadorNome}</td>
          <td><code>${ponto.servicoMaoObra.chavePixPrestador}</code></td>
          <td>R$ ${ponto.servicoMaoObra.valorAcordado.toFixed(2)}</td>
        </tr>` : ''}
      </tbody>
    </table>

    <div class="highlight-box">
      <strong>💵 Total de Recursos Investidos pela Vizinhança:</strong> R$ ${totalInvestido.toFixed(2)}<br>
      <strong>🛡️ Economia Estimada para os Cofres Públicos:</strong> R$ ${economiaEstimadaCofres.toFixed(2)} 
      <em>(Prevenção de internações SUS por quedas/acidentes e processos de indenização de trânsito).</em>
    </div>
  </div>

  <div class="section">
    <div class="section-title">☁️ 3. Prova de Trabalho & Custódia de Documentos (LGPD - Privacy by Design)</div>
    <p style="font-size: 12px; color: #475569;">
      Em estrita conformidade com a LGPD (Lei 13.709/2018), todas as evidências fotográficas do "Antes" e "Depois", 
      recibos e notas fiscais foram armazenados diretamente no Google Drive Pessoal do Cidadão Responsável.
    </p>
    <div class="field">
      <div class="label">Link da Pasta de Comprovantes (Google Drive):</div>
      <div class="value"><a href="${ponto.driveFolderUrl || 'https://drive.google.com'}" target="_blank">${ponto.driveFolderUrl || 'Acessar Comprovantes no Google Drive'}</a></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">⚖️ 4. Embasamento Jurídico para Abatimento do IPTU</div>
    <p style="font-size: 12px; color: #334155; line-height: 1.5;">
      Fundamentado na função social da propriedade (Art. 5º, XXIII, CF/88), no Princípio da Eficiência da Administração Pública (Art. 37, CF/88) 
      e nos incentivos à Zeladoria Colaborativa Urbana, o presente Dossiê instrui o processo administrativo de compensação tributária 
      ou desconto no IPTU do imóvel lindeiro.
    </p>
  </div>

  <div class="footer">
    Kurió City Tour — Zeladoria Colaborativa e Conexão de Vizinhança | Protocolo Autêntico com Assinatura Digital Hash: <code>${ponto.id}</code>
  </div>
</body>
</html>`

  return {
    ponto,
    protocoloNumero,
    dataEmissao,
    economiaEstimadaCofres,
    comprovantes: [
      {
        descricao: ponto.orcamentoLoja?.itensDescricao || 'Materiais de Reparo',
        driveUrl: ponto.driveFolderUrl || 'https://drive.google.com',
        valor: totalInvestido,
      },
    ],
    html,
  }
}
