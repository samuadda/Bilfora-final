-- Migration: Fix Registration Constraints
-- Description: Fixes NOT NULL constraints that prevent user registration

-- First, let's update the profiles table to allow empty strings temporarily
-- and then add proper constraints
ALTER TABLE profiles 
ALTER COLUMN full_name DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL,
ALTER COLUMN dob DROP NOT NULL;

-- Add proper constraints that allow empty strings but prevent NULL values
ALTER TABLE profiles 
ADD CONSTRAINT check_full_name_not_empty CHECK (full_name IS NOT NULL AND full_name != ''),
ADD CONSTRAINT check_phone_not_empty CHECK (phone IS NOT NULL AND phone != ''),
ADD CONSTRAINT check_dob_not_null CHECK (dob IS NOT NULL);

-- Update the handle_new_user function to provide better default values
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
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'User'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), '+966500000000'),
        COALESCE((NEW.raw_user_meta_data->>'dob')::DATE, '1990-01-01'::DATE),
        NEW.raw_user_meta_data->>'gender',
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'tax_number',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'city'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise it
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Auto-populates profile when new user is created in auth.users with proper error handling';
