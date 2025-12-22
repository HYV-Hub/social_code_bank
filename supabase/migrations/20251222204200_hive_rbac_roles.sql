-- Location: supabase/migrations/20251222204200_hive_rbac_roles.sql
-- Schema Analysis: PARTIAL_EXISTS - hive_members table and hive_member_role enum exist
-- Integration Type: Extension - Adding editor and viewer roles
-- Dependencies: hives, hive_members, user_profiles

-- 1. Extend hive_member_role ENUM to include editor and viewer
ALTER TYPE public.hive_member_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE public.hive_member_role ADD VALUE IF NOT EXISTS 'viewer';

-- 2. Create function to check if user can manage hive roles
CREATE OR REPLACE FUNCTION public.can_manage_hive_roles(hive_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.hive_members hm
    WHERE hm.hive_id = hive_uuid
    AND hm.user_id = auth.uid()
    AND hm.role IN ('owner', 'admin')
)
$$;

-- 3. Update RLS policies for hive_members to support role management
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "admins_can_manage_members" ON public.hive_members;

-- Recreate with proper role-based access
CREATE POLICY "admins_can_update_member_roles"
ON public.hive_members
FOR UPDATE
TO authenticated
USING (
    -- Can update if:
    -- 1. User is owner or admin of the hive
    -- 2. NOT trying to change owner role
    -- 3. NOT changing own role
    public.can_manage_hive_roles(hive_id)
    AND role != 'owner'
    AND user_id != auth.uid()
)
WITH CHECK (
    -- Same checks for the new values
    public.can_manage_hive_roles(hive_id)
    AND role != 'owner'
    AND user_id != auth.uid()
);

CREATE POLICY "owners_can_delete_members"
ON public.hive_members
FOR DELETE
TO authenticated
USING (
    -- Only owners can remove members
    EXISTS (
        SELECT 1 FROM public.hive_members owner_check
        WHERE owner_check.hive_id = hive_members.hive_id
        AND owner_check.user_id = auth.uid()
        AND owner_check.role = 'owner'
    )
    AND role != 'owner'  -- Cannot remove owners
);

-- 4. Create function to validate role hierarchy
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    changer_role public.hive_member_role;
BEGIN
    -- Get the role of the person making the change
    SELECT role INTO changer_role
    FROM public.hive_members
    WHERE hive_id = NEW.hive_id
    AND user_id = auth.uid();

    -- Owners can do anything except change their own role
    IF changer_role = 'owner' THEN
        IF NEW.user_id = auth.uid() AND OLD.role = 'owner' THEN
            RAISE EXCEPTION 'Owners cannot change their own role';
        END IF;
        RETURN NEW;
    END IF;

    -- Admins can only manage editor, viewer, and member roles
    IF changer_role = 'admin' THEN
        IF NEW.role IN ('owner', 'admin') OR OLD.role IN ('owner', 'admin') THEN
            RAISE EXCEPTION 'Admins cannot modify owner or admin roles';
        END IF;
        RETURN NEW;
    END IF;

    -- Others cannot change roles
    RAISE EXCEPTION 'Insufficient permissions to change roles';
END;
$$;

-- 5. Create trigger to enforce role hierarchy
DROP TRIGGER IF EXISTS enforce_role_hierarchy ON public.hive_members;
CREATE TRIGGER enforce_role_hierarchy
    BEFORE UPDATE OF role ON public.hive_members
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_role_change();

-- 6. Add comment to document role permissions
COMMENT ON TYPE public.hive_member_role IS '
Role-based access control for hive members:
- owner: Full control, can delete hive, manage all members and roles
- admin: Can manage members (except owner/admin roles), moderate content, manage settings
- editor: Can create/edit snippets and collections, comment, like
- viewer: Read-only access, can view content, like, and comment
- member: Default role, can contribute snippets and participate in discussions

Role hierarchy: owner > admin > editor > member > viewer
';