import { User, UserRole } from './types'

const MOCK_USER_STORAGE_KEY = 'kuriocity_user_session'

export const DEFAULT_USER: User = {
  id: 'user-demo-1',
  email: 'cidadao@kuriocity.org.br',
  nome: 'Lucas Silva',
  telefone: '(11) 98765-4321',
  endereco: 'Rua das Flores, 120 - Bairro Central',
  chavePixPessoal: '11987654321',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'CIDADAO', // Todo usuário obrigatoriamente começa como Morador
  modoPrestadorAtivo: false,
  modoComercianteAtivo: false,
  servicosEmAndamentoCount: 0,
  cotacoesAtivasCount: 0,
}

export function getCurrentUser(): User {
  if (typeof window === 'undefined') return DEFAULT_USER
  const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Garantir que caso a sessão antiga não tenha role, force CIDADAO
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
    localStorage.removeItem(MOCK_USER_STORAGE_KEY)
  }
  return DEFAULT_USER
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
