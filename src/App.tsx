import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/HomePage";
import CustomCursor from "./components/CustomCursor";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import CareerDashboard from "./pages/CareerDashborad";



function App() {

  
  return (
    <div>
      <CustomCursor />
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/career" element={<CareerDashboard />}/>
        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;