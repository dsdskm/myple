import {
  AlertDialog,
  Button,
  ConfirmDialog,
  FixedBottomCTA,
  List,
  ListRow,
  Menu,
  Post,
  Rating,
  Text,
  TextField,
  Toast,
} from "@toss/tds-mobile";
import { getPlaceLimitText, NETWORK_STATUS, PERMISSIONS, ROUTES, TEXT, TOAST_DURATION_DEFAULT } from "../common/constants";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";
import { roundToFour } from "../common/utils";
import { Accuracy, getCurrentLocation, getNetworkStatus } from "@apps-in-toss/web-bridge";
import styled from "styled-components";
import "dayjs/locale/ko";
import { Place, PlaceHistory } from "../types/place";
import Loading from "./common/Loading";
import { useLocation, useNavigate } from "react-router-dom";
import { createPlace, deletePlace, getCategory, getPlaces, getProductInfo, updatePlace } from "../service/api";
import { useApp } from "../context/AppContext";
import { ToastInfo } from "../types/toast";
import { Product } from "../types/product";

export const PageWrapper = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

export const BottomButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const CurrentLocationButtonWrapper = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
`;

const HistoryListItemWrapper = styled.div`
  display: flex;
  flexdirection: column;
`;
const PlaceEditPage = () => {
  const { account } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedPlace: Place = location.state && location.state.selectedPlace ? location.state.selectedPlace : null;
  const isEditMode = selectedPlace ? true : false;

  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<boolean>(false);
  const [category, setCategory] = useState<number>(0);
  const [address, setAddress] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [categoryList, setCategoryList] = useState<{ id: number; title: string }[]>([]);
  const [currentLocation, setCurrentLocation] = useState<number[]>([37.5665, 126.978]);
  const [product, setProduct] = useState<Product | null>();
  const [placeList, setPlaceList] = useState<Place[]>([]);
  const [historyList, setHistoryList] = useState<PlaceHistory[]>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastInfo>({
    show: false,
    message: "",
  });
  const [loading, setLoading] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  useEffect(() => {
    const loadPlaces = async () => {
      const list = await getPlaces(account.id);
      if (selectedPlace) {
        const target = list.filter((p) => p.id === selectedPlace.id)[0];
        if (target) {
          setName(target.name);
          setCategory(target.category);
          setAddress(target.address);
          setLatitude(target.latitude);
          setLongitude(target.longitude);
          setHistoryList(target.historyList);
        }
      }

        setPlaceList(list);
    };
    const loadCategories = async () => {
      const categoryData = await getCategory(account.id);
      if (categoryData) {
        setCategoryList(categoryData.list);
      }
    };
    const loadProductInfo = async () => {
      const result = await getProductInfo(account.id);
      if (result) {
        setProduct(result);
      }
    };

    const load = async () => {
      const networkStatus = await getNetworkStatus();
      if (
        networkStatus !== NETWORK_STATUS.OFFLINE &&
        networkStatus !== NETWORK_STATUS.UNKNOWN &&
        networkStatus !== NETWORK_STATUS.WWAN
      ) {
        loadPlaces();
        loadCategories();
        loadProductInfo();
      } else {
        setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR });
      }
    };
    if (account) {
      load();
    }
  }, [account, selectedPlace]);

  useEffect(() => {
    const handleGetCurrentLocation = async () => {
      try {
        const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
        setCurrentLocation([response.coords.latitude, response.coords.longitude]);
      } catch (error) {
        console.error(error);
      }
    };
    handleGetCurrentLocation();
  }, []);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng }, language: "ko" }, (results, status) => {
        if (status === "OK") {
          if (results && results[0]) {
            setAddress(results[0].formatted_address);
            setLatitude(roundToFour(lat));
            setLongitude(roundToFour(lng));
          } else {
            console.log("No results found");
          }
        } else {
          console.log("Geocoder failed due to: " + status);
        }
      });
    }
  }, []);

  const nameView = () => {
    return (
      <>
        <Post.H3>{TEXT.PLACE_NAME}</Post.H3>
        <TextField
          variant="box"
          help={handleNameError(name) ? TEXT.MSG_PLACE_NAME : null}
          placeholder={TEXT.MSG_PLACE_NAME}
          hasError={handleNameError(name)}
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            setName(v);
            setNameError(v.length > 10 || v.length === 0);
          }}
        />
      </>
    );
  };

  const categoryView = () => {
    const currentCategory = categoryList.filter((c) => c.id === category);
    return (
      <>
        <Post.H3>{TEXT.CATEGORY}</Post.H3>
        <Menu.Trigger
          open={categoryMenuOpen}
          onOpen={() => setCategoryMenuOpen(true)}
          onClose={() => setCategoryMenuOpen(false)}
          placement="bottom"
          dropdown={
            <Menu.Dropdown header={<Menu.Header>{TEXT.MENU_CHOICE_ITEMS}</Menu.Header>}>
              {categoryList.map((item) => {
                const id = item.id;
                const title = item.title;
                return (
                  <Menu.DropdownCheckItem
                    key={id}
                    checked={category === id}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setCategory(id);
                      } else {
                        return null;
                      }
                      setCategoryMenuOpen(false);
                    }}
                  >
                    {title}
                  </Menu.DropdownCheckItem>
                );
              })}
            </Menu.Dropdown>
          }
        >
          <Button color="light">
            {currentCategory && currentCategory[0] ? currentCategory[0].title : TEXT.MENU_CATEGORY_CHOICE}
          </Button>
        </Menu.Trigger>
      </>
    );
  };

  const onCurrentLocationUseClick = async () => {
    const currentPermission = await getCurrentLocation.getPermission();
    if (currentPermission === PERMISSIONS.ALLOWED) {
      const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      const lat = response.coords.latitude;
      const lng = response.coords.longitude;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng }, language: "ko" }, (results, status) => {
        if (status === "OK") {
          if (results && results[0]) {
            setAddress(results[0].formatted_address);
            setLatitude(roundToFour(lat));
            setLongitude(roundToFour(lng));
          } else {
            console.log("No results found");
          }
        } else {
          console.log("Geocoder failed due to: " + status);
        }
      });
    } else {
      const locationPermssion = await getCurrentLocation.openPermissionDialog();
      console.log(`locationPermssion ${locationPermssion}`);
    }
  };

  const mapAddressView = () => {
    return (
      <div>
        <Post.H3>{TEXT.LOCATION}</Post.H3>
        <Post.Paragraph>{TEXT.MSG_LOCATION_GUIDE}</Post.Paragraph>
        <CurrentLocationButtonWrapper>
          <Button size="medium" color="primary" variant="weak" onClick={onCurrentLocationUseClick}>
            {TEXT.USE_CURRENT_LOCATION}
          </Button>
        </CurrentLocationButtonWrapper>
        <Post.Paragraph>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{
              lat: isEditMode ? latitude : currentLocation[0],
              lng: isEditMode ? longitude : currentLocation[1],
            }}
            zoom={20}
            options={{
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
              },
              streetViewControl: true,
              streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER,
              },
              cameraControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
              },
            }}
            onClick={handleMapClick}
          >
            {latitude !== 0 && longitude !== 0 && <Marker position={{ lat: latitude, lng: longitude }} />}
          </GoogleMap>
        </Post.Paragraph>
        <div style={{ marginTop: 10 }}></div>
        <Post.H3>{TEXT.ADDRESS}</Post.H3>
        <TextField variant="box" placeholder={TEXT.MSG_LOCATION_GUIDE} value={address} />
      </div>
    );
  };

  const historyListView = () => {
    const onHistoryListItemClick = (placeHistory: PlaceHistory) => {
      const currentCategory = categoryList.filter((c) => c.id === category);
      navigate(ROUTES.PLACE_HISTORY_EDIT, {
        state: {
          selectedPlace: selectedPlace,
          selectedPlaceHistory: placeHistory,
          categoryText: currentCategory[0].title,
        },
      });
    };

    return (
      <>
        <Post.H3>{TEXT.PLACE_HISTORY}</Post.H3>
        <List>
          {historyList.map((history) => {
            return (
              <ListRow
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={history.visitAt || ""}
                    bottom={
                      <HistoryListItemWrapper>
                        <Text style={{ fontStyle: "italic" }}>{history.tags}</Text>
                        <Text>{history.memo}</Text>
                      </HistoryListItemWrapper>
                    }
                  />
                }
                right={
                  <Rating
                    readOnly={true}
                    value={history.rating}
                    max={history.rating}
                    size="medium"
                    variant="compact"
                    aria-label={TEXT.RATING}
                  />
                }
                onClick={() => onHistoryListItemClick(history)}
              />
            );
          })}
        </List>
      </>
    );
  };

  const buttonView = () => {
    const onHistoryAddClick = () => {
      const currentCategory = categoryList.filter((c) => c.id === category);
      navigate(ROUTES.PLACE_HISTORY_EDIT, {
        state: {
          selectedPlace: selectedPlace,
          categoryText: currentCategory[0].title,
        },
      });
    };
    return (
      <>
        {isEditMode && (
          <BottomButtonWrapper>
            <Button variant="weak" onClick={onHistoryAddClick}>
              {TEXT.HISTORY_ADD}
            </Button>
            <Button
              size="medium"
              color="danger"
              style={{ width: "85%" }}
              onClick={() => {
                setDeleteDialogOpen(true);
              }}
            >
              {TEXT.PLACE_DELETE}
            </Button>
          </BottomButtonWrapper>
        )}
        <FixedBottomCTA.Double
          leftButton={
            <Button
              style={{ flex: 1 }}
              onClick={() => {
                navigate(-1);
              }}
              variant="weak"
            >
              {TEXT.CANCEL}
            </Button>
          }
          rightButton={
            <Button style={{ flex: 1 }} disabled={nameError} onClick={() => setCreateDialogOpen(true)}>
              {isEditMode ? TEXT.MODIFY : TEXT.CREATE}
            </Button>
          }
        />
      </>
    );
  };

  const onDeleteClick = async () => {
    setDeleteDialogOpen(false);
    setLoading({ show: true, message: TEXT.MSG_DELETE_PLACE });
    await deletePlace(selectedPlace.id);
    setLoading({ show: false, message: "" });
    setAlertDialogOpen(true);
  };

  const onCreateClick = async () => {
    setCreateDialogOpen(false);
    const networkStatus = await getNetworkStatus();
    if (
      networkStatus === NETWORK_STATUS.OFFLINE ||
      networkStatus === NETWORK_STATUS.UNKNOWN ||
      networkStatus === NETWORK_STATUS.WWAN
    ) {
      setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR });
      return;
    }
    if (!isEditMode) {
      if (product && placeList.length >= product.place_limit) {
        setToast({ show: true, message: getPlaceLimitText(product.place_limit) });
        return;
      }
    }

    if (!name || name.length === 0) {
      setToast({ show: true, message: TEXT.MSG_PLACE_NAME });
    } else if (!category) {
      setToast({ show: true, message: TEXT.MSG_CATEGORY });
    } else {
      try {
        if (isEditMode) {
          setLoading({ show: true, message: TEXT.MSG_UPDATE_PLACE });
          selectedPlace.name = name;
          selectedPlace.category = category;
          selectedPlace.latitude = latitude;
          selectedPlace.latitude = latitude;
          selectedPlace.address = address;
          await updatePlace(selectedPlace.id, selectedPlace);
        } else {
          setLoading({ show: true, message: TEXT.MSG_CREATE_PLACE });
          const data: Place = {
            id: "",
            name: name,
            category: category,
            latitude: latitude,
            longitude: longitude,
            address: address,
            creator: account.id,
            created: "",
            updated: "",
            historyList: [],
          };
          await createPlace(data);
        }
        setLoading({ show: false, message: "" });
        setAlertDialogOpen(true);
      } catch (e) {
        console.log(e);
        setLoading({ show: false, message: "" });
      }
    }
  };

  const handleNameError = (value: string) => {
    return value.length > 10;
  };

  const createDialog = () => {
    return (
      <ConfirmDialog
        open={createDialogOpen}
        title={
          <ConfirmDialog.Title>
            {isEditMode ? TEXT.MSG_MODIFY_PLACE_CONFIRM : TEXT.MSG_CREATE_PLACE_CONFIRM}
          </ConfirmDialog.Title>
        }
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setCreateDialogOpen(false)}>{TEXT.NO}</ConfirmDialog.CancelButton>
        }
        confirmButton={<ConfirmDialog.ConfirmButton onClick={onCreateClick}>{TEXT.YES}</ConfirmDialog.ConfirmButton>}
        onClose={() => setCreateDialogOpen(false)}
      />
    );
  };

  const deleteDialog = () => {
    return (
      <ConfirmDialog
        open={deleteDialogOpen}
        title={<ConfirmDialog.Title>{TEXT.MSG_DELETE_PLACE_CONFIRM}</ConfirmDialog.Title>}
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setDeleteDialogOpen(false)}>{TEXT.NO}</ConfirmDialog.CancelButton>
        }
        confirmButton={<ConfirmDialog.ConfirmButton onClick={onDeleteClick}>{TEXT.YES}</ConfirmDialog.ConfirmButton>}
        onClose={() => setDeleteDialogOpen(false)}
      />
    );
  };

  const alertDialog = () => {
    return (
      <AlertDialog
        open={alertDialogOpen}
        title={<AlertDialog.Title>{TEXT.MSG_COMPLETED}</AlertDialog.Title>}
        alertButton={
          <AlertDialog.AlertButton
            onClick={() => {
              setAlertDialogOpen(false);
              navigate(-1);
            }}
          >
            {TEXT.OK}
          </AlertDialog.AlertButton>
        }
        onClose={() => {
          setAlertDialogOpen(false);
        }}
      />
    );
  };

  if (loading.show) {
    return <Loading label={loading.message} />;
  }

  return (
    <PageWrapper>
      {nameView()}
      {categoryView()}
      {mapAddressView()}
      {historyList.length > 0 && historyListView()}
      {buttonView()}
      {createDialog()}
      {deleteDialog()}
      {alertDialog()}
      <Toast
        position="bottom"
        open={toast.show}
        text={toast.message}
        duration={TOAST_DURATION_DEFAULT}
        onClose={() => {
          setToast({ show: false, message: "" });
        }}
      />
    </PageWrapper>
  );
};

export default PlaceEditPage;
