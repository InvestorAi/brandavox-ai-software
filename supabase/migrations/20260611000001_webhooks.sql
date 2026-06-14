-- Migration Timestamp: 20260611000001_webhooks.sql
-- Description: Create webhooks and webhook_logs tables with multi-tenant isolation policies and auto-update triggers.

-- 1. WEBHOOKS TABLE
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. WEBHOOK LOGS TABLE
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  webhook_id uuid NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  status_code integer NOT NULL,
  latency_ms integer NOT NULL,
  payload text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY manage_webhooks ON webhooks 
  FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY manage_webhook_logs ON webhook_logs 
  FOR ALL USING (organization_id = get_user_org_id());

-- 4. UPDATE TIMESTAMPS TRIGGER
CREATE TRIGGER set_updated_at_webhooks 
  BEFORE UPDATE ON webhooks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
