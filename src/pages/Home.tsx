import { Map } from "@vis.gl/react-google-maps";
import { useContext } from "react";
import FloorPlanModal from "../component/FloorPlanModal";
import ClusteredLocationMarkers from "../component/google-maps/ClusteredLocationMarkers";
import { dummyLocations } from "../constant/data";
import { MANILA_POSITION } from "../constant/mapPosition";
import { DrawerVisibilityContext } from "../store/context/DrawerVisibilityContext";

const Home = () => {
    const { view, edit, id } = useContext(DrawerVisibilityContext);

    return (
        <>
            <div className="min-h-screen">
                <Map
                    style={{ height: "100vh" }}
                    mapId={import.meta.env.VITE_MAP_ID || ""}
                    defaultZoom={10}
                    center={MANILA_POSITION}
                    gestureHandling={"greedy"}
                    disableDefaultUI
                >
                    <ClusteredLocationMarkers
                        data={dummyLocations}
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
