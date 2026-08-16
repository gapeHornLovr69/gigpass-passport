-- WORKERS
CREATE TABLE public.workers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'GigPass Worker',
  handle TEXT NOT NULL DEFAULT '@worker',
  city TEXT NOT NULL DEFAULT 'Remote',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.workers TO authenticated;
GRANT ALL ON public.workers TO service_role;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workers_select_own" ON public.workers FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "workers_insert_own" ON public.workers FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "workers_update_own" ON public.workers FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- PLATFORMS (simulated)
CREATE TABLE public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT '',
  accent TEXT NOT NULL DEFAULT 'primary',
  is_simulated BOOLEAN NOT NULL DEFAULT true,
  seed_jobs INTEGER NOT NULL DEFAULT 0,
  seed_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  seed_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  seed_on_time_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  seed_acceptance_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  seed_tenure_months INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platforms TO anon;
GRANT SELECT ON public.platforms TO authenticated;
GRANT ALL ON public.platforms TO service_role;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platforms_public_read" ON public.platforms FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.platforms (slug, name, category, blurb, accent, seed_jobs, seed_rating, seed_completion_rate, seed_on_time_rate, seed_acceptance_rate, seed_tenure_months) VALUES
  ('quickride', 'QuickRide', 'Rideshare', 'SIMULATED platform — urban rideshare driving with trips, ratings and punctuality.', 'primary', 1200, 4.80, 98.00, 96.10, 91.30, 26),
  ('taskgo', 'TaskGo', 'Local tasks', 'SIMULATED platform — on-demand household and errand tasks with client reviews.', 'accent', 800, 4.70, 96.00, 94.40, 88.90, 14),
  ('flexifleet', 'FlexiFleet', 'Delivery', 'SIMULATED platform — parcel and grocery delivery routes with SLA tracking.', 'success', 500, 4.90, 99.00, 95.20, 93.50, 19);

-- CONNECTIONS
CREATE TABLE public.platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'connected',
  consent_share_rating BOOLEAN NOT NULL DEFAULT true,
  consent_share_volume BOOLEAN NOT NULL DEFAULT true,
  consent_share_reliability BOOLEAN NOT NULL DEFAULT true,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (worker_id, platform_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_connections TO authenticated;
GRANT ALL ON public.platform_connections TO service_role;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connections_own" ON public.platform_connections FOR ALL TO authenticated USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);

-- PERFORMANCE RECORDS
CREATE TABLE public.performance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.platform_connections(id) ON DELETE CASCADE,
  jobs_completed INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  on_time_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  acceptance_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tenure_months INTEGER NOT NULL DEFAULT 0,
  is_simulated BOOLEAN NOT NULL DEFAULT true,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (worker_id, platform_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_records TO authenticated;
GRANT ALL ON public.performance_records TO service_role;
ALTER TABLE public.performance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "records_own" ON public.performance_records FOR ALL TO authenticated USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);

-- CREDENTIALS
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id TEXT NOT NULL UNIQUE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  signature TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'HMAC-SHA256',
  revoked BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '90 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credentials TO authenticated;
GRANT ALL ON public.credentials TO service_role;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credentials_select_own" ON public.credentials FOR SELECT TO authenticated USING (auth.uid() = worker_id);

CREATE INDEX idx_credentials_worker ON public.credentials(worker_id);
CREATE INDEX idx_connections_worker ON public.platform_connections(worker_id);
CREATE INDEX idx_records_worker ON public.performance_records(worker_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_workers_updated BEFORE UPDATE ON public.workers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_platforms_updated BEFORE UPDATE ON public.platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_connections_updated BEFORE UPDATE ON public.platform_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_records_updated BEFORE UPDATE ON public.performance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_credentials_updated BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-create worker profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workers (id, display_name, handle, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    '@' || split_part(COALESCE(NEW.email, 'worker@demo'), '@', 1),
    COALESCE(NEW.raw_user_meta_data ->> 'city', 'Manchester, UK')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();