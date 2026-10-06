'use client'

import { useState, useCallback, useRef } from 'react'
import { cartasAutoridade } from '@/lib/cartas'
import { reverseGeocode } from '@/lib/types'
import { uploadParaGoogleDriveUsuario } from '@/lib/drive'
import {
  Camera,
  MapPin,
  X,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Store,
  HardHat,
  ShieldCheck,
  FolderLock,
  Search,
  Users,
  UserPlus,
  AlertCircle,
} from 'lucide-react'

interface ModalPontoCuidadoProps {
  onClose: () => void
  onSuccess: () => void
}

type Step = 'dados' | 'localizacao' | 'parceiro' | 'enviando' | 'sucesso'
type ModoMaoDeObra = 'informar' | 'aberto' | 'comunidade'

interface Sugestao {
  display_name: string
  lat: string
  lon: string
}

export default function ModalPontoCuidado({ onClose, onSuccess }: ModalPontoCuidadoProps) {
  const [step, setStep] = useState<Step>('dados')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoriaId, setCategoriaId] = useState('obras')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')

  // Busca por endereço
  const [buscaEndereco, setBuscaEndereco] = useState('')
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [buscando, setBuscando] = useState(false)
  const buscaTimeout = useRef<NodeJS.Timeout | null>(null)

  // Dados do Lojista Parceiro
  const [nomeLoja, setNomeLoja] = useState('')
  const [chavePixLoja, setChavePixLoja] = useState('')
  const [valorMaterial, setValorMaterial] = useState('180')

  // Modo Mão de Obra — NOVO: informar / aberto / comunidade
  const [modoMaoDeObra, setModoMaoDeObra] = useState<ModoMaoDeObra>('aberto')
  const [prestadorNome, setPrestadorNome] = useState('')
  const [chavePixPrestador, setChavePixPrestador] = useState('')
  const [valorMaoObra, setValorMaoObra] = useState('120')

  const [loading, setLoading] = useState(false)
  const [driveUrl, setDriveUrl] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const cartaAtual = cartasAutoridade.find((c) => c.id === categoriaId) || cartasAutoridade[0]

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  // ── GPS automático ──
  const capturarGPS = useCallback(async () => {
    setLoading(true)
    setErro(null)
    setSugestoes([])
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      )
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      setLatitude(lat)
      setLongitude(lon)
      const result = await reverseGeocode(lat, lon)
      setEndereco(result.enderecoFormatado)
      setCidade(result.cidade)
      setBuscaEndereco(result.enderecoFormatado)
    } catch {
      setErro('GPS indisponível. Use a busca por endereço abaixo.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Busca por endereço (OpenStreetMap Nominatim — gratuito) ──
  const buscarEndereco = (texto: string) => {
    setBuscaEndereco(texto)
    if (buscaTimeout.current) clearTimeout(buscaTimeout.current)
    if (texto.length < 4) { setSugestoes([]); return }

    buscaTimeout.current = setTimeout(async () => {
      setBuscando(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&addressdetails=1&limit=5&countrycodes=br`
        const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
        const data: Sugestao[] = await res.json()
        setSugestoes(data)
      } catch {
        setSugestoes([])
      } finally {
        setBuscando(false)
      }
    }, 400)
  }

  const selecionarSugestao = async (s: Sugestao) => {
    const lat = parseFloat(s.lat)
    const lon = parseFloat(s.lon)
    setLatitude(lat)
    setLongitude(lon)
    setBuscaEndereco(s.display_name)
    setSugestoes([])
    // Formata endereço limpo via reverse geocode
    try {
      const result = await reverseGeocode(lat, lon)
      setEndereco(result.enderecoFormatado)
      setCidade(result.cidade)
    } catch {
      setEndereco(s.display_name.split(',').slice(0, 2).join(', '))
      setCidade(s.display_name.split(',').slice(-2).join(', ').trim())
    }
  }

  const criarPonto = async () => {
    setStep('enviando')
    setErro(null)
    try {
      let finalDriveFolder = 'https://drive.google.com/drive/folders/kuriocity'
      let finalFotoUrl = 'https://images.unsplash.com/photo-1584463674643-87b64082c59a?w=600&auto=format&fit=crop'

      if (foto) {
        const driveRes = await uploadParaGoogleDriveUsuario('mock-token', foto, `Evidência - ${titulo}`)
        finalDriveFolder = driveRes.folderUrl
        if (fotoPreview) finalFotoUrl = fotoPreview
      }
      setDriveUrl(finalDriveFolder)

      // Monta dados do prestador baseado no modo escolhido
      const prestadorPayload =
        modoMaoDeObra === 'informar'
          ? {
              prestadorNome: prestadorNome || 'Profissional Indicado',
              chavePixPrestador,
              valorMaoObra: Number(valorMaoObra) || 120,
              prestadorStatus: 'DEFINIDO',
            }
          : modoMaoDeObra === 'aberto'
          ? {
              prestadorNome: null,
              chavePixPrestador: null,
              valorMaoObra: Number(valorMaoObra) || 0,
              prestadorStatus: 'ABERTO_CANDIDATURAS',
            }
          : {
              prestadorNome: null,
              chavePixPrestador: null,
              valorMaoObra: 0,
              prestadorStatus: 'AGUARDANDO_INDICACAO',
            }

      const res = await fetch('/api/pontos-cuidado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo || `Missão de Zeladoria — ${cartaAtual.categoria}`,
          descricao,
          latitude: latitude || -15.7942,
          longitude: longitude || -47.8822,
          endereco,
          cidade,
          categoria: cartaAtual.categoria,
          fotoUrl: finalFotoUrl,
          driveFolderUrl: finalDriveFolder,
          nomeLoja: nomeLoja || cartaAtual.lojaParceiraExemplo,
          chavePixLoja: chavePixLoja || cartaAtual.chavePixExemplo,
          valorMaterial: Number(valorMaterial) || 180,
          itensDescricao: 'Materiais para reparo comunitário',
          ...prestadorPayload,
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Erro ao criar ponto')

      setStep('sucesso')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)
    } catch (err: any) {
      setErro(err.message || 'Erro ao registrar Ponto de Cuidado')
      setStep('dados')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-lg">
              🌱
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Novo Ponto de Cuidado</h2>
              <p className="text-gray-400 text-xs">Mapeamento de Zeladoria Colaborativa & Conexão Local</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        {(step === 'dados' || step === 'localizacao' || step === 'parceiro') && (
          <div className="flex border-b border-gray-800">
            {[
              { key: 'dados', label: '1. Ocorrência' },
              { key: 'localizacao', label: '2. Localização' },
              { key: 'parceiro', label: '3. Parceiros' },
            ].map((s) => (
              <div
                key={s.key}
                className={`flex-1 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  step === s.key
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-gray-600'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* ─── STEP 1: Dados ─── */}
          {step === 'dados' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Categoria da Zeladoria
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {cartasAutoridade.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoriaId(c.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        categoriaId === c.id
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-lg">{c.icone}</span>
                      <p className="text-xs font-bold truncate">{c.categoria}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Título da Missão
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Reparo de Calçada na Rua das Flores"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Descrição Detalhada
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o local e o reparo comunitário necessário..."
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Camera size={14} className="text-blue-400" />
                    Foto do Local
                  </label>
                  <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                    <ShieldCheck size={12} /> LGPD · Google Drive Pessoal
                  </span>
                </div>
                <label
                  htmlFor="foto-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-xl cursor-pointer bg-gray-900/40 hover:bg-gray-900 transition-all"
                >
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center p-4">
                      <FolderLock size={26} className="text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-xs font-bold">Toque para adicionar evidência</p>
                      <p className="text-gray-600 text-[10px] mt-1">Salva na sua pasta "Kurió City Tour" no Google Drive</p>
                    </div>
                  )}
                </label>
                <input id="foto-input" type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>

              <button
                onClick={() => setStep('localizacao')}
                className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2"
              >
                Avançar para Localização <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ─── STEP 2: Localização (GPS + busca por endereço) ─── */}
          {step === 'localizacao' && (
            <div className="space-y-4">

              {/* GPS automático */}
              <button
                onClick={capturarGPS}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                {latitude ? 'Recapturar GPS Automático' : 'Usar Minha Localização GPS'}
              </button>

              {/* Divisor */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs font-bold">ou busque pelo endereço</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              {/* Busca por endereço manual */}
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5 flex items-center gap-1.5">
                  <Search size={12} className="text-blue-400" />
                  Buscar Endereço / CEP / Ponto de Referência
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={buscaEndereco}
                    onChange={(e) => buscarEndereco(e.target.value)}
                    placeholder="Ex: Rua das Flores 123, São Paulo ou 01310-100"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                  {buscando && (
                    <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
                  )}
                </div>

                {/* Dropdown de sugestões */}
                {sugestoes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                    {sugestoes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => selecionarSugestao(s)}
                        className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-800 border-b border-gray-800 last:border-0 flex items-start gap-2.5 transition-colors"
                      >
                        <MapPin size={13} className="text-blue-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{s.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmação do endereço */}
              {latitude && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 space-y-1">
                  <p className="text-blue-400 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Localização Confirmada
                  </p>
                  <p className="text-gray-200 text-sm font-medium">{endereco}</p>
                  <p className="text-gray-500 text-xs">{cidade}</p>
                  <p className="text-gray-700 text-[10px] font-mono">
                    {latitude.toFixed(6)}, {longitude?.toFixed(6)}
                  </p>
                </div>
              )}

              {!latitude && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-300/80 text-xs">
                    Confirme a localização via GPS ou busca antes de avançar. O endereço correto é essencial para conectar comerciantes e prestadores do bairro.
                  </p>
                </div>
              )}

              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={13} /> {erro}
                </div>
              )}

              <button
                onClick={() => setStep('parceiro')}
                className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2"
              >
                Avançar para Parceiros do Bairro <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ─── STEP 3: Parceiro (Loja + Mão de Obra com modos) ─── */}
          {step === 'parceiro' && (
            <div className="space-y-4">

              {/* Lojista Parceiro */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                  <Store size={15} /> 🏪 Parceiro do Bairro (Materiais)
                </div>
                <input
                  type="text"
                  value={nomeLoja}
                  onChange={(e) => setNomeLoja(e.target.value)}
                  placeholder={`Ex: ${cartaAtual.lojaParceiraExemplo}`}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-yellow-500/50"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={chavePixLoja}
                    onChange={(e) => setChavePixLoja(e.target.value)}
                    placeholder={`Chave Pix: ${cartaAtual.chavePixExemplo}`}
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-yellow-500/50"
                  />
                  <input
                    type="number"
                    value={valorMaterial}
                    onChange={(e) => setValorMaterial(e.target.value)}
                    placeholder="Meta materiais (R$)"
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
              </div>

              {/* Mão de Obra — 3 modos */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-4">
                <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-wider">
                  <HardHat size={15} /> 👷 Mão de Obra (Execução)
                </div>

                {/* Seletor de modo — cards verticais */}
                <div className="space-y-2">
                  {[
                    {
                      key: 'aberto' as ModoMaoDeObra,
                      emoji: '🏗️',
                      label: 'Publicar em Aberto',
                      desc: 'Prestadores cadastrados se candidatam. A vizinhança aprova antes do Pix.',
                      badge: 'Mais usado',
                      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                      activeStyle: 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30',
                      inactiveStyle: 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50',
                      activeText: 'text-blue-200',
                    },
                    {
                      key: 'informar' as ModoMaoDeObra,
                      emoji: '🤝',
                      label: 'Já tenho o profissional',
                      desc: 'Informe nome e Pix de quem vai executar. A obra sai direto para ele.',
                      badge: 'Mais rápido',
                      badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
                      activeStyle: 'border-green-500 bg-green-500/10 ring-1 ring-green-500/30',
                      inactiveStyle: 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50',
                      activeText: 'text-green-200',
                    },
                    {
                      key: 'comunidade' as ModoMaoDeObra,
                      emoji: '📣',
                      label: 'Pedir indicação da vizinhança',
                      desc: 'Moradores sugerem profissionais nos comentários. Você aprova a indicação.',
                      badge: 'Comunitário',
                      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                      activeStyle: 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30',
                      inactiveStyle: 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50',
                      activeText: 'text-purple-200',
                    },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setModoMaoDeObra(m.key)}
                      className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        modoMaoDeObra === m.key ? m.activeStyle : m.inactiveStyle
                      }`}
                    >
                      <span className="text-2xl shrink-0">{m.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-extrabold ${modoMaoDeObra === m.key ? m.activeText : 'text-gray-300'}`}>
                            {m.label}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${m.badgeColor}`}>
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{m.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        modoMaoDeObra === m.key ? 'border-current bg-current' : 'border-gray-700'
                      }`}>
                        {modoMaoDeObra === m.key && <div className="w-1.5 h-1.5 rounded-full bg-gray-950" />}
                      </div>
                    </button>
                  ))}
                </div>


                {/* Conteúdo dinâmico por modo */}
                {modoMaoDeObra === 'informar' && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={prestadorNome}
                      onChange={(e) => setPrestadorNome(e.target.value)}
                      placeholder="Nome do profissional (Ex: Seu Raimundo, Pedreiro)"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-green-500/50"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={chavePixPrestador}
                        onChange={(e) => setChavePixPrestador(e.target.value)}
                        placeholder="Chave Pix do profissional"
                        className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-green-500/50"
                      />
                      <input
                        type="number"
                        value={valorMaoObra}
                        onChange={(e) => setValorMaoObra(e.target.value)}
                        placeholder="Valor acordado (R$)"
                        className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-green-500/50"
                      />
                    </div>
                  </div>
                )}

                {modoMaoDeObra === 'aberto' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-1.5">
                    <p className="text-blue-300 text-xs font-bold flex items-center gap-1.5">
                      <UserPlus size={13} /> Ponto publicado como "Aberto a Candidaturas"
                    </p>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      Prestadores de serviço cadastrados no Kurió City Tour poderão se candidatar a executar esta obra. A comunidade aprova o candidato antes do Pix ser liberado.
                    </p>
                    <div className="mt-2">
                      <input
                        type="number"
                        value={valorMaoObra}
                        onChange={(e) => setValorMaoObra(e.target.value)}
                        placeholder="Valor estimado de mão de obra (R$) — opcional"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                {modoMaoDeObra === 'comunidade' && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 space-y-1.5">
                    <p className="text-purple-300 text-xs font-bold flex items-center gap-1.5">
                      <Users size={13} /> A vizinhança vai indicar um prestador
                    </p>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      O ponto será publicado com status "Aguardando Indicação". Moradores poderão sugerir profissionais nos comentários. Você aprova a indicação antes de ativar o Pix.
                    </p>
                  </div>
                )}
              </div>

              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={13} /> {erro}
                </div>
              )}

              <button
                onClick={criarPonto}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white shadow-lg"
              >
                🌱 Publicar Ponto de Cuidado
              </button>
            </div>
          )}

          {/* ─── Enviando ─── */}
          {step === 'enviando' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 size={36} className="text-blue-500 animate-spin" />
              <p className="text-white font-bold text-sm">Registrando Ponto de Cuidado...</p>
              <p className="text-gray-500 text-xs">Conectando a vizinhança & Google Drive</p>
            </div>
          )}

          {/* ─── Sucesso ─── */}
          {step === 'sucesso' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h3 className="text-white font-bold text-lg">🌱 Ponto de Cuidado Publicado!</h3>
              <p className="text-gray-400 text-xs max-w-sm">
                {modoMaoDeObra === 'aberto'
                  ? 'Prestadores de serviço podem se candidatar. A comunidade já pode contribuir via Pix P2P.'
                  : modoMaoDeObra === 'comunidade'
                  ? 'A vizinhança será notificada para indicar um prestador qualificado.'
                  : 'A comunidade e os comércios locais já podem contribuir diretamente via Pix P2P.'}
              </p>
              {driveUrl && (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 underline flex items-center gap-1 font-mono"
                >
                  <ShieldCheck size={12} /> Ver pasta no seu Google Drive Pessoal
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
