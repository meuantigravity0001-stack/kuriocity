'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { User, getRoleBadge } from '@/lib/types'
import { getCurrentUser, logoutUser, saveUserSession } from '@/lib/auth'
import ModalAuthOnboarding from '@/components/ModalAuthOnboarding'
import ModalEnviarPrefeitura from '@/components/ModalEnviarPrefeitura'
import KurioLogo from '@/components/KurioLogo'
import {
  MapPin,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  User as UserIcon,
  Footprints,
  Wrench,
  Store,
  FileText,
  Coins,
  ShieldCheck,
  Camera,
  LogOut,
  Building2,
  Send,
  Sparkles,
  TrendingDown,
  Eye,
  HeartHandshake,
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const CONTAINER_INNER = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full'

export default function LandingPage() {
  const [user, setUser]                 = useState<User>(() => getCurrentUser())
  const [modalAuth, setModalAuth]       = useState(false)
  const [modalPrefeitura, setModalPrefeitura] = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [activeId, setActiveId]         = useState('')

  const badge = getRoleBadge(user.role)

  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user
          const meta = u.user_metadata || {}
          const current = getCurrentUser()
          const syncUser: User = {
            ...current,
            id: u.id,
            email: u.email || current.email,
            nome: meta.nome || meta.full_name || u.email?.split('@')[0] || 'Cidadão Kurió',
            avatarUrl: meta.avatar_url || meta.picture || current.avatarUrl,
            telefone: meta.telefone || current.telefone || '',
            endereco: meta.endereco || current.endereco || '',
            chavePixPessoal: meta.chavePixPessoal || current.chavePixPessoal || '',
            role: current.role || 'CIDADAO',
          }
          saveUserSession(syncUser)
          setUser(syncUser)
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user
          const meta = u.user_metadata || {}
          const current = getCurrentUser()
          const syncUser: User = {
            ...current,
            id: u.id,
            email: u.email || current.email,
            nome: meta.nome || meta.full_name || u.email?.split('@')[0] || 'Cidadão Kurió',
            avatarUrl: meta.avatar_url || meta.picture || current.avatarUrl,
            telefone: meta.telefone || current.telefone || '',
            endereco: meta.endereco || current.endereco || '',
            chavePixPessoal: meta.chavePixPessoal || current.chavePixPessoal || '',
            role: current.role || 'CIDADAO',
          }
          saveUserSession(syncUser)
          setUser(syncUser)
        }
      })

      return () => subscription.unsubscribe()
    })
  }, [])

  useEffect(() => {
    const ids = ['proposta-prefeitura', 'como-funciona', 'perfis', 'mobilizacao-cidada']
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
      { rootMargin: '-20% 0px -40% 0px', threshold: 0.1 }
    )
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const nav = [
    { href: '#proposta-prefeitura', label: 'Valores para Prefeituras', id: 'proposta-prefeitura' },
    { href: '#como-funciona',        label: 'Como Funciona',           id: 'como-funciona' },
    { href: '#perfis',               label: 'Os Perfis',               id: 'perfis' },
    { href: '#mobilizacao-cidada',   label: 'Mobilizar Minha Cidade',  id: 'mobilizacao-cidada' },
  ]

  const scroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return
    e.preventDefault()
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(null, '', href)
    setMobileOpen(false)
  }

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50/60 text-slate-900 antialiased selection:bg-blue-100`}>

      {/* ─────────── HEADER ─────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200/80">
        <div className={`${CONTAINER_INNER} h-16 flex items-center justify-between`}>

          <Link href="/" className="hover:opacity-90 transition-opacity shrink-0">
            <KurioLogo className="h-9" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {nav.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => scroll(e, link.href)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeId === link.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setModalAuth(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 transition-all shadow-xs"
            >
              <UserIcon size={14} className="text-blue-600" />
              <span>{user.nome.split(' ')[0]}</span>
            </button>

            <button
              onClick={async () => {
                const { supabase } = await import('@/lib/supabase')
                await supabase.auth.signOut()
                const u = logoutUser()
                setUser(u)
              }}
              title="Fazer Logoff / Sair da Conta"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-all"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Sair</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
            >
              <MapPin size={14} />
              <span>Abrir Mapa</span>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 px-4 pt-3 pb-5 space-y-1 bg-white">
            {nav.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => scroll(e, link.href)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {link.label}
                <ChevronRight size={15} className="text-slate-400" />
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => { setMobileOpen(false); setModalPrefeitura(true) }}
                className="w-full text-center py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>Enviar para Minha Cidade</span>
              </button>
              <Link href="/" className="block text-center w-full py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm">
                Abrir Mapa Interativo
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─────────── MAIN CONTAINER ─────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12 md:space-y-16 py-8">

        {/* ─────────── HERO ─────────── */}
        <section className="py-10 md:py-14 space-y-8 border-b border-slate-200/80">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1 shadow-xs">
              <Sparkles size={13} className="text-emerald-600" />
              Proposta de Valor para Cidades · Projeto de Lei Cívico
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Zeladoria inteligente para o seu bairro.<br />
              <span className="text-blue-600">Uma proposta para a sua Prefeitura.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              O <strong>Kurió City Tour</strong> é um movimento cívico que conecta moradores, depósitos de bairro e pedreiros locais. Convidamos você a mobilizar a Prefeitura do seu município para adotar esta solução e aprovar o <strong>IPTU Cívico</strong>!
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <button
                onClick={() => setModalPrefeitura(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                <Send size={16} />
                <span>Enviar Proposta para Minha Prefeitura</span>
                <ArrowRight size={15} />
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-xs"
              >
                <MapPin size={16} />
                <span>Ver Mapa Demonstrativo</span>
              </Link>
            </div>
          </div>

          {/* Proof bar */}
          <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Economia comprovada nos cofres públicos', icon: <TrendingDown size={16} className="text-emerald-600 shrink-0" /> },
              { label: 'Zero taxas ou custódia para o município',   icon: <ShieldCheck size={16} className="text-blue-600 shrink-0" /> },
              { label: 'Fiscalização visual com fotos e GPS',    icon: <Eye size={16} className="text-amber-600 shrink-0" /> },
              { label: 'Fomento ao comércio e pedreiro local',   icon: <Store size={16} className="text-purple-600 shrink-0" /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-sm text-slate-700 font-medium">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ─────────── PROPOSTA PARA PREFEITURAS ─────────── */}
        <section id="proposta-prefeitura" className="scroll-mt-20 py-10 md:py-14 space-y-8 border-b border-slate-200/80">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Para Gestores Públicos & Vereadores</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Por que a Prefeitura da sua cidade só tem a ganhar?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed pt-1">
              O Kurió City Tour descentraliza a zeladoria urbana, elimina burocracia e economiza dinheiro público de forma transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[
              {
                icon: <TrendingDown size={22} className="text-blue-600" />,
                iconBg: 'bg-blue-50 border-blue-100',
                title: 'Economia em Licitações',
                desc: 'Reparos preventivos feitos pela vizinhança custam até 4.5x menos do que obras emergenciais ou processos de indenização de trânsito.',
              },
              {
                icon: <Eye size={22} className="text-emerald-600" />,
                iconBg: 'bg-emerald-50 border-emerald-100',
                title: 'Fiscalização em Tempo Real',
                desc: 'O mapa fornece auditoria gratuita via GPS e fotos Antes/Depois validadas pela própria comunidade sem custo fiscalizatório de campo.',
              },
              {
                icon: <Store size={22} className="text-purple-600" />,
                iconBg: 'bg-purple-50 border-purple-100',
                title: 'Comércio Local Fortalecido',
                desc: 'Todo o valor investido nas melhorias é direcionado aos depósitos de construção do bairro e profissionais locais cadastrados.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className={`w-12 h-12 rounded-xl border ${card.iconBg} flex items-center justify-center shrink-0`}>
                  {card.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ─────────── COMO FUNCIONA ─────────── */}
        <section id="como-funciona" className="scroll-mt-20 py-10 md:py-14 space-y-8 border-b border-slate-200/80">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Como Funciona o Ciclo Cívico</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Três passos simples de zeladoria.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed pt-1">
              Da foto no celular à comprovação no Google Drive com zero dados fiscais retidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[
              {
                num: '01',
                color: 'blue',
                icon: <MapPin size={22} />,
                title: 'Mapeie ou Apoie',
                desc: 'Identifique um buraco ou calçada no mapa com foto e GPS, ou apoie financeiramente via Pix P2P direto.',
              },
              {
                num: '02',
                color: 'amber',
                icon: <Camera size={22} />,
                title: 'Obra Executada',
                desc: 'O pedreiro local realiza o reparo e comprova em etapas (30% → 40% → 30%) com mídias validadas pelos vizinhos.',
              },
              {
                num: '03',
                color: 'emerald',
                icon: <FileText size={22} />,
                title: 'Dossiê Cívico',
                desc: 'Receba o Dossiê em PDF salvo na sua pasta pessoal do Google Drive para apresentar à Prefeitura no futuro programa de IPTU Cívico.',
              },
            ].map(({ num, color, icon, title, desc }, i) => {
              const palette: Record<string, { icon: string; num: string }> = {
                blue:   { icon: 'bg-blue-50 text-blue-600 border-blue-100',     num: 'text-blue-600'   },
                amber:  { icon: 'bg-amber-50 text-amber-600 border-amber-100',  num: 'text-amber-600'  },
                emerald:{ icon: 'bg-emerald-50 text-emerald-600 border-emerald-100', num: 'text-emerald-600' },
              }
              const s = palette[color]
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full space-y-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl border ${s.icon} flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <span className={`text-4xl font-black opacity-20 ${s.num}`}>{num}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>


        {/* ─────────── OS PERFIS ─────────── */}
        <section id="perfis" className="scroll-mt-20 py-10 md:py-14 space-y-8 border-b border-slate-200/80">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Os Perfis da Comunidade</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Moradores, Lojistas e Prestadores unindo forças.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[
              {
                icon: <Footprints size={22} className="text-blue-600" />,
                iconBg: 'bg-blue-50 border-blue-100',
                tag: 'Perfil essencial',
                title: 'Morador / Cidadão',
                desc: 'Identifica reparos e apoia melhorias no bairro com Pix direto.',
                benefits: ['Mapear problemas de rua', 'Apoiar obras sem intermediários', 'Guardar comprovante no Google Drive'],
              },
              {
                icon: <Wrench size={22} className="text-amber-600" />,
                iconBg: 'bg-amber-50 border-amber-100',
                tag: 'Mão de obra',
                title: 'Prestador de Serviço',
                desc: 'Executa a manutenção da rua e recebe Pix direto conforme etapas aprovadas.',
                benefits: ['Obras no próprio bairro', 'Pix garantido por etapa', 'Portfólio público no mapa'],
              },
              {
                icon: <Store size={22} className="text-emerald-600" />,
                iconBg: 'bg-emerald-50 border-emerald-100',
                tag: 'Fornecedor',
                title: 'Comércio Local',
                desc: 'Fornece materiais de construção com cotação direto no mapa cívico.',
                benefits: ['Mais vendas no bairro', 'Nota fiscal no Dossiê Cívico', 'Selo de Loja Parceira'],
              },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full space-y-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl border ${card.iconBg} flex items-center justify-center shrink-0`}>
                      {card.icon}
                    </div>
                    <span className="text-[11px] font-bold border px-2 py-0.5 rounded-md text-slate-600 bg-slate-50">
                      {card.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>

                  <ul className="space-y-2 pt-2">
                    {card.benefits.map((b, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ─────────── MOBILIZAÇÃO CIDADÃ & IPTU CÍVICO ─────────── */}
        <section id="mobilizacao-cidada" className="scroll-mt-20 py-10 md:py-14 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 text-white space-y-8 shadow-xl">
            
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 size={14} /> Envie este projeto para o Prefeito da sua Cidade
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Quer ver o IPTU Cívico aprovado no seu município?
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed pt-1">
                O desconto no IPTU é uma <strong>proposta de incentivo cívico</strong> que desejamos levar às câmaras municipais de todo o Brasil. Ajude-nos a apresentar esta ideia à Prefeitura do seu município!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => setModalPrefeitura(true)}
                className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <Send size={16} />
                <span>Enviar Apresentação Oficial para Minha Prefeitura</span>
              </button>

              <Link
                href="/"
                className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <MapPin size={16} />
                <span>Explorar Mapa do Bairro</span>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="py-10 bg-white border-t border-slate-200/80 mt-12">
        <div className={`${CONTAINER_INNER} flex flex-col sm:flex-row items-center justify-between gap-5`}>
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <KurioLogo className="h-9" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 font-semibold">
            <Link href="/" className="hover:text-slate-900 transition-colors">Mapa do Bairro</Link>
            {nav.map((link) => (
              <a key={link.id} href={link.href} onClick={(e) => scroll(e, link.href)} className="hover:text-slate-900 transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
          >
            <MapPin size={14} />
            <span>Abrir Mapa</span>
          </Link>
        </div>
      </footer>

      {modalAuth && <ModalAuthOnboarding onClose={() => setModalAuth(false)} onSuccess={(u) => setUser(u)} />}
      {modalPrefeitura && <ModalEnviarPrefeitura onClose={() => setModalPrefeitura(false)} />}
    </div>
  )
}
