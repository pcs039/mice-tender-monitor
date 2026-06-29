-- Create tenders table
CREATE TABLE IF NOT EXISTS public.tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_notice_no VARCHAR(100) NOT NULL UNIQUE,
    bid_notice_ord VARCHAR(10) NOT NULL DEFAULT '00',
    title TEXT NOT NULL,
    org_name TEXT,
    const_org_name TEXT,
    bid_start_date TIMESTAMP WITH TIME ZONE,
    bid_end_date TIMESTAMP WITH TIME ZONE,
    budget BIGINT,
    link TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT '입찰진행중',
    
    -- Added columns for MICE event details (for RFP parsing/manual entry)
    event_start_date TIMESTAMP WITH TIME ZONE,
    event_end_date TIMESTAMP WITH TIME ZONE,
    event_location TEXT,
    
    -- Internal tracking fields
    user_status VARCHAR(50) NOT NULL DEFAULT '검토대기' CHECK (user_status IN ('검토대기', '지원검토', '제출준비', '제출완료', '제외')),
    assignee VARCHAR(100),
    memo TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast search and sorting
CREATE INDEX IF NOT EXISTS idx_tenders_bid_end_date ON public.tenders (bid_end_date);
CREATE INDEX IF NOT EXISTS idx_tenders_budget ON public.tenders (budget);
CREATE INDEX IF NOT EXISTS idx_tenders_created_at ON public.tenders (created_at);
CREATE INDEX IF NOT EXISTS idx_tenders_user_status ON public.tenders (user_status);

-- Create simple comments/audit logs table (Optional enhancement)
CREATE TABLE IF NOT EXISTS public.tender_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE,
    author VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_tenders_modtime
    BEFORE UPDATE ON public.tenders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
