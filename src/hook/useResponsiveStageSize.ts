import { useEffect, useRef, useState } from "react";

interface IUseResponsiveStageSize {
    sceneWidth?: number;
    sceneHeight?: number;
}
const useResponsiveStageSize = ({
    sceneWidth = 1000,
    sceneHeight = 520,
}: IUseResponsiveStageSize = {}) => {
    // State to track current scale and dimensions
    const [stageSize, setStageSize] = useState({
        width: sceneWidth,
        height: sceneHeight,
        scale: 1,
    });

    // Reference to parent container
    const containerRef = useRef<HTMLDivElement>(null);

    // Function to make the Stage and its children responsive
    const updateSize = () => {
        if (!containerRef.current) return;

        // Get container width
        const containerWidth = containerRef.current.offsetWidth;

        // Calculate scale
        const scale = containerWidth / sceneWidth;

        // Update state with new dimensions
        setStageSize({
            width: sceneWidth * scale,
            height: sceneHeight * scale,
            scale: scale,
        });
    };

    // Update on mount and when window resizes
    useEffect(() => {
        updateSize();
        window.addEventListener("resize", updateSize);

        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    return {
        containerRef,
        stageSize,
    };
};

export default useResponsiveStageSize;
