'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Building2, Mail, MapPin, X, FileText, HeartHandshake } from 'lucide-react'

interface ModalEnviarPrefeituraProps {
  onClose: () => void
}

export default function ModalEnviarPrefeitura({ onClose }: ModalEnviarPrefeituraProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cidade, setCidade] = useState('')
  const [emailPrefeitura, setEmailPrefeitura] = useState('')
  const [mensagemExtra, setMensagemExtra] = useState('')
  
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !cidade) return

    setEnviando(true)
    try {
      // Simular envio de e-mail oficial de apoio cívico via API Resend/Backend
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setEnviado(true)
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Abaixo-Assinado & Proposta Cívica</h3>
              <p className="text-xs text-slate-500">Convide a Prefeitura da sua cidade a adotar o Kurió City Tour</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-5">
          {enviado ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl animate-bounce">
                🎉
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Apoio Cívico Registrado!</h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Sua carta de proposta de valor para o <strong>Kurió City Tour</strong> e implementação do <strong>IPTU Cívico</strong> em <strong>{cidade}</strong> foi registrada e enviada!
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 text-left space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <HeartHandshake size={15} /> Juntos por cidades mais bem cuidadas!
                </p>
                <p className="text-blue-800">
                  Quanto mais moradores da sua cidade enviarem esta proposta, maior será a força para que a Prefeitura e a Câmara de Vereadores aprovem o incentivo fiscal.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                Concluir & Voltar
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnviar} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  💡 Como funciona este envio?
                </p>
                <p className="leading-relaxed text-amber-800">
                  O IPTU Cívico é uma <strong>proposta de lei cívica</strong>. Ao preencher este formulário, enviaremos a apresentação oficial do projeto de zeladoria colaborativa com o seu nome para o gabinete da Prefeitura do seu município.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Andrade"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seu E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sua Cidade & Estado *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Ex: Niterói - RJ, Campinas - SP"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail da Prefeitura / Vereador (Opcional)</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={emailPrefeitura}
                      onChange={(e) => setEmailPrefeitura(e.target.value)}
                      placeholder="gabinete@suacidade.gov.br"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Prévia da Carta Oficial */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <FileText size={12} /> Prévia da Carta Oficial de Apoio
                </p>
                <div className="text-[11px] text-slate-600 leading-relaxed font-mono bg-white p-3 rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                  <p>Excelentíssimo(a) Prefeito(a) e Vereadores de {cidade || '[Sua Cidade]'},</p>
                  <p className="mt-1">
                    Como morador(a) de {cidade || 'nossa cidade'}, venho formalmente apresentar a proposta de adoção do projeto <strong>Kurió City Tour</strong> e a criação do programa de <strong>IPTU Cívico</strong>.
                  </p>
                  <p className="mt-1">
                    Esta iniciativa economiza recursos públicos ao estimular reparos comunitários preventivos em calçadas e iluminação pública com notas fiscais do comércio local e zero taxas para o município.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Enviando Proposta Cívica...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Enviar Apresentação Oficial para a Prefeitura</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
