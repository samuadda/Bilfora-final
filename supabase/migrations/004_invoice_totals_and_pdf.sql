-- Totals, PDF URL and workflow timestamps for invoices
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS subtotal numeric(12,2),
  ADD COLUMN IF NOT EXISTS vat_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS total_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Function to recalculate invoice totals based on items
CREATE OR REPLACE FUNCTION public.recalc_invoice_totals(inv_id uuid)
RETURNS void AS $$
DECLARE
  v_subtotal numeric(12,2) := 0;
  v_tax_rate numeric := 0;
BEGIN
  SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)
  INTO v_subtotal
  FROM invoice_items ii
  WHERE ii.invoice_id = inv_id;

  SELECT COALESCE(tax_rate, 0) INTO v_tax_rate FROM invoices WHERE id = inv_id;

  UPDATE invoices
  SET subtotal = v_subtotal,
      vat_amount = v_subtotal * (v_tax_rate / 100.0),
      total_amount = v_subtotal * (1 + (v_tax_rate / 100.0))
  WHERE id = inv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Wrapper trigger function to call recalc when items change
CREATE OR REPLACE FUNCTION public.trigger_recalc_invoice_totals()
RETURNS trigger AS $$
DECLARE
  target_id uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    target_id := OLD.invoice_id;
  ELSE
    target_id := NEW.invoice_id;
  END IF;
  PERFORM public.recalc_invoice_totals(target_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invoice_items_recalc ON invoice_items;
CREATE TRIGGER trg_invoice_items_recalc
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW EXECUTE PROCEDURE public.trigger_recalc_invoice_totals();


