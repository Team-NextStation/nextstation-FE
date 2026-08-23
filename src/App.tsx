import { Component, lazy, Suspense, type ReactNode } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  type Location,
} from "react-router-dom";
import BaseLoading from "@/components/BaseLoading";
import { AuthProvider } from "@/contexts/auth";
import { LogDraftProvider } from "@/pages/course/contexts/LogDraftContext";
import "react-toastify/dist/ReactToastify.css";
import Toast from "@/pages/course/components/Toast";
import GoogleAnalyticsTracker from "@/components/GoogleAnalyticsTracker";

const SplashPage = lazy(() => import("@/pages/SplashPage"));
const MainPage = lazy(() => import("@/pages/MainPage"));
const ErrorPage = lazy(() => import("@/pages/ErrorPage"));

// auth pages
const FinishPage = lazy(() => import("@/pages/auth/FinishPage"));
const KakaoCallbackPage = lazy(() => import("@/pages/auth/KakaoCallbackPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const PasswordResetPage = lazy(() => import("@/pages/auth/PasswordResetPage"));
const ProfileSetupPage = lazy(() => import("@/pages/auth/ProfileSetupPage"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage"));
const TermsAgreementPage = lazy(
  () => import("@/pages/auth/TermsAgreementPage"),
);
const TermDetailPage = lazy(() => import("@/pages/auth/TermDetailPage"));
const WelcomePage = lazy(() => import("@/pages/auth/WelcomePage"));

// draw pages
const ConditionPage = lazy(() => import("@/pages/draw/ConditionPage"));
const LoadingPage = lazy(() => import("@/pages/draw/LoadingPage"));
const PreferencePage = lazy(() => import("@/pages/draw/PreferencePage"));
const RecommendPage = lazy(() => import("@/pages/draw/RecommendPage"));
const ResultPage = lazy(() => import("@/pages/draw/ResultPage"));

// course pages
const CourseMainPage = lazy(() => import("@/pages/course/MainPage"));
const CourseDetailPage = lazy(() => import("@/pages/course/DetailPage"));
const CreatePage = lazy(() => import("@/pages/course/CreatePage"));
const LogIntroPage = lazy(() => import("@/pages/course/LogIntroPage"));
const LogInfoPage = lazy(() => import("@/pages/course/LogInfoPage"));
const LogPlacePage = lazy(() => import("@/pages/course/LogPlacePage"));
const LogVisibilityPage = lazy(
  () => import("@/pages/course/LogVisibilityPage"),
);
const LikePage = lazy(() => import("@/pages/course/LikePage"));
const SavedPage = lazy(() => import("@/pages/course/SavedPage"));
const StampAcquiredPage = lazy(
  () => import("@/pages/course/StampAcquiredPage"),
);
const VerifyPage = lazy(() => import("@/pages/course/VerifyPage"));

// explore pages
const ExplorePage = lazy(() => import("@/pages/explore/ExplorePage"));
const PopularCoursesPage = lazy(
  () => import("@/pages/explore/PopularCoursesPage"),
);
const ConceptToursPage = lazy(() => import("@/pages/explore/ConceptToursPage"));
const ConceptDetailPage = lazy(
  () => import("@/pages/explore/ConceptDetailPage"),
);
const SearchResultsPage = lazy(
  () => import("@/pages/explore/SearchResultsPage"),
);
const LineCoursesPage = lazy(() => import("@/pages/explore/LineCoursesPage"));

// place pages
const DetailPage = lazy(() => import("./pages/place/DetailPage"));
const ReviewListPage = lazy(() => import("./pages/place/ReviewListPage"));

function RouteFallback() {
  return <BaseLoading />;
}

// mypage
const MyPage = lazy(() => import("@/pages/mypage/MyPage"));
const ProfileEditPage = lazy(() => import("@/pages/mypage/ProfileEditPage"));
const UserPage = lazy(() => import("@/pages/mypage/UserPage"));
const UnwrittenJournalListPage = lazy(
  () => import("@/pages/mypage/UnwrittenJournalListPage"),
);

interface RouteErrorBoundaryProps {
  children: ReactNode;
  location: Location;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: RouteErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.location.pathname !== this.props.location.pathname
    ) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}

function AppRoutes() {
  const location = useLocation();

  return (
    <RouteErrorBoundary location={location}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/error" element={<ErrorPage />} />

        {/* auth */}
        <Route path="/auth" element={<WelcomePage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route
          path="/auth/kakao/callback"
          element={<KakaoCallbackPage />}
        />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/auth/terms" element={<TermsAgreementPage />} />
        <Route path="/auth/terms/:type" element={<TermDetailPage />} />
        <Route
          path="/auth/reset-password"
          element={<PasswordResetPage />}
        />
        <Route path="/auth/profile" element={<ProfileSetupPage />} />
        <Route path="/auth/finish" element={<FinishPage />} />

        {/* draw */}
        <Route path="/draw/loading" element={<LoadingPage />} />
        <Route path="/draw/result" element={<ResultPage />} />
        <Route path="/draw/recommend" element={<RecommendPage />} />
        <Route path="/draw/condition" element={<ConditionPage />} />
        <Route path="/draw/preference" element={<PreferencePage />} />

        {/* course */}
        <Route path="/course" element={<CourseMainPage />} />
        <Route path="/course/like" element={<LikePage />} />
        <Route
          path="/course/:stationId/create"
          element={<CreatePage />}
        />
        <Route
          path="/course/:courseId?/verify"
          element={<VerifyPage />}
        />
        <Route
          path="/course/share/:shareToken/verify"
          element={<VerifyPage />}
        />
        <Route path="/course/saved" element={<SavedPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        <Route
          path="/course/:courseId/stamp"
          element={<StampAcquiredPage />}
        />
        <Route path="/course/:courseId/log" element={<LogIntroPage />} />
        <Route
          path="/course/:courseId/log/info"
          element={<LogInfoPage />}
        />
        <Route
          path="/course/:courseId/log/place"
          element={<LogPlacePage />}
        />
        <Route
          path="/course/:courseId/log/visibility"
          element={<LogVisibilityPage />}
        />

        {/* explore */}
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/popular" element={<PopularCoursesPage />} />
        <Route path="/explore/concepts" element={<ConceptToursPage />} />
        <Route
          path="/explore/concepts/:conceptId"
          element={<ConceptDetailPage />}
        />
        <Route path="/explore/search" element={<SearchResultsPage />} />
        <Route path="/explore/lines" element={<LineCoursesPage />} />

        {/* place */}
        <Route path="/place/:placeId" element={<DetailPage />} />
        <Route
          path="/place/:placeId/reviews"
          element={<ReviewListPage />}
        />

        {/* mypage */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/edit" element={<ProfileEditPage />} />
        <Route
          path="/profile/:memberId"
          element={<UserPage />}
        />
        <Route
          path="/mypage/journal/unwritten"
          element={<UnwrittenJournalListPage />}
        />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

function App() {
  return (
    <LogDraftProvider>
      <AuthProvider>
        <BrowserRouter>
          <GoogleAnalyticsTracker />
          <AppRoutes />
          <Toast />
        </BrowserRouter>
      </AuthProvider>
    </LogDraftProvider>
  );
}

export default App;
