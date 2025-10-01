import { Map } from "@vis.gl/react-google-maps";
import { Alert, Button, Spin } from "antd";
import { useGetAllLandmark } from "../api/hooks/useGetAllLandmark";
import FloorDrawer from "../component/FloorDrawer";
import FloorPlanModal from "../component/FloorPlanModal";
import ClusteredLocationMarkers from "../component/google-maps/ClusteredLocationMarkers";
import { MANILA_POSITION } from "../constant/mapPosition";
import useDrawerVisibility from "../hook/useDrawerVisibility";
import { DrawerVisibilityProvider } from "../store/context/DrawerVisibilityContext";

const Home = () => {
    const modal = useDrawerVisibility();
    const drawer = useDrawerVisibility();
    const { data, loading, error } = useGetAllLandmark();

    return (
        <>
            <DrawerVisibilityProvider value={{ modal, drawer }}>
                <div className="min-h-screen">
                    {loading && (
                        <div className="p-4">
                            <Spin tip="Loading landmarks..." />
                        </div>
                    )}
                    {error && (
                        <div className="p-4">
                            <Alert
                                type="error"
                                message="Failed to load landmarks"
                                description={(error as Error).message}
                                showIcon
                            />
                        </div>
                    )}
                    <Map
                        style={{ height: "100vh" }}
                        mapId={import.meta.env.VITE_MAP_ID || ""}
                        defaultZoom={10}
                        center={MANILA_POSITION}
                        gestureHandling={"greedy"}
                        disableDefaultUI
                    >
                        <ClusteredLocationMarkers
                            data={data?.getLandmarks ?? []}
                            getKey={({ id }) => id}
                            getPosition={({ latitude, longitude }) => ({
                                lat: +latitude,
                                lng: +longitude,
                            })}
                            renderMarker={() => <span className="text-2xl">📍</span>}
                            renderInfoWindow={(e) => (
                                <div className="grid grid-cols-2">
                                    <div>
                                        <p>Id :</p>
                                        <p>Name :</p>
                                        <p>Category :</p>
                                        <p>Longitude :</p>
                                        <p>Latitude :</p>
                                        <p>Floor Plan :</p>
                                    </div>
                                    <div>
                                        <div>{e.id}</div>
                                        <div>{e.name}</div>
                                        <div>{e.category}</div>
                                        <div>{e.longitude}</div>
                                        <div>{e.latitude}</div>
                                        <Button>Create Floor</Button>
                                        <Button
                                            onClick={() => {
                                                modal.view.setVisible(true);
                                                modal.id.setValue(e.id);
                                            }}
                                        >
                                            View Floor
                                        </Button>
                                    </div>
                                </div>
                            )}
                        />
                    </Map>
                </div>
                <FloorPlanModal />
                <FloorDrawer />
            </DrawerVisibilityProvider>
        </>
    );
};

export default Home;
