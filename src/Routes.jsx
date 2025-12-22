import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import SearchResults from './pages/search-results';
import CreateSnippet from './pages/create-snippet';
import CompanyDashboard from './pages/company-dashboard';
import BugBoard from './pages/bug-board';
import Login from './pages/login';
import PublicHomepage from './pages/public-homepage';
import TeamChat from './pages/team-chat';
import UserDashboard from './pages/user-dashboard';
import SnippetDetails from './pages/snippet-details';
import UserProfile from './pages/user-profile';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/reset-password';
import Notifications from 'pages/notifications';
import InviteAcceptance from 'pages/invite-acceptance';
import AIOptimizationReport from 'pages/ai-optimization-report';
import AIStyleMatchPage from 'pages/ai-style-match-page';
import SnippetCollections from './pages/snippet-collections';
import CollectionDetails from './pages/collection-details';
import CodeReviewWorkflow from "./pages/code-review-workflow";
import Contact from './pages/contact';
import EmailVerification from './pages/email-verification';
import OAuthLogin from './pages/o-auth-login';
import ProfileEditor from './pages/profile-editor';
import AboutUs from './pages/about-us';
import UserPreferences from './pages/user-preferences';
import DocumentationHub from './pages/documentation-hub';
import Pricing from './pages/pricing';
import TermsOfService from './pages/terms-of-service';
import PrivacyPolicy from './pages/privacy-policy';
import EnterpriseSignup from './pages/enterprise-signup';
import OnboardingPage from 'pages/onboarding';
import SettingsPage from 'pages/settings';
import HelpCenterPage from 'pages/help-center';

import HiveCreationWizard from './pages/hive-creation-wizard';
import HiveExplorer from './pages/hive-explorer';
import GlobalExploreFeed from './pages/global-explore-feed';
import AdvancedSearchInterface from './pages/advanced-search-interface';

import CompanyManagementDashboard from './pages/company-management-dashboard';
import MemberInvitationSystem from './pages/member-invitation-system';
import MemberManagementCenter from './pages/member-management-center';
import TeamsLandingPage from './pages/teams-landing-page';
import TeamDashboard from './pages/team-dashboard';
import CompanyTeamsPage from './pages/company-teams-page';
import CompanyFeed from './pages/company-feed';
import CommunityLeaderboards from './pages/community-leaderboards';
import HiveCollectionDetail from './pages/hive-collection-detail';
import GlobalHivesLanding from './pages/global-hives-landing';
import HiveCollectionsGallery from "pages/hive-collections-gallery";
import HiveSnippetEditor from './pages/hive-snippet-editor';

const BillingSubscriptionPage = React.lazy(() => import("pages/billing-subscription"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/" element={<PublicHomepage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/o-auth-login" element={<OAuthLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/enterprise-signup" element={<EnterpriseSignup />} />
          
          {/* Protected/App routes */}
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/create-snippet" element={<CreateSnippet />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/company-teams-page" element={<CompanyTeamsPage />} />
          <Route path="/company-feed" element={<CompanyFeed />} />
          <Route path="/company-management-dashboard" element={<CompanyManagementDashboard />} />
          <Route path="/member-invitation-system" element={<MemberInvitationSystem />} />
          <Route path="/bug-board" element={<BugBoard />} />
          <Route path="/team-chat" element={<TeamChat />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/snippet-details" element={<SnippetDetails />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/profile-editor" element={<ProfileEditor />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/invite-acceptance" element={<InviteAcceptance />} />
          <Route path="/ai-optimization-report" element={<AIOptimizationReport />} />
          <Route path="/ai-style-match-page" element={<AIStyleMatchPage />} />
          <Route path="/snippet-collections" element={<SnippetCollections />} />
          <Route path="/collection-details" element={<CollectionDetails />} />
          <Route path="/code-review-workflow" element={<CodeReviewWorkflow />} />
          <Route path="/billing" element={<BillingSubscriptionPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help-center" element={<HelpCenterPage />} />
          <Route path="/user-preferences" element={<UserPreferences />} />
          <Route path="/documentation-hub" element={<DocumentationHub />} />
          <Route path="/member-management-center" element={<MemberManagementCenter />} />
          <Route path="/teams-landing-page" element={<TeamsLandingPage />} />
          <Route path="/team-dashboard" element={<TeamDashboard />} />
          
          {/* Global Hives Routes (transformed from teams) */}
          <Route path="/hives" element={<TeamsLandingPage />} />
          <Route path="/hives/:hiveId" element={<HiveExplorer />} />
          <Route path="/hive-creation-wizard" element={<HiveCreationWizard />} />
          <Route path="/hive-explorer" element={<HiveExplorer />} />
          <Route path="/global-explore-feed" element={<GlobalExploreFeed />} />
          <Route path="/advanced-search-interface" element={<AdvancedSearchInterface />} />
          
          <Route path="/community-leaderboards" element={<CommunityLeaderboards />} />
          <Route path="/hive-collection/:collectionId" element={<HiveCollectionDetail />} />
          <Route path="/hive-explorer/:hiveId" element={<HiveExplorer />} />
          <Route path="/hive-collection-detail/:collectionId" element={<HiveCollectionDetail />} />
          <Route path="/hive-collections-gallery/:hiveId" element={<HiveCollectionsGallery />} />
          <Route path="/global-hives-landing" element={<GlobalHivesLanding />} />
          <Route path="/hive-snippet-editor" element={<HiveSnippetEditor />} />
          
          {/* Catch-all route - MUST be last */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}