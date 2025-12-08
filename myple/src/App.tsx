import { Route, Routes } from "react-router-dom";
import LoginPage from "./view/LoginPage";
import MapPage from "./view/MapPage";
import PlaceEditPage from "./view/PlaceEditPage";
import { ROUTES } from "./common/constants";
import PlaceDetailPage from "./view/PlaceDetailPage";
import PlaceListPage from "./view/PlaceListPage";

function App() {
  return (
    <div className="App">
      <Routes>     
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.MAP} element={<MapPage />} />
        <Route path={ROUTES.PLACE_LIST} element={<PlaceListPage />} />
        <Route path={ROUTES.PLACE_DETAIL} element={<PlaceDetailPage />} />
        <Route path={ROUTES.PLACE_EDIT} element={<PlaceEditPage />} />
      </Routes>
    </div>
  );
}

export default App;
