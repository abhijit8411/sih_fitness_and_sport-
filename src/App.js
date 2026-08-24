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
        title = "FitVerse — AI-Powered Fitness";
        metaDescription = "FitVerse is an AI-powered fitness app with personalized training.";
        break;
      case "/login":
        title = "Login — FitVerse";
        break;
      case "/signup":
        title = "Sign Up — FitVerse";
        break;
      case "/main":
        title = "Dashboard — FitVerse";
        break;
      default:
        title = "FitVerse";
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
            <Route path="/demo" element={<DemoMode />} />

    </Routes>
    </>
  );
}
export default App;