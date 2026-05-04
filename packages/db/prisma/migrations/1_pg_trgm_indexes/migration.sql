-- pg_trgm GIN indexes for fuzzy/similarity search.
-- Phase 1 acceptance: search "joh" finds "John Smith".
-- These indexes are not expressible in schema.prisma (op-class gin_trgm_ops),
-- so they live as a raw SQL migration. Keep schema.prisma in sync via a
-- corresponding @@index/comment if you need Prisma to know about them.

-- Contact: name + email fuzzy search
CREATE INDEX IF NOT EXISTS "Contact_firstName_trgm_idx"
  ON "Contact" USING GIN ("firstName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Contact_lastName_trgm_idx"
  ON "Contact" USING GIN ("lastName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Contact_email_trgm_idx"
  ON "Contact" USING GIN ("email" gin_trgm_ops);

-- Company: name + domain fuzzy search
CREATE INDEX IF NOT EXISTS "Company_name_trgm_idx"
  ON "Company" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Company_domain_trgm_idx"
  ON "Company" USING GIN ("domain" gin_trgm_ops);
