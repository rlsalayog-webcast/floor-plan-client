export const dummyLocations = [
    {
        id: "1",
        name: "Intramuros",
        latitude: 14.5896,
        longitude: 120.9747,
    },
    {
        id: "2",
        name: "Rizal Park",
        latitude: 14.5826,
        longitude: 120.9794,
    },
    {
        id: "3",
        name: "SM Mall of Asia",
        latitude: 14.5353,
        longitude: 120.9822,
    },
    {
        id: "4",
        name: "Makati CBD",
        latitude: 14.5547,
        longitude: 121.0244,
    },
    {
        id: "5",
        name: "Quezon Memorial Circle",
        latitude: 14.6515,
        longitude: 121.0486,
    },
];

export const dummyElements = [
    {
        id: "rect-1",
        type: "rectangle",
        x: 100,
        y: 80,
        width: 120,
        height: 80,
        fill: "hsl(200 60% 80%)",
        attributes: {
            name: "Room 101",
            description: "This is a small office room with a single desk.",
        },
    },
    {
        id: "rect-2",
        type: "rectangle",
        x: 300,
        y: 100,
        width: 150,
        height: 100,
        fill: "hsl(300 60% 80%)",
        attributes: {
            name: "Conference Hall",
            description: "Large meeting room with projector and seating for 12 people.",
        },
    },
    {
        id: "circle-1",
        type: "circle",
        x: 600,
        y: 200,
        radius: 40,
        fill: "hsl(120 60% 80%)",
        attributes: {
            name: "Fountain",
            description: "Decorative water fountain placed at the center of the lobby.",
        },
    },
    {
        id: "circle-2",
        type: "circle",
        x: 450,
        y: 300,
        radius: 30,
        fill: "hsl(0 60% 80%)",
        attributes: {
            name: "Round Table",
            description: "A round table with 4 chairs, used as a casual discussion area.",
        },
    },
];
