'use client'

import { CartaAutoridade } from '@/lib/cartas'
import { X, Mail, Clock, Shield } from 'lucide-react'

interface CartaWarProps {
  carta: CartaAutoridade
  onSelect?: () => void
  isSelected?: boolean
  compact?: boolean
}

export default function CartaWar({ carta, onSelect, isSelected, compact }: CartaWarProps) {
  if (compact) {
    return (
      <button
        onClick={onSelect}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
          isSelected
            ? 'scale-[1.02] shadow-lg'
            : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'
        }`}
        style={isSelected ? { borderColor: carta.corTema, background: `${carta.corTema}15` } : {}}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{carta.icone}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-300 truncate">{carta.orgaoResponsavel}</p>
            <p className="text-xs text-gray-500 truncate">{carta.categoria}</p>
          </div>
          {isSelected && (
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: carta.corTema }}
            />
          )}
        </div>
      </button>
    )
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        borderColor: carta.corTema,
        background: `linear-gradient(135deg, #0b132b 0%, #0d1117 60%, ${carta.corTema}20 100%)`,
        boxShadow: `0 0 20px ${carta.corTema}30`,
      }}
      onClick={onSelect}
    >
      {/* Cabeçalho da Carta */}
      <div
        className="px-4 pt-4 pb-2 border-b"
        style={{ borderColor: `${carta.corTema}40` }}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: carta.corTema }}
          >
            ⚔️ CARTA TÁTICA
          </span>
          <span className="text-xl">{carta.icone}</span>
        </div>
        <h3 className="text-white font-bold text-sm leading-tight">{carta.orgaoResponsavel}</h3>
        <p className="text-gray-400 text-xs mt-1">{carta.categoria}</p>
      </div>

      {/* Atributos */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start gap-2">
          <Shield size={12} className="mt-0.5 shrink-0" style={{ color: carta.corTema }} />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Responsável</p>
            <p className="text-xs text-gray-300">{carta.cargoPolitico}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Mail size={12} className="mt-0.5 shrink-0" style={{ color: carta.corTema }} />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Contato Oficial</p>
            <p className="text-xs font-mono" style={{ color: carta.corTema }}>
              {carta.emailOficial}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock size={12} className="mt-0.5 shrink-0 text-gray-500" />
          <p className="text-xs text-gray-400 leading-relaxed">{carta.descricaoPapel}</p>
        </div>
      </div>

      {/* Rodapé estilo card game */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: `${carta.corTema}10` }}
      >
        <span className="text-xs text-gray-600 font-mono">WAR URBANO TCG</span>
        <div
          className="h-1 w-16 rounded-full"
          style={{ background: `linear-gradient(90deg, ${carta.corTema}, transparent)` }}
        />
      </div>
    </div>
  )
}
