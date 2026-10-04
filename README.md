# 🌆 KURIOCITY — Zeladoria Cidadã & Tabuleiro Cívico

> **Transforme problemas urbanos em missões cívicas.** O mapa da sua cidade vira um tabuleiro tático de zeladoria onde cada cidadão é um agente de mudança.

---

## 🎮 Conceito

Inspirado em dinamismo urbano, o **KURIOCITY** transforma o engajamento cívico em uma experiência tática:

| Elemento | Equivalente no App |
|---|---|
| Tabuleiro de Guerra | Mapa interativo dark mode da cidade |
| Cartas de Poder (TCG) | Cartas das Secretarias e Autoridades |
| Pinos 🔴🟡🟢 | Status das ocorrências em tempo real |
| Missões Cívicas | Reportes com foto, GPS e e-mail oficial |

## 🛠️ Stack

- **Frontend:** Next.js 14 + TailwindCSS + TypeScript
- **Mapa:** Leaflet + react-leaflet (CartoDB Dark tiles)
- **Backend:** Supabase (PostgreSQL + Storage + Realtime)
- **E-mail:** Resend API com tracking pixel embutido
- **Geocodificação:** Nominatim OpenStreetMap (gratuito)

---

## Configuração Rápida

### 1. Instale as dependências

```bash
cd war-urbano
npm install
```

### 2. Configure o `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_servico
RESEND_API_KEY=re_sua_chave_resend
ADMIN_EMAIL=meuantigravity.0001@gmail.com
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Abra **SQL Editor** e execute `supabase/schema.sql`
3. Crie bucket em **Storage > New Bucket**:
   - Nome: `ocorrencias-fotos` | Acesso: **Public** | Limite: 10MB

### 4. Configure o Resend

1. Conta em [resend.com](https://resend.com)
2. Verifique seu domínio de envio
3. Gere API Key e adicione ao `.env.local`

### 5. Rode em desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## Fluxo de uma Missão

```
Cidadao fotografa problema
         |
GPS captura coordenadas
         |
Nominatim -> endereco legivel
         |
Cidadao seleciona Carta de Autoridade
         |
Foto -> Supabase Storage
         |
Ocorrencia salva (status: ALERTA vermelho)
         |
Resend envia e-mail para prefeitura
(tracking pixel no rodape)
         |
Prefeitura abre e-mail ->
/api/tracking acionado ->
Status: EM_COMBATE amarelo
         |
Prefeitura resolve -> confirmacao ->
Status: RESOLVIDO verde
```

---

## Estrutura do Projeto

```
war-urbano/
app/
  api/
    ocorrencias/route.ts    - CRUD + envio de e-mail
    tracking/route.ts       - Pixel de rastreio (1x1 GIF)
    upload/route.ts         - Upload de fotos
  globals.css               - Tema dark tatico
  layout.tsx                - Root layout + SEO
  page.tsx                  - Pagina principal (tabuleiro)
components/
  CartaWar.tsx              - Componente TCG Card
  MissaoModal.tsx           - Fluxo de 5 etapas
  TabuleiroDinamico.tsx     - Mapa Leaflet dark
lib/
  cartas.ts                 - Dados das autoridades
  supabase.ts               - Cliente Supabase
  types.ts                  - Types + geocodificacao
supabase/
  schema.sql                - Schema + seed + RLS
```

---

## Deploy na Vercel

```bash
npx vercel --prod
```

Configure as variaveis de ambiente no painel e atualize `NEXT_PUBLIC_APP_URL`.

---

**Admin:** meuantigravity.0001@gmail.com | **Modelo:** Open Civic Data (100% Gratuito)
