-- Adiciona colunas de integração Stripe na tabela barbearia_perfis
ALTER TABLE barbearia_perfis
  ADD COLUMN IF NOT EXISTS plano_saas            text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id    text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
