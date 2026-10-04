'use client'

import { useEffect, useRef, useState } from 'react'
import { PontoDeCuidado, getStatusConfig } from '@/lib/types'
import { cartasAutoridade } from '@/lib/cartas'

interface TabuleiroDinamicoProps {
  pontos: PontoDeCuidado[]
  pontoSelecionado?: PontoDeCuidado | null
  onMarkerClick?: (p: PontoDeCuidado) => void
}

export default function TabuleiroDinamico({
  pontos,
  pontoSelecionado,
  onMarkerClick,
}: TabuleiroDinamicoProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Importar Leaflet dinamicamente (SSR safe)
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current || (mapRef.current as any)._leaflet_id) return

      // Corrigir ícones padrão do Leaflet no Next.js
      const DefaultIcon = L.Icon.Default as any
      delete DefaultIcon.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Centralizar no Bairro / Cidade Local (Zoom Nível 14 para visualização de ruas e lojas)
      const initialLat = pontos.length > 0 ? pontos[0].latitude : -15.7942
      const initialLon = pontos.length > 0 ? pontos[0].longitude : -47.8822

      const map = L.map(mapRef.current!, {
        center: [initialLat, initialLon],
        zoom: 14, // Zoom focado nas ruas do bairro
        zoomControl: false,
      })

      // Tile layer 100% gratuito e oficial do OpenStreetMap (sem necessidade de API Key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | Kuriocity',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map)

      // Zoom control reposicionado no canto inferior direito
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapInstanceRef.current = map
      setIsLoaded(true)

      setTimeout(() => {
        map.invalidateSize()
      }, 200)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Fly to no ponto selecionado
  useEffect(() => {
    if (mapInstanceRef.current && pontoSelecionado) {
      mapInstanceRef.current.flyTo([pontoSelecionado.latitude, pontoSelecionado.longitude], 15, {
        duration: 1.2,
      })
    }
  }, [pontoSelecionado])

  // Atualizar marcadores quando pontos de cuidado mudarem
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    let isMounted = true

    import('leaflet').then((L) => {
      if (!isMounted || !mapInstanceRef.current) return

      // Limpar marcadores antigos
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      pontos.forEach((p) => {
        if (!mapInstanceRef.current) return

        const statusConfig = getStatusConfig(p.status)
        const carta = cartasAutoridade.find((c) => c.categoria === p.categoria) || cartasAutoridade[0]

        // Criar ícone SVG cívico moderno
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
            <defs>
              <filter id="shadow-${p.id.substring(0,4)}" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.35"/>
              </filter>
            </defs>
            <path d="M19 0C8.507 0 0 8.507 0 19c0 14.25 19 27 19 27s19-12.75 19-27C38 8.507 29.493 0 19 0z"
              fill="${statusConfig.color}" filter="url(#shadow-${p.id.substring(0,4)})"/>
            <circle cx="19" cy="19" r="11" fill="#ffffff"/>
            <text x="19" y="23" text-anchor="middle" font-size="13">${carta?.icone || '🌱'}</text>
          </svg>`

        const icon = L.divIcon({
          html: svgIcon,
          className: '',
          iconSize: [38, 46],
          iconAnchor: [19, 46],
          popupAnchor: [0, -46],
        })

        const marker = L.marker([p.latitude, p.longitude], { icon })

        const popupContent = `
          <div style="background:#ffffff;color:#0f172a;border-radius:14px;padding:14px;min-width:240px;box-shadow:0 10px 25px rgba(0,0,0,0.12);border:1px solid #e2e8f0;font-family:sans-serif">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:22px;background:#f1f5f9;padding:6px;border-radius:10px">${carta?.icone || '🌱'}</span>
              <div>
                <div style="font-size:10px;color:${statusConfig.color};font-weight:bold;letter-spacing:1px;text-transform:uppercase">${statusConfig.emoji} ${statusConfig.label}</div>
                <div style="font-size:13px;color:#0f172a;font-weight:bold;line-height:1.2">${p.titulo}</div>
              </div>
            </div>
            <div style="font-size:11px;color:#64748b;margin-bottom:6px">📍 ${p.endereco || 'Localização Registrada'}</div>
            ${p.orcamentoLoja ? `<div style="font-size:11px;color:#2563eb;font-weight:bold;background:#eff6ff;padding:6px 10px;border-radius:8px">🏪 Meta Lojista: R$ ${p.orcamentoLoja.valorArrecadado} / R$ ${p.orcamentoLoja.valorTotal}</div>` : ''}
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #f1f5f9;font-size:10px;color:#94a3b8">${statusConfig.desc}</div>
          </div>`

        marker.bindPopup(popupContent, {
          className: 'war-popup',
          maxWidth: 290,
        })

        marker.on('click', () => {
          onMarkerClick?.(p)
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([p.latitude, p.longitude], 15, { duration: 1 })
          }
        })

        if (mapInstanceRef.current) {
          marker.addTo(mapInstanceRef.current)
          markersRef.current.push(marker)
        }
      })
    })

    return () => {
      isMounted = false
    }
  }, [pontos, isLoaded, onMarkerClick])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
    </div>
  )
}
