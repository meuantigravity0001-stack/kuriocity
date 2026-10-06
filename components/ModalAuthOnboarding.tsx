'use client'

import { useState } from 'react'
import { User, UserRole } from '@/lib/types'
import { saveUserSession, getCurrentUser, canDisableRoleMode, logoutUser, DEMO_USERS, switchDemoUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
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
  Users,
  PlusCircle,
  UserPlus,
} from 'lucide-react'

interface ModalAuthOnboardingProps {
  onClose: () => void
  onSuccess: (updatedUser: User) => void
}

type TabMode = 'perfis_demo' | 'novo_usuario' | 'gerenciar_perfis' | 'sucesso'

export default function ModalAuthOnboarding({ onClose, onSuccess }: ModalAuthOnboardingProps) {
  const [currentUser, setCurrentUser] = useState<User>(() => getCurrentUser())
  
  // Tab inicial: se for visitante ou novo, abre na escolha de perfis demo ou novo cadastro
  const [tab, setTab] = useState<TabMode>(
    currentUser.id === 'guest-user' ? 'perfis_demo' : 'gerenciar_perfis'
  )

  // Form Novo/Editar Usuário
  const [nome, setNome] = useState(currentUser.nome && currentUser.id !== 'guest-user' ? currentUser.nome : '')
  const [email, setEmail] = useState(currentUser.email || '')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState(currentUser.telefone || '')
  const [endereco, setEndereco] = useState(currentUser.endereco || '')
  const [chavePixPessoal, setChavePixPessoal] = useState(currentUser.chavePixPessoal || '')

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
  const [erroAuth, setErroAuth] = useState<string | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(false)
  // Modo do painel de acesso: login (já tem conta) ou cadastro (novo)
  const [authModo, setAuthModo] = useState<'login' | 'cadastro'>('cadastro')

  const handleLogoff = async () => {
    await supabase.auth.signOut()
    const guestUser = logoutUser()
    setCurrentUser(guestUser)
    setSucessoMensagem('👋 Logoff realizado com sucesso. Você está como Visitante.')
    setTab('sucesso')
    setTimeout(() => {
      onSuccess(guestUser)
      onClose()
    }, 1200)
  }

  const handleSelectDemoUser = (key: string) => {
    const updated = switchDemoUser(key)
    setCurrentUser(updated)
    setSucessoMensagem(`✅ Entrou como "${updated.nome}"!`)
    setTab('sucesso')
    setTimeout(() => {
      onSuccess(updated)
      onClose()
    }, 1200)
  }

  // Login com Google OAuth
  const handleGoogleLogin = async () => {
    setLoadingAuth(true)
    setErroAuth(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setErroAuth('Erro ao conectar com o Google. Tente novamente.')
      setLoadingAuth(false)
    }
    // Se sucesso, o Supabase redireciona — não precisa fazer nada aqui
  }

  // Login com e-mail e senha (usuário já cadastrado)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !senha) { setErroAuth('Preencha e-mail e senha.'); return }
    setLoadingAuth(true)
    setErroAuth(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErroAuth('E-mail ou senha incorretos. Verifique e tente novamente.')
      setLoadingAuth(false)
      return
    }
    const meta = data.user?.user_metadata || {}
    const updated: User = {
      ...currentUser,
      id: data.user!.id,
      nome: meta.nome || data.user!.email?.split('@')[0] || 'Usuário',
      email: data.user!.email!,
      telefone: meta.telefone || '',
      endereco: meta.endereco || '',
      chavePixPessoal: meta.chavePixPessoal || '',
      role: 'CIDADAO',
      modoPrestadorAtivo: false,
      modoComercianteAtivo: false,
    }
    const saved = saveUserSession(updated)
    setCurrentUser(saved)
    setLoadingAuth(false)
    setSucessoMensagem(`✅ Bem-vindo(a) de volta, ${updated.nome}!`)
    setTab('sucesso')
    setTimeout(() => { onSuccess(saved); onClose() }, 1400)
  }

  // Salvar Novo/Editar Cadastro de Morador — agora conectado ao Supabase Auth
  const handleSalvarMorador = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !senha) {
      setErroAuth('E-mail e senha são obrigatórios.')
      return
    }
    if (senha.length < 6) {
      setErroAuth('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoadingAuth(true)
    setErroAuth(null)

    const perfilMetadata = {
      nome: nome || 'Cidadão Kurió',
      telefone: telefone || '',
      endereco: endereco || '',
      chavePixPessoal: chavePixPessoal || '',
    }

    // Tenta CADASTRO primeiro; se e-mail já existe, tenta LOGIN
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: perfilMetadata },
    })

    let authUserId: string | undefined
    let authEmail: string | undefined

    if (signUpError) {
      // E-mail já cadastrado → tenta login
      if (
        signUpError.message?.toLowerCase().includes('already registered') ||
        signUpError.message?.toLowerCase().includes('email already') ||
        signUpError.status === 400
      ) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        })
        if (signInError) {
          setErroAuth('E-mail já cadastrado. Senha incorreta. Tente novamente.')
          setLoadingAuth(false)
          return
        }
        authUserId = signInData.user?.id
        authEmail = signInData.user?.email
        // Atualiza metadados com dados mais recentes
        await supabase.auth.updateUser({ data: perfilMetadata })
      } else {
        setErroAuth(signUpError.message || 'Erro ao criar conta. Tente novamente.')
        setLoadingAuth(false)
        return
      }
    } else {
      authUserId = signUpData.user?.id
      authEmail = signUpData.user?.email
    }

    const updated: User = {
      ...currentUser,
      id: authUserId || `user-custom-${Date.now()}`,
      nome: perfilMetadata.nome,
      email: authEmail || email,
      telefone: perfilMetadata.telefone,
      endereco: perfilMetadata.endereco,
      chavePixPessoal: perfilMetadata.chavePixPessoal,
      role: 'CIDADAO',
      modoPrestadorAtivo: false,
      modoComercianteAtivo: false,
    }

    const saved = saveUserSession(updated)
    setCurrentUser(saved)
    setLoadingAuth(false)
    setSucessoMensagem('✅ Conta criada com sucesso! Bem-vindo(a) ao Kurió City Tour.')
    setTab('sucesso')
    setTimeout(() => {
      onSuccess(saved)
      onClose()
    }, 1400)
  }

  // Toggle do Modo Prestador com Trava de Segurança
  const handleTogglePrestador = (novoStatus: boolean) => {
    setAlertaBloqueio(null)
    if (!novoStatus) {
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
      nome: nome || currentUser.nome || 'Morador Kurió',
      email: email || currentUser.email || 'cidadao@kuriocitytour.org.br',
      telefone: telefone || currentUser.telefone || '',
      endereco: endereco || currentUser.endereco || '',
      chavePixPessoal: chavePixPessoal || currentUser.chavePixPessoal || '',
      modoPrestadorAtivo,
      modoComercianteAtivo,
      role: rolePrincipalEmUso,
    }

    if (modoPrestadorAtivo) {
      updated = {
        ...updated,
        especialidade: especialidade || currentUser.especialidade || 'Pedreiro & Manutenção Geral',
        chavePixPrestador: chavePixPrestador || currentUser.chavePixPrestador || chavePixPessoal || '11987654321',
        avaliacaoMedia: updated.avaliacaoMedia || 5.0,
        obrasConcluidas: updated.obrasConcluidas || 8,
      }
    }

    if (modoComercianteAtivo) {
      updated = {
        ...updated,
        nomeLoja: nomeLoja || currentUser.nomeLoja || 'Depósito Central de Materiais',
        cnpj: cnpj || currentUser.cnpj || '12.345.678/0001-90',
        chavePixLoja: chavePixLoja || currentUser.chavePixLoja || '12.345.678/0001-90',
      }
    }

    const saved = saveUserSession(updated)
    setSucessoMensagem('✅ Modo de Atuação alterado com sucesso!')
    setTab('sucesso')

    setTimeout(() => {
      onSuccess(saved)
      onClose()
    }, 1200)
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
              <h3 className="text-slate-900 font-extrabold text-base leading-snug">Portal de Autenticação & Perfis</h3>
              <p className="text-slate-500 text-xs font-semibold">Kurió City Tour — Selecione ou crie seu perfil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setTab('perfis_demo')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'perfis_demo' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Perfis Demo</span>
          </button>

          <button
            onClick={() => setTab('novo_usuario')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'novo_usuario' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={14} />
            <span>Criar / Login Custom</span>
          </button>

          <button
            onClick={() => setTab('gerenciar_perfis')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'gerenciar_perfis' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders size={14} />
            <span>Modos de Atuação</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* TAB 1: PERFIS DEMO RÁPIDOS */}
          {tab === 'perfis_demo' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-900">Alternância Rápida de Usuários Demo</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Escolha um perfil pré-configurado para testar a plataforma como Morador, Loja de Materiais ou Prestador de Serviço.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Lucas Silva */}
                <button
                  onClick={() => handleSelectDemoUser('lucas')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    currentUser.id === 'user-demo-lucas'
                      ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={DEMO_USERS.lucas.avatarUrl}
                      alt="Lucas"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm text-slate-900">Lucas Silva</h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                          Morador / Cidadão
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Mapeia pontos no bairro e realiza doações Pix P2P.</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>

                {/* 2. Depósito São José */}
                <button
                  onClick={() => handleSelectDemoUser('deposito')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    currentUser.id === 'user-demo-deposito'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={DEMO_USERS.deposito.avatarUrl}
                      alt="Depósito"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm text-slate-900">Depósito São José</h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Loja Parceira
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Fornece insumos de construção com cotações comunitárias.</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>

                {/* 3. Seu Raimundo */}
                <button
                  onClick={() => handleSelectDemoUser('raimundo')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    currentUser.id === 'user-demo-raimundo'
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={DEMO_USERS.raimundo.avatarUrl}
                      alt="Seu Raimundo"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm text-slate-900">Seu Raimundo Mestre</h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                          Prestador de Serviço
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Pedreiro Mestre responsável pela execução das obras.</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>

              {currentUser.id !== 'guest-user' && (
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
              )}
            </div>
          )}

          {/* TAB 2: ENTRAR / CRIAR CONTA */}
          {tab === 'novo_usuario' && (
            <div className="space-y-4">

              {/* Botão Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loadingAuth}
                className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continuar com Google
              </button>

              {/* Divisor */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-semibold">ou acesse com e-mail</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Toggle Login / Cadastro */}
              <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { setAuthModo('login'); setErroAuth(null) }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    authModo === 'login'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🔑 Já tenho conta — Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthModo('cadastro'); setErroAuth(null) }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    authModo === 'cadastro'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ✨ Criar nova conta
                </button>
              </div>

              {/* FORMULÁRIO LOGIN */}
              {authModo === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email" required value={email}
                      onChange={(e) => { setEmail(e.target.value); setErroAuth(null) }}
                      placeholder="maria@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="password" required value={senha}
                        onChange={(e) => { setSenha(e.target.value); setErroAuth(null) }}
                        placeholder="Sua senha"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  {erroAuth && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />{erroAuth}
                    </div>
                  )}
                  <button type="submit" disabled={loadingAuth}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {loadingAuth
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Entrando...</span></>
                      : <><span>Entrar na minha conta</span><ArrowRight size={16} /></>
                    }
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Não tem conta? <button type="button" onClick={() => setAuthModo('cadastro')} className="text-blue-600 font-bold hover:underline">Criar agora →</button>
                  </p>
                </form>
              )}

              {/* FORMULÁRIO CADASTRO */}
              {authModo === 'cadastro' && (
                <form onSubmit={handleSalvarMorador} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome Completo</label>
                    <div className="relative">
                      <UserIcon size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input type="text" required value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Maria Fernandes"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                      <input type="email" required value={email}
                        onChange={(e) => { setEmail(e.target.value); setErroAuth(null) }}
                        placeholder="maria@email.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input type="text" value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="(11) 91234-5678"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Senha de Acesso</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input type="password" required value={senha}
                        onChange={(e) => { setSenha(e.target.value); setErroAuth(null) }}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Endereço no Bairro / Cidade</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input type="text" value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Ex: Rua São Paulo, 350 - Bairro Verde"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chave Pix Pessoal (Para Reembolsos/IPTU)</label>
                    <div className="relative">
                      <QrCode size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input type="text" value={chavePixPessoal}
                        onChange={(e) => setChavePixPessoal(e.target.value)}
                        placeholder="CPF, E-mail ou Telefone"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  {erroAuth && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />{erroAuth}
                    </div>
                  )}
                  <button type="submit" disabled={loadingAuth}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {loadingAuth
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Criando conta...</span></>
                      : <><span>Criar minha conta</span><ArrowRight size={16} /></>
                    }
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Já tem conta? <button type="button" onClick={() => setAuthModo('login')} className="text-blue-600 font-bold hover:underline">← Entrar</button>
                  </p>
                </form>
              )}

            </div>
          )}

          {/* TAB 3: GERENCIAR PERFIS & EVOLUÇÃO (TOGGLES ON/OFF) */}
          {tab === 'gerenciar_perfis' && (

            <div className="space-y-5">
              <div className="pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Usuário Atual</span>
                <h4 className="text-base font-black text-slate-900">{currentUser.nome} ({currentUser.email || 'Sem e-mail'})</h4>
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

          {/* SUCESSO */}
          {tab === 'sucesso' && (
            <div className="text-center py-8 space-y-4 animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-md">
                ✓
              </div>
              <h4 className="text-xl font-black text-slate-900">Sessão Atualizada!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">{sucessoMensagem || 'Sua sessão foi atualizada com sucesso.'}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

