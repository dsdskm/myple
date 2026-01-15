import { Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./view/LoginPage";
import MapPage from "./view/PlaceMapPage";
import PlaceEditPage from "./view/PlaceEditPage";
import { ROUTES } from "./common/constants";
import PlaceListPage from "./view/PlaceListPage";
import MyPage from "./view/MyPage";
import { useApp } from "./context/AppContext";
import { useEffect } from "react";
import PlaceHistoryEditPage from "./view/PlaceHistoryEditPage";

function App() {
  const { account } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!account.id) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [account, navigate])
  return (
    <div className="App">
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.MAP} element={<MapPage />} />
        <Route path={ROUTES.PLACE_LIST} element={<PlaceListPage />} />
        <Route path={ROUTES.PLACE_EDIT} element={<PlaceEditPage />} />
        <Route path={ROUTES.PLACE_HISTORY_EDIT} element={<PlaceHistoryEditPage />} />
        <Route path={ROUTES.MY} element={<MyPage />} />
      </Routes>
    </div>
  );
}

export default App;
