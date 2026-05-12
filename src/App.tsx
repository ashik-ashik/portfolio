import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/HomePage";
import CustomCursor from "./components/CustomCursor";
import LoginPage from "./pages/LoginPage";



function App() {

  
  return (
    <div>
      <CustomCursor />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />}/>
          <Route path="/login" element={<LoginPage />}/>
        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;