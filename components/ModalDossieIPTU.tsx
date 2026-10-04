'use client'

import { useState } from 'react'
import { PontoDeCuidado } from '@/lib/types'
import { gerarDossieIPTU, DossieIPTUReport } from '@/lib/dossiePdf'
import { FileText, X, Download, Printer, ShieldCheck, CheckCircle } from 'lucide-react'

interface ModalDossieIPTUProps {
  ponto: PontoDeCuidado
  onClose: () => void
}

export default function ModalDossieIPTU({ ponto, onClose }: ModalDossieIPTUProps) {
  const [dossie] = useState<DossieIPTUReport>(() => gerarDossieIPTU(ponto))
  const [baixado, setBaixado] = useState(false)

  const imprimirOuBaixar = () => {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(dossie.html)
      win.document.close()
      win.print()
      setBaixado(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-base">
              📜
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Dossiê Cívico — Abatimento de IPTU</h3>
              <p className="text-gray-400 text-xs">Requerimento de Crédito Educativo e Compensação Tributária</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 space-y-5">
          {/* Protocol Banner */}
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">Protocolo Autêntico de Zeladoria</p>
              <p className="text-white font-mono text-sm font-bold">{dossie.protocoloNumero}</p>
              <p className="text-gray-400 text-xs mt-0.5">Emissão: {dossie.dataEmissao}</p>
            </div>
            <div className="text-right">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold px-3 py-1 rounded-full">
                Documento Oficial PDF
              </span>
            </div>
          </div>

          {/* Resumo do Dossiê */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-gray-800 pb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-purple-400" /> Resumo do Requerimento Tributário
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500">Ponto de Cuidado:</p>
                <p className="text-gray-200 font-bold">{ponto.titulo}</p>
              </div>
              <div>
                <p className="text-gray-500">Endereço:</p>
                <p className="text-gray-200">{ponto.endereco || 'Brasília - DF'}</p>
              </div>
              <div>
                <p className="text-gray-500">Investimento Comunitário Direto:</p>
                <p className="text-green-400 font-bold text-sm">
                  R$ {((ponto.orcamentoLoja?.valorTotal || 180) + (ponto.servicoMaoObra?.valorAcordado || 120)).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Economia Estimada aos Cofres Públicos:</p>
                <p className="text-purple-300 font-bold text-sm">
                  R$ {dossie.economiaEstimadaCofres.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & LGPD Seal */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={16} className="text-green-400 shrink-0" />
            <span>
              Evidências fotográficas e notas fiscais estão vinculadas diretamente via link do Google Drive do usuário (Art. 6º LGPD).
            </span>
          </div>

          {/* Botoes Ação */}
          <div className="flex gap-3">
            <button
              onClick={imprimirOuBaixar}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer size={16} /> Imprimir / Gerar PDF Oficial
            </button>
          </div>

          {baixado && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center text-xs text-green-400 font-bold flex items-center justify-center gap-2">
              <CheckCircle size={14} /> Dossiê gerado com sucesso! Apresente o protocolo na Prefeitura ou Câmara Municipal.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
