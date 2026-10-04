-- ============================================================
-- WAR URBANO — Schema SQL para Supabase (PostgreSQL)
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELA: cartas_autoridade
-- As "cartas" do TCG — define quem é responsável por quê
-- ============================================================
CREATE TABLE IF NOT EXISTS cartas_autoridade (
  id                 TEXT PRIMARY KEY,
  categoria          TEXT NOT NULL,
  orgao_responsavel  TEXT NOT NULL,
  cargo_politico     TEXT NOT NULL,
  email_oficial      TEXT NOT NULL,
  descricao_papel    TEXT NOT NULL,
  cor_tema           TEXT NOT NULL DEFAULT '#ef4444',
  icone              TEXT NOT NULL DEFAULT '📍',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: ocorrencias
-- O tabuleiro de guerra — cada linha é um marcador no mapa
-- ============================================================
CREATE TABLE IF NOT EXISTS ocorrencias (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              TEXT,
  latitude             DOUBLE PRECISION NOT NULL,
  longitude            DOUBLE PRECISION NOT NULL,
  endereco_formatado   TEXT NOT NULL,
  cidade               TEXT NOT NULL DEFAULT '',
  foto_url             TEXT NOT NULL DEFAULT '',
  legenda              TEXT,
  carta_id             TEXT NOT NULL REFERENCES cartas_autoridade(id),
  status               TEXT NOT NULL DEFAULT 'ALERTA'
                         CHECK (status IN ('ALERTA', 'EM_COMBATE', 'RESOLVIDO')),
  email_enviado        BOOLEAN NOT NULL DEFAULT FALSE,
  email_lido           BOOLEAN NOT NULL DEFAULT FALSE,
  email_lido_em        TIMESTAMPTZ,
  tracking_token       TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias(status);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_carta_id ON ocorrencias(carta_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_tracking_token ON ocorrencias(tracking_token);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_created_at ON ocorrencias(created_at DESC);

-- ============================================================
-- RLS (Row Level Security) — Leitura pública, escrita via service key
-- ============================================================
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartas_autoridade ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ver as ocorrências (tabuleiro público)
CREATE POLICY "ocorrencias_public_read"
  ON ocorrencias FOR SELECT
  USING (true);

-- Qualquer pessoa pode inserir (modo anônimo permitido)
CREATE POLICY "ocorrencias_public_insert"
  ON ocorrencias FOR INSERT
  WITH CHECK (true);

-- Somente service role pode atualizar (tracking, status)
CREATE POLICY "ocorrencias_service_update"
  ON ocorrencias FOR UPDATE
  USING (true);

-- Cartas são públicas para leitura
CREATE POLICY "cartas_public_read"
  ON cartas_autoridade FOR SELECT
  USING (true);

-- ============================================================
-- DADOS INICIAIS — Seed das Cartas de Autoridade
-- ============================================================
INSERT INTO cartas_autoridade (id, categoria, orgao_responsavel, cargo_politico, email_oficial, descricao_papel, cor_tema, icone)
VALUES
  ('obras',      'Buraco / Pavimentação / Calçada',       'Secretaria Municipal de Obras e Infraestrutura', 'Secretário Municipal de Obras',      'ouvidoria.obras@prefeitura.gov.br',      'Responsável legal pela manutenção de vias públicas, calçadas, bueiros e drenagem urbana. Prazo legal: 72h.',           '#f97316', '🏗️'),
  ('iluminacao', 'Iluminação Pública / Poste Apagado',    'Concessionária de Energia / ILUME Municipal',    'Diretor de Iluminação Pública',       'iluminacao@prefeitura.gov.br',           'Gestão e manutenção de postes e luminárias públicas. Prazo de atendimento: 48h.',                                     '#eab308', '💡'),
  ('lixo',       'Lixo / Entulho / Descarte Irregular',   'Secretaria de Serviços Urbanos e Limpeza',       'Secretário de Serviços Urbanos',      'limpeza.urbana@prefeitura.gov.br',       'Responsável pela coleta de lixo e remoção de entulho. Lei 12.305/2010 exige resposta em 48h.',                        '#22c55e', '🗑️'),
  ('esgoto',     'Esgoto / Bueiro / Alagamento',          'Companhia de Saneamento / SAAE Municipal',       'Diretor de Saneamento Básico',        'saneamento@prefeitura.gov.br',           'Gestão da rede de esgoto e drenagem pluvial. Prazo urgente: 24h.',                                                   '#06b6d4', '🚰'),
  ('arvore',     'Árvore Caída / Risco de Queda',         'Secretaria de Meio Ambiente e Arborização',      'Secretário de Meio Ambiente',         'meio.ambiente@prefeitura.gov.br',        'Responsável pelo manejo da arborização urbana. Emergência: 12h.',                                                    '#84cc16', '🌳'),
  ('seguranca',  'Segurança Pública / Vandalismo',         'Guarda Municipal / Secretaria de Segurança',     'Comandante da Guarda Municipal',      'guardamunicipal@prefeitura.gov.br',      'Proteção do patrimônio público. Prazo: 24h.',                                                                          '#8b5cf6', '🛡️'),
  ('saude',      'UBS / Posto de Saúde / Limpeza',        'Secretaria Municipal de Saúde',                  'Secretário Municipal de Saúde',       'ouvidoria.saude@prefeitura.gov.br',      'Gestão das unidades de saúde. Lei 8.080/90 garante resposta em 48h.',                                                 '#ef4444', '🏥'),
  ('educacao',   'Escola / CEI / Creche Municipal',       'Secretaria Municipal de Educação',               'Secretário Municipal de Educação',    'ouvidoria.educacao@prefeitura.gov.br',   'Manutenção de unidades escolares. CF/88 garante prazo de 72h para infraestrutura.',                                   '#3b82f6', '🏫')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BUCKET DE STORAGE — Fotos das ocorrências
-- Execute manualmente no Dashboard ou via API
-- ============================================================
-- No Supabase Dashboard > Storage > New Bucket
-- Nome: "ocorrencias-fotos"
-- Public: TRUE
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- ============================================================
-- VIEW útil para o mapa (join automático)
-- ============================================================
CREATE OR REPLACE VIEW ocorrencias_com_carta AS
SELECT
  o.*,
  c.categoria,
  c.orgao_responsavel,
  c.cor_tema,
  c.icone,
  c.email_oficial
FROM ocorrencias o
LEFT JOIN cartas_autoridade c ON o.carta_id = c.id;

COMMENT ON VIEW ocorrencias_com_carta IS 'View com join de ocorrências + cartas para o mapa tático';
