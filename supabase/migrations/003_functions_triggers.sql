-- Migration: Functions and Triggers
-- Description: Creates utility functions and triggers for automation

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate order numbers (ORD-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_number INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';
    
    sequence_part := LPAD(next_number::TEXT, 4, '0');
    
    RETURN 'ORD-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice numbers (INV-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_number INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-%';
    
    sequence_part := LPAD(next_number::TEXT, 4, '0');
    
    RETURN 'INV-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-populate profile from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (
        id,
        full_name,
        phone,
        dob,
        gender,
        account_type,
        company_name,
        tax_number,
        address,
        city
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE((NEW.raw_user_meta_data->>'dob')::DATE, '1990-01-01'::DATE),
        NEW.raw_user_meta_data->>'gender',
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'tax_number',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'city'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(total), 0)
    INTO total
    FROM order_items
    WHERE order_id = order_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_uuid UUID)
RETURNS TABLE(subtotal DECIMAL(10,2), tax_amount DECIMAL(10,2), total_amount DECIMAL(10,2)) AS $$
DECLARE
    invoice_tax_rate DECIMAL(5,2);
    invoice_subtotal DECIMAL(10,2);
    invoice_tax_amount DECIMAL(10,2);
    invoice_total_amount DECIMAL(10,2);
BEGIN
    -- Get subtotal from invoice items
    SELECT COALESCE(SUM(total), 0)
    INTO invoice_subtotal
    FROM invoice_items
    WHERE invoice_id = invoice_uuid;
    
    -- Get tax rate from invoice
    SELECT tax_rate
    INTO invoice_tax_rate
    FROM invoices
    WHERE id = invoice_uuid;
    
    -- Calculate tax amount
    invoice_tax_amount := invoice_subtotal * (invoice_tax_rate / 100);
    
    -- Calculate total amount
    invoice_total_amount := invoice_subtotal + invoice_tax_amount;
    
    RETURN QUERY SELECT invoice_subtotal, invoice_tax_amount, invoice_total_amount;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for auto-generating order numbers
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION generate_order_number();

-- Create trigger for auto-generating invoice numbers
CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();

-- Create trigger for auto-populating profiles
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create trigger to update order total when items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
DECLARE
    order_uuid UUID;
BEGIN
    -- Get the order_id from the trigger context
    IF TG_OP = 'DELETE' THEN
        order_uuid := OLD.order_id;
    ELSE
        order_uuid := NEW.order_id;
    END IF;
    
    -- Update the order total
    UPDATE orders
    SET total_amount = calculate_order_total(order_uuid)
    WHERE id = order_uuid;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();

-- Create trigger to update invoice totals when items change
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    invoice_uuid UUID;
    totals RECORD;
BEGIN
    -- Get the invoice_id from the trigger context
    IF TG_OP = 'DELETE' THEN
        invoice_uuid := OLD.invoice_id;
    ELSE
        invoice_uuid := NEW.invoice_id;
    END IF;
    
    -- Calculate totals
    SELECT * INTO totals FROM calculate_invoice_totals(invoice_uuid);
    
    -- Update the invoice totals
    UPDATE invoices
    SET 
        subtotal = totals.subtotal,
        tax_amount = totals.tax_amount,
        total_amount = totals.total_amount
    WHERE id = invoice_uuid;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- Add comments for documentation
COMMENT ON FUNCTION generate_order_number() IS 'Generates unique order numbers in format ORD-YYYY-NNNN';
COMMENT ON FUNCTION generate_invoice_number() IS 'Generates unique invoice numbers in format INV-YYYY-NNNN';
COMMENT ON FUNCTION handle_new_user() IS 'Auto-populates profile when new user is created in auth.users';
COMMENT ON FUNCTION calculate_order_total(UUID) IS 'Calculates total amount for an order from its items';
COMMENT ON FUNCTION calculate_invoice_totals(UUID) IS 'Calculates subtotal, tax, and total for an invoice';
