import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StyledEngineProvider from "@mui/material/StyledEngineProvider";
import MapDashboard from "./components/MapDashboard";
import { createGlobalStyle } from "styled-components";
import { ToastContainer } from "react-toastify";
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

function App() {
  return (
    <StyledEngineProvider injectFirst>
    <GlobalStyle />
    <div className="App">
        <ToastContainer hideProgressBar={true}/>
      <Router>
        <Routes>
          <Route path={"/admin/maps"}
          element={ <MapDashboard/>}/>
        </Routes>
      </Router>
  </div>
  </StyledEngineProvider>
  );
}

export default App;
