-- Drop existing policies
DROP POLICY IF EXISTS "users_manage_own_snippet_reviews" ON snippet_reviews;
DROP POLICY IF EXISTS "snippet_authors_view_reviews" ON snippet_reviews;

-- Policy 1: Reviewers can manage their assigned reviews
CREATE POLICY "reviewers_manage_assigned_reviews"
ON snippet_reviews
FOR ALL
TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- Policy 2: Snippet authors can view reviews of their snippets
CREATE POLICY "snippet_authors_view_reviews"
ON snippet_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM snippets s
    WHERE s.id = snippet_reviews.snippet_id
    AND s.user_id = auth.uid()
  )
);

-- Policy 3: Team members can view reviews for their team's snippets
CREATE POLICY "team_members_view_team_reviews"
ON snippet_reviews
FOR SELECT
TO authenticated
USING (
  team_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM snippets s
    WHERE s.id = snippet_reviews.snippet_id
    AND s.team_id = team_id
  )
);

-- Policy 4: Company admins can view all reviews for their company's snippets
CREATE POLICY "company_admins_view_company_reviews"
ON snippet_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN snippets s ON s.id = snippet_reviews.snippet_id
    WHERE up.id = auth.uid()
    AND up.role IN ('company_admin', 'super_admin')
    AND s.company_id = up.company_id
  )
);

-- Policy 5: Allow public reviews to be viewed by anyone authenticated
CREATE POLICY "public_reviews_viewable_by_authenticated"
ON snippet_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM snippets s
    WHERE s.id = snippet_reviews.snippet_id
    AND s.visibility = 'public'
  )
);