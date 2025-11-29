# Bilfora Database Setup Guide

This guide will help you set up the database schema for the Bilfora invoicing application.

## Prerequisites

-   Supabase account and project
-   Supabase CLI installed (optional but recommended)
-   Access to your Supabase project dashboard

## Database Schema Overview

The application uses the following main tables:

-   **profiles**: User profile information extending auth.users
-   **clients**: Customer/client management
-   **orders**: Order management with line items
-   **order_items**: Line items for orders
-   **invoices**: Invoice management with tax calculations
-   **invoice_items**: Line items for invoices

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the migration files in order:**

    ```sql
    -- Run 001_initial_schema.sql
    -- This creates all tables, indexes, and constraints
    ```

    ```sql
    -- Run 002_rls_policies.sql
    -- This enables Row Level Security and creates policies
    ```

    ```sql
    -- Run 003_functions_triggers.sql
    -- This creates utility functions and triggers
    ```

    ```sql
    -- Run 004_invoice_totals_and_pdf.sql
    -- Run 005_products.sql
    -- Run 006_fix_registration_constraints.sql
    ```

    ```sql
    -- Run 007_storage_bucket.sql
    -- This creates the avatars storage bucket and policies
    ```

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed):

    ```bash
    npm install -g supabase
    ```

2. **Login to Supabase**:

    ```bash
    supabase login
    ```

3. **Link your project**:

    ```bash
    supabase link --project-ref YOUR_PROJECT_REF
    ```

4. **Run migrations**:
    ```bash
    supabase db push
    ```

## Migration Files Explained

### 001_initial_schema.sql

-   Creates all database tables with proper types and constraints
-   Sets up foreign key relationships
-   Adds indexes for performance
-   Includes business logic constraints

### 002_rls_policies.sql

-   Enables Row Level Security (RLS) on all tables
-   Creates policies ensuring users can only access their own data
-   Implements proper security for multi-tenant architecture

### 003_functions_triggers.sql

-   Auto-generates order and invoice numbers
-   Auto-populates profile when new user registers
-   Updates timestamps automatically
-   Calculates totals for orders and invoices

### 007_storage_bucket.sql

-   Creates the `avatars` storage bucket
-   Enables public read access for avatars
-   Configures security policies for uploads and updates

## Key Features

### Automatic Features

-   **Order Numbers**: Auto-generated in format `ORD-YYYY-NNNN`
-   **Invoice Numbers**: Auto-generated in format `INV-YYYY-NNNN`
-   **Profile Creation**: Automatically creates profile when user registers
-   **Total Calculations**: Automatically calculates order and invoice totals
-   **Timestamp Updates**: Automatically updates `updated_at` fields

### Security Features

-   **Row Level Security**: Users can only see their own data
-   **Data Isolation**: Complete separation between different users
-   **Secure Policies**: Comprehensive CRUD policies for all tables

### Performance Features

-   **Optimized Indexes**: Indexes on frequently queried columns
-   **Efficient Queries**: Optimized for common operations
-   **Scalable Design**: Designed to handle growth

## Verification

After running the migrations, verify the setup:

1. **Check Tables**: Ensure all tables are created
2. **Test RLS**: Try accessing data from different users
3. **Test Triggers**: Create a test order/invoice to verify auto-generation
4. **Test Functions**: Verify total calculations work correctly

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure you have admin access to the Supabase project
2. **Migration Order**: Always run migrations in the correct order (001, 002, 003)
3. **RLS Issues**: Check that policies are properly created and enabled
4. **Trigger Errors**: Verify that functions are created before triggers

### Getting Help

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correct
3. Ensure your Supabase project is properly configured
4. Check that all dependencies are installed

## Next Steps

After setting up the database:

1. **Update Environment Variables**: Ensure your `.env.local` has correct Supabase credentials
2. **Test the Application**: Run the application and test all features
3. **Create Test Data**: Add some sample clients, orders, and invoices
4. **Verify Functionality**: Test all CRUD operations

## Database Schema Diagram

```
auth.users (Supabase Auth)
    ↓
profiles (extends user info)
    ↓
clients (belongs to profile)
    ↓
orders (belongs to profile, references client)
    ↓
order_items (belongs to order)
    ↓
invoices (belongs to profile, references client & order)
    ↓
invoice_items (belongs to invoice)
```

## Support

For additional support or questions about the database setup, please refer to:

-   Supabase Documentation
-   The application's README.md
-   Database migration files for reference
