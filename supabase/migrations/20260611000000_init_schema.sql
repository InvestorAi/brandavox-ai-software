-- Brandavox Initial Multi-Tenant Schema Setup
-- Migration Timestamp: 20260611000000_init_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'agency')),
  owner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'client')),
  avatar_url text,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Complete link back in organizations for integrity
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. RLS HELPER FUNCTION (Bypasses RLS recursion on the users table)
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

-- 4. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. BRANDS
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  mission text,
  vision text,
  values text[],
  voice text,
  tone text,
  brand_score integer DEFAULT 0 CHECK (brand_score >= 0 AND brand_score <= 100),
  logo_url text,
  website text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. PERSONAS
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  age_range text,
  demographics jsonb NOT NULL DEFAULT '{}'::jsonb,
  pain_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  health_score integer DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  revenue numeric(12,2) DEFAULT 0.00,
  status text NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'at_risk', 'churned')),
  notes text,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning',
  budget numeric(12,2) DEFAULT 0.00,
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title text NOT NULL,
  objective text,
  budget numeric(12,2) DEFAULT 0.00,
  status text NOT NULL DEFAULT 'draft',
  start_date timestamptz,
  end_date timestamptz,
  channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 11. CAMPAIGN POSTS
CREATE TABLE IF NOT EXISTS campaign_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  platform text NOT NULL,
  content text NOT NULL,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  performance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 12. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES users(id) ON DELETE SET NULL,
  content text NOT NULL,
  file_attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  channel_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 14. AI GENERATIONS
CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  agent text NOT NULL,
  prompt text NOT NULL,
  response jsonb NOT NULL,
  tokens_used integer DEFAULT 0,
  generation_time_ms integer DEFAULT 0,
  model text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 15. AGENT MEMORIES
CREATE TABLE IF NOT EXISTS agent_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent text NOT NULL,
  memory_type text NOT NULL,
  importance_score integer DEFAULT 5 CHECK (importance_score >= 1 AND importance_score <= 10),
  content jsonb NOT NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 16. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 18. API KEYS
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  hashed_key text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  last_used_at timestamptz,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 19. SECURITY EVENTS
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 20. RECOVERY PLANS
CREATE TABLE IF NOT EXISTS recovery_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  risk_score integer DEFAULT 0,
  strategy jsonb NOT NULL DEFAULT '{}'::jsonb,
  outreach_sequence jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_plans ENABLE ROW LEVEL SECURITY;


-- Define standard CRUD RLS policies using get_user_org_id()

-- 1. Organizations Policies
CREATE POLICY select_organizations ON organizations 
  FOR SELECT USING (id = get_user_org_id());

CREATE POLICY update_organizations ON organizations 
  FOR UPDATE USING (id = get_user_org_id());

-- 2. Users Policies
CREATE POLICY select_users ON users 
  FOR SELECT USING (organization_id = get_user_org_id() OR id = auth.uid());

CREATE POLICY update_users ON users 
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY insert_users ON users 
  FOR INSERT WITH CHECK (true); -- Allowed during sign up creation flow

-- 3. Feature Flags Policies
CREATE POLICY manage_feature_flags ON feature_flags 
  FOR ALL USING (organization_id = get_user_org_id());

-- 4. Brands Policies
CREATE POLICY manage_brands ON brands 
  FOR ALL USING (organization_id = get_user_org_id());

-- 5. Personas Policies
CREATE POLICY manage_personas ON personas 
  FOR ALL USING (organization_id = get_user_org_id());

-- 6. Clients Policies
CREATE POLICY manage_clients ON clients 
  FOR ALL USING (organization_id = get_user_org_id());

-- 7. Projects Policies
CREATE POLICY manage_projects ON projects 
  FOR ALL USING (organization_id = get_user_org_id());

-- 8. Tasks Policies
CREATE POLICY manage_tasks ON tasks 
  FOR ALL USING (organization_id = get_user_org_id());

-- 9. Campaigns Policies
CREATE POLICY manage_campaigns ON campaigns 
  FOR ALL USING (organization_id = get_user_org_id());

-- 10. Campaign Posts Policies
CREATE POLICY manage_campaign_posts ON campaign_posts 
  FOR ALL USING (organization_id = get_user_org_id());

-- 11. Messages Policies
CREATE POLICY manage_messages ON messages 
  FOR ALL USING (organization_id = get_user_org_id());

-- 12. Notifications Policies
CREATE POLICY manage_notifications ON notifications 
  FOR ALL USING (organization_id = get_user_org_id() AND user_id = auth.uid());

-- 13. AI Generations Policies
CREATE POLICY manage_ai_generations ON ai_generations 
  FOR ALL USING (organization_id = get_user_org_id());

-- 14. Agent Memories Policies
CREATE POLICY manage_agent_memories ON agent_memories 
  FOR ALL USING (organization_id = get_user_org_id());

-- 15. Analytics Events Policies
CREATE POLICY insert_analytics_events ON analytics_events 
  FOR INSERT WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY select_analytics_events ON analytics_events 
  FOR SELECT USING (organization_id = get_user_org_id());

-- 16. Audit Logs Policies
CREATE POLICY select_audit_logs ON audit_logs 
  FOR SELECT USING (organization_id = get_user_org_id());

-- 17. API Keys Policies
CREATE POLICY manage_api_keys ON api_keys 
  FOR ALL USING (organization_id = get_user_org_id());

-- 18. Security Events Policies
CREATE POLICY manage_security_events ON security_events 
  FOR ALL USING (organization_id = get_user_org_id());

-- 19. Recovery Plans Policies
CREATE POLICY manage_recovery_plans ON recovery_plans 
  FOR ALL USING (organization_id = get_user_org_id());


-- ==========================================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER set_updated_at_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_feature_flags BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_brands BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_personas BEFORE UPDATE ON personas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_clients BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_campaigns BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_campaign_posts BEFORE UPDATE ON campaign_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_messages BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_notifications BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_ai_generations BEFORE UPDATE ON ai_generations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_agent_memories BEFORE UPDATE ON agent_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_api_keys BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_recovery_plans BEFORE UPDATE ON recovery_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
