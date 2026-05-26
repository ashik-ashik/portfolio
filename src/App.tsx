import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/HomePage";
// import CustomCursor from "./components/CustomCursor";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import CareerDashboard from "./pages/CareerDashborad";
import ASHroute from "./components/ASHroute";
import NotFound404 from "./pages/NotFound";
import PersonalDashboard from "./pages/PersonalDashboard";
import useAuth from "./hooks/useAuth";
import AvailableJobListsToApply from "./pages/AvailableJobListsToApply";
import RainCanvas from "./components/RainBackground";



function App() {
const {user} = useAuth();
  
  return (
    <div>
      {/* <CustomCursor /> */}
      <RainCanvas />
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />}/>
          <Route path={`${user && !user.email ? '/login' : '/account'}`} element={<LoginPage />}/>
          <Route path="/career" element={<ASHroute><CareerDashboard /></ASHroute>}/>
          <Route path="/personal" element={<ASHroute><PersonalDashboard /></ASHroute>}/>
          <Route path="/apply-korte-hobe" element={<AvailableJobListsToApply />}/>
          <Route path="/*" element={<NotFound404 />}/>
        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;