import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
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
import Features from './pages/features';

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
import CompanyCreation from './pages/company-creation';
import SessionManagement from './pages/session-management';
import InboxPage from './pages/inbox';
import ForYouFeed from './pages/feed';
import TrendingPage from './pages/trending';
import ChallengesPage from './pages/challenges';
import SnippetSeriesPage from './pages/snippet-series';

const BillingSubscriptionPage = React.lazy(() => import("pages/billing-subscription"));

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

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
          <Route path="/features" element={<Features />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/enterprise-signup" element={<EnterpriseSignup />} />
          <Route path="/invite-acceptance" element={<InviteAcceptance />} />

          {/* Protected routes */}
          <Route path="/search-results" element={<P><SearchResults /></P>} />
          <Route path="/create-snippet" element={<P><CreateSnippet /></P>} />
          <Route path="/company-dashboard" element={<P><CompanyDashboard /></P>} />
          <Route path="/company-teams-page" element={<P><CompanyTeamsPage /></P>} />
          <Route path="/company-feed" element={<P><CompanyFeed /></P>} />
          <Route path="/company-management-dashboard" element={<P><CompanyManagementDashboard /></P>} />
          <Route path="/member-invitation-system" element={<P><MemberInvitationSystem /></P>} />
          <Route path="/bug-board" element={<P><BugBoard /></P>} />
          <Route path="/team-chat" element={<P><TeamChat /></P>} />
          <Route path="/user-dashboard" element={<P><UserDashboard /></P>} />
          <Route path="/snippet-details" element={<P><SnippetDetails /></P>} />
          <Route path="/user-profile" element={<P><UserProfile /></P>} />
          <Route path="/profile-editor" element={<P><ProfileEditor /></P>} />
          <Route path="/notifications" element={<P><Notifications /></P>} />
          <Route path="/inbox" element={<P><InboxPage /></P>} />
          <Route path="/feed" element={<P><ForYouFeed /></P>} />
          <Route path="/trending" element={<P><TrendingPage /></P>} />
          <Route path="/ai-optimization-report" element={<P><AIOptimizationReport /></P>} />
          <Route path="/ai-style-match-page" element={<P><AIStyleMatchPage /></P>} />
          <Route path="/snippet-collections" element={<P><SnippetCollections /></P>} />
          <Route path="/collection-details" element={<P><CollectionDetails /></P>} />
          <Route path="/code-review-workflow" element={<P><CodeReviewWorkflow /></P>} />
          <Route path="/billing" element={<P><React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}><BillingSubscriptionPage /></React.Suspense></P>} />
          <Route path="/onboarding" element={<P><OnboardingPage /></P>} />
          <Route path="/settings" element={<P><SettingsPage /></P>} />
          <Route path="/help-center" element={<P><HelpCenterPage /></P>} />
          <Route path="/user-preferences" element={<P><UserPreferences /></P>} />
          <Route path="/documentation-hub" element={<P><DocumentationHub /></P>} />
          <Route path="/member-management-center" element={<P><MemberManagementCenter /></P>} />
          <Route path="/teams-landing-page" element={<P><TeamsLandingPage /></P>} />
          <Route path="/team-dashboard" element={<P><TeamDashboard /></P>} />
          <Route path="/company-creation" element={<P><CompanyCreation /></P>} />
          <Route path="/session-management" element={<P><SessionManagement /></P>} />

          {/* Global Hives Routes */}
          <Route path="/hives" element={<P><TeamsLandingPage /></P>} />
          <Route path="/hives/:hiveId" element={<P><HiveExplorer /></P>} />
          <Route path="/hive-creation-wizard" element={<P><HiveCreationWizard /></P>} />
          <Route path="/hive-explorer" element={<P><HiveExplorer /></P>} />
          <Route path="/global-explore-feed" element={<P><GlobalExploreFeed /></P>} />
          <Route path="/advanced-search-interface" element={<P><AdvancedSearchInterface /></P>} />
          <Route path="/community-leaderboards" element={<P><CommunityLeaderboards /></P>} />
          <Route path="/hive-collection/:collectionId" element={<P><HiveCollectionDetail /></P>} />
          <Route path="/hive-explorer/:hiveId" element={<P><HiveExplorer /></P>} />
          <Route path="/hive-collection-detail/:collectionId" element={<P><HiveCollectionDetail /></P>} />
          <Route path="/hive-collections-gallery/:hiveId" element={<P><HiveCollectionsGallery /></P>} />
          <Route path="/global-hives-landing" element={<P><GlobalHivesLanding /></P>} />
          <Route path="/hive-snippet-editor" element={<P><HiveSnippetEditor /></P>} />
          <Route path="/challenges" element={<P><ChallengesPage /></P>} />
          <Route path="/snippet-series" element={<P><SnippetSeriesPage /></P>} />

          {/* Vanity URLs */}
          <Route path="/u/:username" element={<P><UserProfile /></P>} />
          <Route path="/s/:snippetSlug" element={<P><SnippetDetails /></P>} />
          <Route path="/explore/:tagName" element={<P><GlobalExploreFeed /></P>} />

          {/* Catch-all route - MUST be last */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
