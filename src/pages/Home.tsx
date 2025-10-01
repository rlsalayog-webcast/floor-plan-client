import { Map } from "@vis.gl/react-google-maps";
import { Alert, Spin } from "antd";
import { useContext } from "react";
import { useGetAllLandmark } from "../api/hooks/useGetAllLandmark";
import FloorPlanModal from "../component/FloorPlanModal";
import ClusteredLocationMarkers from "../component/google-maps/ClusteredLocationMarkers";
import { dummyLocations } from "../constant/data";
import { MANILA_POSITION } from "../constant/mapPosition";
import { DrawerVisibilityContext } from "../store/context/DrawerVisibilityContext";

const Home = () => {
    const { view, edit, id } = useContext(DrawerVisibilityContext);
    const { data, loading, error } = useGetAllLandmark();

    return (
        <>
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
                        data={data?.getLandmarks ?? dummyLocations}
                        getKey={({ id }) => id}
                        getPosition={({ latitude, longitude }) => ({
                            lat: +latitude,
                            lng: +longitude,
                        })}
                        renderMarker={() => <span className="text-2xl">📍</span>}
                        onMarkerClick={() => {
                            view.setVisible(true);
                        }}
                    />
                </Map>
            </div>
            <FloorPlanModal />
        </>
    );
};

export default Home;
