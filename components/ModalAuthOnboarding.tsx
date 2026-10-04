'use client'

import { useState } from 'react'
import { User, UserRole } from '@/lib/types'
import { saveUserSession, getCurrentUser, canDisableRoleMode, logoutUser } from '@/lib/auth'
import {
  X,
  Store,
  HardHat,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Building2,
  UserCheck,
  Lock,
  AlertTriangle,
  User as UserIcon,
  Phone,
  MapPin,
  QrCode,
  Sliders,
  LogOut,
} from 'lucide-react'

interface ModalAuthOnboardingProps {
  onClose: () => void
  onSuccess: (updatedUser: User) => void
}

type Step = 'morador_onboarding' | 'gerenciar_perfis' | 'sucesso'

export default function ModalAuthOnboarding({ onClose, onSuccess }: ModalAuthOnboardingProps) {
  const [currentUser, setCurrentUser] = useState<User>(() => getCurrentUser())
  
  // Se o usuário já preencheu os dados de morador, cai direto na gestão de perfis
  const [step, setStep] = useState<Step>(
    currentUser.nome && currentUser.telefone ? 'gerenciar_perfis' : 'morador_onboarding'
  )

  // Form Passo 1: Morador (Obrigatório)
  const [nome, setNome] = useState(currentUser.nome || '')
  const [email, setEmail] = useState(currentUser.email || '')
  const [telefone, setTelefone] = useState(currentUser.telefone || '(11) 98765-4321')
  const [endereco, setEndereco] = useState(currentUser.endereco || 'Rua das Flores, 120 - Bairro Central')
  const [chavePixPessoal, setChavePixPessoal] = useState(currentUser.chavePixPessoal || '11987654321')

  // Form Toggles & Perfis
  const [modoPrestadorAtivo, setModoPrestadorAtivo] = useState(currentUser.modoPrestadorAtivo || false)
  const [modoComercianteAtivo, setModoComercianteAtivo] = useState(currentUser.modoComercianteAtivo || false)

  // Form Comerciante
  const [nomeLoja, setNomeLoja] = useState(currentUser.nomeLoja || '')
  const [cnpj, setCnpj] = useState(currentUser.cnpj || '')
  const [chavePixLoja, setChavePixLoja] = useState(currentUser.chavePixLoja || '')

  // Form Prestador
  const [especialidade, setEspecialidade] = useState(currentUser.especialidade || '')
  const [chavePixPrestador, setChavePixPrestador] = useState(currentUser.chavePixPrestador || '')

  // Alerta de Bloqueio de Desativação
  const [alertaBloqueio, setAlertaBloqueio] = useState<string | null>(null)
  const [sucessoMensagem, setSucessoMensagem] = useState<string | null>(null)

  const handleLogoff = () => {
    const defaultUser = logoutUser()
    setSucessoMensagem('👋 Logoff realizado com sucesso. Sessão encerrada.')
    setStep('sucesso')
    setTimeout(() => {
      onSuccess(defaultUser)
      onClose()
    }, 1200)
  }

  // Passo 1: Salva os dados de Morador
  const handleSalvarMorador = (e: React.FormEvent) => {
    e.preventDefault()
    const updated: User = {
      ...currentUser,
      nome,
      email,
      telefone,
      endereco,
      chavePixPessoal,
      role: 'CIDADAO', // Todo usuário é obrigatoriamente Morador
    }
    saveUserSession(updated)
    setCurrentUser(updated)
    setStep('gerenciar_perfis')
  }

  // Toggle do Modo Prestador com Trava de Segurança
  const handleTogglePrestador = (novoStatus: boolean) => {
    setAlertaBloqueio(null)
    if (!novoStatus) {
      // Tentando desativar o perfil de Prestador
      const check = canDisableRoleMode(currentUser, 'PRESTADOR')
      if (!check.allowed) {
        setAlertaBloqueio(check.reason || 'Não é possível desativar o perfil no momento.')
        return
      }
    }
    setModoPrestadorAtivo(novoStatus)
  }

  // Toggle do Modo Comerciante com Trava de Segurança
  const handleToggleComerciante = (novoStatus: boolean) => {
    setAlertaBloqueio(null)
    if (!novoStatus) {
      // Tentando desativar o perfil de Comerciante
      const check = canDisableRoleMode(currentUser, 'COMERCIANTE')
      if (!check.allowed) {
        setAlertaBloqueio(check.reason || 'Não é possível desativar o perfil no momento.')
        return
      }
    }
    setModoComercianteAtivo(novoStatus)
  }

  // Concluir e Salvar Alterações de Perfil
  const handleSalvarPerfis = (rolePrincipalEmUso: UserRole) => {
    let updated: User = {
      ...currentUser,
      nome,
      email,
      telefone,
      endereco,
      chavePixPessoal,
      modoPrestadorAtivo,
      modoComercianteAtivo,
      role: rolePrincipalEmUso,
    }

    if (modoPrestadorAtivo) {
      updated = {
        ...updated,
        especialidade: especialidade || 'Pedreiro & Manutenção Geral',
        chavePixPrestador: chavePixPrestador || chavePixPessoal || '11987654321',
        avaliacaoMedia: updated.avaliacaoMedia || 5.0,
        obrasConcluidas: updated.obrasConcluidas || 8,
      }
    }

    if (modoComercianteAtivo) {
      updated = {
        ...updated,
        nomeLoja: nomeLoja || 'Depósito Central de Materiais',
        cnpj: cnpj || '12.345.678/0001-90',
        chavePixLoja: chavePixLoja || '12.345.678/0001-90',
      }
    }

    const saved = saveUserSession(updated)
    setSucessoMensagem('✅ Perfil e Modos de Atuação atualizados com sucesso!')
    setStep('sucesso')

    setTimeout(() => {
      onSuccess(saved)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/20">
              🌱
            </div>
            <div>
              <h3 className="text-slate-900 font-extrabold text-base leading-snug">Autenticação & Evolução de Perfil</h3>
              <p className="text-slate-500 text-xs font-semibold">Kuriocity — Cadastro de Morador & Atuação P2P</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* PASSO 1: ONBOARDING MORADOR (OBRIGATÓRIO) */}
          {step === 'morador_onboarding' && (
            <form onSubmit={handleSalvarMorador} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200/90 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-900">Passo Obrigatório: Morador / Cidadão</h4>
                  <p className="text-xs text-blue-700 leading-relaxed mt-0.5">
                    No Kuriocity, todo membro é obrigatoriamente um morador validado. Após confirmar seus dados, você poderá habilitar funções extras de Prestador ou Fornecedor.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo do Morador</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Lucas Silva"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail de Acesso</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lucas@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Telefone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Endereço no Bairro</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Ex: Rua das Flores, 120"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chave Pix Pessoal do Morador (Para Reembolsos/IPTU)</label>
                  <div className="relative">
                    <QrCode size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={chavePixPessoal}
                      onChange={(e) => setChavePixPessoal(e.target.value)}
                      placeholder="CPF, E-mail ou Telefone"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Validar Dados & Continuar</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* PASSO 2: GERENCIAR PERFIS & EVOLUÇÃO (TOGGLES ON/OFF) */}
          {step === 'gerenciar_perfis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Passo 2 de 2</span>
                  <h4 className="text-base font-black text-slate-900">Configuração de Modos de Atuação</h4>
                </div>
                <button
                  onClick={() => setStep('morador_onboarding')}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 underline"
                >
                  Editar dados de morador
                </button>
              </div>

              {/* ALERTA DE BLOQUEIO DE SEGURANÇA */}
              {alertaBloqueio && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-start gap-3 animate-slide-up">
                  <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black uppercase tracking-wider text-red-900">Trava de Segurança de Desativação</h5>
                    <p className="text-xs leading-relaxed">{alertaBloqueio}</p>
                  </div>
                </div>
              )}

              {/* LISTA DE CARDS DE PERFIL COM TOGGLE */}
              <div className="space-y-4">
                
                {/* 1. PERFIL MORADOR (OBRIGATÓRIO - PERMANENTE) */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                      🚶‍♂️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-slate-900 text-sm">Morador / Cidadão</h5>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                          Base Obrigatória
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Mapeia pontos, faz doações P2P e acumula crédito de IPTU.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs shrink-0">
                    <CheckCircle2 size={16} />
                    <span>Ativo</span>
                  </div>
                </div>

                {/* 2. MODO PRESTADOR DE SERVIÇO (TOGGLE ON/OFF) */}
                <div className={`border rounded-2xl p-4 transition-all ${modoPrestadorAtivo ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${modoPrestadorAtivo ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        🛠️
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-sm">Prestador de Serviço (Mestre do Bairro)</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Candidata-se a obras comunitárias e recebe Pix por etapas.</p>
                      </div>
                    </div>

                    {/* SWITCH TOGGLE */}
                    <button
                      type="button"
                      onClick={() => handleTogglePrestador(!modoPrestadorAtivo)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${modoPrestadorAtivo ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${modoPrestadorAtivo ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* FORM EXPANSÍVEL DO PRESTADOR */}
                  {modoPrestadorAtivo && (
                    <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-3 animate-slide-up">
                      <div>
                        <label className="block text-xs font-bold text-amber-900 mb-1">Especialidade Principal</label>
                        <input
                          type="text"
                          value={especialidade}
                          onChange={(e) => setEspecialidade(e.target.value)}
                          placeholder="Ex: Pedreiro, Eletricista, Pintor, Serralheiro"
                          className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-amber-900 mb-1">Chave Pix Direta do Prestador</label>
                        <input
                          type="text"
                          value={chavePixPrestador}
                          onChange={(e) => setChavePixPrestador(e.target.value)}
                          placeholder="Chave Pix para receber os valores por etapa"
                          className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. MODO LOJA PARCEIRA / FORNECEDOR (TOGGLE ON/OFF) */}
                <div className={`border rounded-2xl p-4 transition-all ${modoComercianteAtivo ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${modoComercianteAtivo ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        🏪
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-sm">Loja Parceira / Fornecedor</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Fornece insumos de construção e fatura com Nota Fiscal.</p>
                      </div>
                    </div>

                    {/* SWITCH TOGGLE */}
                    <button
                      type="button"
                      onClick={() => handleToggleComerciante(!modoComercianteAtivo)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${modoComercianteAtivo ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${modoComercianteAtivo ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* FORM EXPANSÍVEL DO COMERCIANTE */}
                  {modoComercianteAtivo && (
                    <div className="mt-4 pt-4 border-t border-emerald-200/80 space-y-3 animate-slide-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-emerald-900 mb-1">Nome da Loja</label>
                          <input
                            type="text"
                            value={nomeLoja}
                            onChange={(e) => setNomeLoja(e.target.value)}
                            placeholder="Depósito São José"
                            className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-emerald-900 mb-1">CNPJ / CPF do Estabelecimento</label>
                          <input
                            type="text"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="12.345.678/0001-90"
                            className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-emerald-900 mb-1">Chave Pix da Loja (Para faturamento de insumos)</label>
                        <input
                          type="text"
                          value={chavePixLoja}
                          onChange={(e) => setChavePixLoja(e.target.value)}
                          placeholder="CNPJ, E-mail ou Telefone da Loja"
                          className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* BOTÕES DE SALVAMENTO DE MODO EM USO */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-500 text-center mb-2">Escolha qual perfil deseja utilizar agora no mapa:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSalvarPerfis('CIDADAO')}
                    className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>🚶‍♂️ Entrar como Morador</span>
                  </button>

                  {modoPrestadorAtivo && (
                    <button
                      onClick={() => handleSalvarPerfis('PRESTADOR')}
                      className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🛠️ Entrar como Prestador</span>
                    </button>
                  )}

                  {modoComercianteAtivo && (
                    <button
                      onClick={() => handleSalvarPerfis('COMERCIANTE')}
                      className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🏪 Entrar como Loja</span>
                    </button>
                  )}
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleLogoff}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} className="text-red-500" />
                    <span>Sair da Conta (Fazer Logoff)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: SUCESSO */}
          {step === 'sucesso' && (
            <div className="text-center py-8 space-y-4 animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-md">
                ✓
              </div>
              <h4 className="text-xl font-black text-slate-900">Sessão Atualizada!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">{sucessoMensagem || 'Seus perfis e chaves Pix foram configurados com sucesso.'}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
