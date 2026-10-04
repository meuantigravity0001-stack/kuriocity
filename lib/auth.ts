import { User, UserRole } from './types'

const MOCK_USER_STORAGE_KEY = 'kurio_city_tour_session'

export const DEMO_USERS: Record<string, User> = {
  lucas: {
    id: 'user-demo-lucas',
    email: 'lucas.silva@kuriocitytour.org.br',
    nome: 'Lucas Silva',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 120 - Bairro Central',
    chavePixPessoal: '11987654321',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'CIDADAO',
    modoPrestadorAtivo: false,
    modoComercianteAtivo: false,
    servicosEmAndamentoCount: 0,
    cotacoesAtivasCount: 0,
  },
  deposito: {
    id: 'user-demo-deposito',
    email: 'contato@depositosaojose.com.br',
    nome: 'Depósito São José',
    telefone: '(11) 97123-4567',
    endereco: 'Av. Principal, 450 - Centro',
    chavePixPessoal: '12.345.678/0001-90',
    avatarUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=80',
    role: 'COMERCIANTE',
    modoPrestadorAtivo: false,
    modoComercianteAtivo: true,
    nomeLoja: 'Depósito São José Materiais',
    cnpj: '12.345.678/0001-90',
    chavePixLoja: '12.345.678/0001-90',
    servicosEmAndamentoCount: 0,
    cotacoesAtivasCount: 2,
  },
  raimundo: {
    id: 'user-demo-raimundo',
    email: 'seu.raimundo@obrasbairro.com.br',
    nome: 'Seu Raimundo Mestre',
    telefone: '(11) 99887-6655',
    endereco: 'Rua dos Manacás, 88 - Bairro Alto',
    chavePixPessoal: '11998876655',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'PRESTADOR',
    modoPrestadorAtivo: true,
    modoComercianteAtivo: false,
    especialidade: 'Pedreiro Mestre & Manutenção Urbana',
    chavePixPrestador: '11998876655',
    avaliacaoMedia: 5.0,
    obrasConcluidas: 14,
    servicosEmAndamentoCount: 1,
    cotacoesAtivasCount: 0,
  },
}

export const GUEST_USER: User = {
  id: 'guest-user',
  email: '',
  nome: 'Visitante',
  telefone: '',
  endereco: '',
  chavePixPessoal: '',
  role: 'CIDADAO',
  avatarUrl: '',
  modoPrestadorAtivo: false,
  modoComercianteAtivo: false,
  servicosEmAndamentoCount: 0,
  cotacoesAtivasCount: 0,
}

export const DEFAULT_USER: User = DEMO_USERS.lucas

export function getCurrentUser(): User {
  if (typeof window === 'undefined') return DEFAULT_USER
  const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (!parsed.role) parsed.role = 'CIDADAO'
      return parsed
    } catch (e) {}
  }
  return DEFAULT_USER
}

export function saveUserSession(user: User): User {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user))
  }
  return user
}

export function logoutUser(): User {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(GUEST_USER))
  }
  return GUEST_USER
}

export function switchDemoUser(key: string): User {
  const user = DEMO_USERS[key] || DEFAULT_USER
  return saveUserSession(user)
}

export function canDisableRoleMode(user: User, targetRole: 'PRESTADOR' | 'COMERCIANTE'): { allowed: boolean; reason?: string } {
  if (targetRole === 'PRESTADOR') {
    if (user.servicosEmAndamentoCount && user.servicosEmAndamentoCount > 0) {
      return {
        allowed: false,
        reason: `Você possui ${user.servicosEmAndamentoCount} serviço(s) de manutenção em andamento com prazo pré-estabelecido. Conclua os serviços antes de desativar o perfil de Prestador.`,
      }
    }
  }

  if (targetRole === 'COMERCIANTE') {
    if (user.cotacoesAtivasCount && user.cotacoesAtivasCount > 0) {
      return {
        allowed: false,
        reason: `Sua loja possui ${user.cotacoesAtivasCount} cotação(ões) de materiais ativa(s) em arrecadação no bairro.`,
      }
    }
  }

  return { allowed: true }
}

export function updateUserRole(role: UserRole, extraData?: Partial<User>): User {
  const current = getCurrentUser()
  const updated: User = {
    ...current,
    role,
    ...extraData,
  }
  return saveUserSession(updated)
}

