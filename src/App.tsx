import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/HomePage";
import CustomCursor from "./components/CustomCursor";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import CareerDashboard from "./pages/CareerDashborad";
import ASHroute from "./components/ASHroute";
import NotFound404 from "./pages/NotFound";
import PersonalDashboard from "./pages/PersonalDashboard";



function App() {

  
  return (
    <div>
      <CustomCursor />
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/career" element={<ASHroute><CareerDashboard /></ASHroute>}/>
          <Route path="/personal" element={<ASHroute><PersonalDashboard /></ASHroute>}/>
          <Route path="/*" element={<NotFound404 />}/>
        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;