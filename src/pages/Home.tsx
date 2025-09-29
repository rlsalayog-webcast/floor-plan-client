import { Map } from "@vis.gl/react-google-maps";
import { useContext, useState } from "react";
import CustomActionButtons from "../component/CustomActionButtons";
import FloorDetailsFormDrawer from "../component/floor-plan/FloorDetailsForm";
import FloorPlanModal from "../component/FloorPlanModal";
import ClusteredLocationMarkers from "../component/google-maps/ClusteredLocationMarkers";
import { dummyLocations } from "../constant/data";
import { MANILA_POSITION } from "../constant/mapPosition";
import { DrawerVisibilityContext } from "../store/context/DrawerVisibilityContext";

const Home = () => {
    const { view, edit, id } = useContext(DrawerVisibilityContext);
    const [isEditDetailsVisible, setIsEditDetailsVisible] = useState(false);

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
                        renderInfoWindow={() => (
                            <>
                                <p>Floor Plan</p>
                                <CustomActionButtons
                                    actions={["view", "edit"]}
                                    handleView={() => view.setVisible(true)}
                                    handleEdit={() => edit.setVisible(true)}
                                />
                            </>
                        )}
                    />
                </Map>
            </div>
            <FloorPlanModal
                isEditDetailsVisible={isEditDetailsVisible}
                setIsEditDetailsVisible={setIsEditDetailsVisible}
            />
            <FloorDetailsFormDrawer
                isEditDetailsVisible={isEditDetailsVisible}
                setIsEditDetailsVisible={setIsEditDetailsVisible}
            />
        </>
    );
};

export default Home;
