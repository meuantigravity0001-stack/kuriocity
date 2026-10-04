import { NextRequest, NextResponse } from 'next/server'
import { User, UserRole } from '@/lib/types'

let mockUser: User = {
  id: 'user-demo-1',
  email: 'cidadao@kuriocity.org.br',
  nome: 'Lucas Silva',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'CIDADAO',
}

export async function GET() {
  return NextResponse.json({ user: mockUser })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, nomeLoja, cnpj, chavePixLoja, especialidade, chavePixPrestador } = body

    mockUser = {
      ...mockUser,
      role: (role as UserRole) || mockUser.role,
      nomeLoja: nomeLoja || mockUser.nomeLoja,
      cnpj: cnpj || mockUser.cnpj,
      chavePixLoja: chavePixLoja || mockUser.chavePixLoja,
      especialidade: especialidade || mockUser.especialidade,
      chavePixPrestador: chavePixPrestador || mockUser.chavePixPrestador,
    }

    return NextResponse.json({ success: true, user: mockUser })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
