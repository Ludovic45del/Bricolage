-- =====================================================
-- ASSOMANAGER PRO - Complete Database Schema
-- PostgreSQL - Production Ready
-- =====================================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (Members)
-- =====================================================
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'member');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'archived');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    employer VARCHAR(255),
    
    -- Membership
    membership_expiry DATE NOT NULL,
    total_debt DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Role & Status
    role user_role NOT NULL DEFAULT 'member',
    status user_status NOT NULL DEFAULT 'active',
    
    -- Auth
    password_hash VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_badge ON users(badge_number);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_membership ON users(membership_expiry);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MEMBERSHIP RENEWALS TABLE (History of renewals)
-- =====================================================
CREATE TYPE payment_method AS ENUM ('card', 'check', 'cash', 'system');

CREATE TABLE membership_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    previous_expiry DATE NOT NULL,
    new_expiry DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_renewals_user ON membership_renewals(user_id);
CREATE INDEX idx_renewals_date ON membership_renewals(created_at DESC);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for category lookup
CREATE INDEX idx_categories_name ON categories(name);

-- =====================================================
-- TOOLS TABLE (Main entity)
-- =====================================================
CREATE TYPE tool_status AS ENUM ('available', 'rented', 'maintenance', 'unavailable');
CREATE TYPE maintenance_importance AS ENUM ('low', 'medium', 'high');

CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Pricing
    weekly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    purchase_price DECIMAL(10, 2),
    purchase_date DATE,
    
    -- Status
    status tool_status NOT NULL DEFAULT 'available',
    
    -- Maintenance tracking
    maintenance_importance maintenance_importance NOT NULL DEFAULT 'low',
    maintenance_interval INTEGER, -- in months
    last_maintenance_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_tools_title ON tools(title);

-- =====================================================
-- TOOL IMAGES TABLE (1:N relationship)
-- =====================================================
CREATE TABLE tool_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL, -- URL to S3/Cloud storage
    file_name VARCHAR(255),
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tool_images_tool ON tool_images(tool_id);

-- =====================================================
-- TOOL DOCUMENTS TABLE (1:N relationship)
-- =====================================================
CREATE TYPE document_type AS ENUM ('invoice', 'manual', 'ce_cert', 'other');

CREATE TABLE tool_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type document_type NOT NULL DEFAULT 'other',
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tool_documents_tool ON tool_documents(tool_id);
CREATE INDEX idx_tool_documents_type ON tool_documents(type);

-- =====================================================
-- TOOL CONDITIONS TABLE (Maintenance history - 1:N)
-- =====================================================
CREATE TABLE tool_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL, -- References users table
    status_at_time tool_status NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tool_conditions_tool ON tool_conditions(tool_id);
CREATE INDEX idx_tool_conditions_date ON tool_conditions(created_at DESC);

-- =====================================================
-- CONDITION ATTACHMENTS TABLE (1:N with conditions)
-- =====================================================
CREATE TABLE condition_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition_id UUID NOT NULL REFERENCES tool_conditions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_condition_attachments_condition ON condition_attachments(condition_id);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS for common queries
-- =====================================================
CREATE VIEW tools_with_details AS
SELECT 
    t.*,
    c.name as category_name,
    (SELECT COUNT(*) FROM tool_images ti WHERE ti.tool_id = t.id) as image_count,
    (SELECT COUNT(*) FROM tool_documents td WHERE td.tool_id = t.id) as document_count,
    (SELECT COUNT(*) FROM tool_conditions tc WHERE tc.tool_id = t.id) as condition_count
FROM tools t
LEFT JOIN categories c ON t.category_id = c.id;

-- =====================================================
-- RENTALS TABLE (Locations)
-- =====================================================
CREATE TYPE rental_status AS ENUM ('pending', 'active', 'completed', 'late', 'rejected');

CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References users table
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE RESTRICT,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_return_date DATE,
    
    -- Status & Pricing
    status rental_status NOT NULL DEFAULT 'pending',
    total_price DECIMAL(10, 2),
    
    -- Return info
    return_comment TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_rentals_user ON rentals(user_id);
CREATE INDEX idx_rentals_tool ON rentals(tool_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);

CREATE TRIGGER update_rentals_updated_at
    BEFORE UPDATE ON rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RENTAL HISTORY TABLE (Action logs)
-- =====================================================
CREATE TYPE rental_action AS ENUM ('created', 'approved', 'rejected', 'returned', 'overdue_notified', 'price_adjusted');

CREATE TABLE rental_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL, -- References users table
    action rental_action NOT NULL,
    comment TEXT,
    metadata JSONB, -- Additional data (price changes, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rental_history_rental ON rental_history(rental_id);
CREATE INDEX idx_rental_history_date ON rental_history(created_at DESC);

-- =====================================================
-- VIEW: Rentals with details
-- =====================================================
CREATE VIEW rentals_with_details AS
SELECT 
    r.*,
    t.title as tool_title,
    t.weekly_price as tool_weekly_price,
    (SELECT COUNT(*) FROM rental_history rh WHERE rh.rental_id = r.id) as history_count
FROM rentals r
LEFT JOIN tools t ON r.tool_id = t.id;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- INSERT INTO categories (name) VALUES 
--     ('Outillage'),
--     ('Électroportatif'),
--     ('Jardinage'),
--     ('Plomberie'),
--     ('Menuiserie');
