import { Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./view/LoginPage";
import MapPage from "./view/PlaceMapPage";
import PlaceEditPage from "./view/PlaceEditPage";
import { ROUTES } from "./common/constants";
import PlaceListPage from "./view/PlaceListPage";
import MyPage from "./view/MyPage";
import PlaceHistoryEditPage from "./view/PlaceHistoryEditPage";
import ItemPage from "./view/ItemPage";
import IntroPage from "./view/IntroPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={ROUTES.INTRO} element={<IntroPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.MAP} element={<MapPage />} />
        <Route path={ROUTES.PLACE_LIST} element={<PlaceListPage />} />
        <Route path={ROUTES.PLACE_EDIT} element={<PlaceEditPage />} />
        <Route path={ROUTES.PLACE_HISTORY_EDIT} element={<PlaceHistoryEditPage />} />
        <Route path={ROUTES.MY} element={<MyPage />} />
        <Route path={ROUTES.ITEM} element={<ItemPage />} />
      </Routes>
    </div>
  );
}

export default App;
