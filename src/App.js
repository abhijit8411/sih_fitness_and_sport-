import {
  Routes,
  Route,
  useNavigationType,
  useLocation
} from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { useEffect } from "react";

import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/Signup";

import Main from "./Main";
import DeveloperCard from "./components/DeveloperCard";
import Combat from "./Combat";
import { Profile } from "./components/Profile";
import PageNotFound from "./components/PageNotFound";
import UpdateProfile from "./components/UpdateProfile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./PrivateRoutes";
import TrainGround from "./components/TrainGround";

// New FitVerse AI Components
import AssessmentFlow from "./components/fitnessdna/AssessmentFlow";
import FitnessDNAResults from "./components/fitnessdna/FitnessDNAResults";
import MovementCoach from "./components/coach/MovementCoach";
import QuickFit from "./components/quickfit/QuickFit";
import DemoMode from "./components/demo/DemoMode";
import AIChatWidget from "./components/chat/AIChatWidget";
import NutritionHub from "./components/nutrition/NutritionHub";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import ProgressTracker from "./components/progress/ProgressTracker";

function App() {
  const [auth, setAuth] = useAuth();
  // console.log(" user auth", auth);
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "Fitness & Sport — AI-Powered Fitness";
        metaDescription = "Fitness & Sport is an AI-powered fitness app with personalized training.";
        break;
      case "/login":
        title = "Login — Fitness & Sport";
        break;
      case "/signup":
        title = "Sign Up — Fitness & Sport";
        break;
      case "/main":
        title = "Dashboard — Fitness & Sport";
        break;
      default:
        title = "Fitness & Sport";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);
  return (
    <>
      <AIChatWidget />
      <Routes>
      {/* <AuthProvider> */}
            {/* <Route element={ <PrivateRoute/> }> */}
            <Route exact path="/combat" element={<Combat />} />
                <Route exact path="/main" element={<Main />} />
                <Route exact path="/profile" element={<Profile />} />
                <Route exact path="/update-profile" element={<UpdateProfile />} />
            {/* </Route> */}

            <Route path="/" element={<HomePage auth={auth} />}  />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/train/:exercise" element={<TrainGround />} />
            
            {/* FitVerse AI Routes */}
            <Route path="/fitness-dna" element={<AssessmentFlow />} />
            <Route path="/fitness-dna/results" element={<FitnessDNAResults />} />
            <Route path="/movement-coach" element={<MovementCoach />} />
            <Route path="/quick-fit" element={<QuickFit />} />
            <Route path="/demo" element={<NutritionHub />} />
            <Route path="/nutrition" element={<NutritionHub />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/progress" element={<ProgressTracker />} />

    </Routes>
    </>
  );
}
export default App;