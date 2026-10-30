// ======================================
// VILLAGEGIS - INTERACTIVE MAP SYSTEM
// ======================================

// 1. SAMPLE VILLAGE ASSETS
let assets = [
    {
        id: 1,
        name: "Government High School",
        type: "School",
        lat: 12.3000,
        lng: 76.6400,
        description: "Government village high school",
        status: "Active"
    },
    {
        id: 2,
        name: "Primary Health Centre",
        type: "Hospital",
        lat: 12.2920,
        lng: 76.6450,
        description: "Primary healthcare facility",
        status: "Active"
    },
    {
        id: 3,
        name: "Community Water Tank",
        type: "Water Tank",
        lat: 12.2980,
        lng: 76.6500,
        description: "Village drinking water storage",
        status: "Active"
    },
    {
        id: 4,
        name: "Village Panchayat Office",
        type: "Office",
        lat: 12.3050,
        lng: 76.6350,
        description: "Village administration office",
        status: "Active"
    },
    {
        id: 5,
        name: "Main Village Road",
        type: "Road",
        lat: 12.3020,
        lng: 76.6420,
        description: "Main village connecting road",
        status: "Active"
    }
];

// 2. INITIALIZE MAP
const map = L.map("map").setView([12.3000, 76.6400], 14);

// Street map
const streetLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }
);

// Satellite map
const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Tiles &copy; Esri",
        maxZoom: 19
    }
);

// Terrain map
const terrainLayer = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
        attribution: "Map data: OpenStreetMap contributors, SRTM",
        maxZoom: 17
    }
);

// Default map
streetLayer.addTo(map);

// Map layer selection
L.control.layers({
    "Street View": streetLayer,
    "Satellite View": satelliteLayer,
    "Terrain View": terrainLayer
}).addTo(map);

// 3. MARKER COLORS
function getMarkerColor(type) {
    const colors = {
        "School": "#2563eb",
        "Hospital": "#dc2626",
        "Water Tank": "#0891b2",
        "Office": "#7c3aed",
        "Road": "#ea580c"
    };

    return colors[type] || "#475569";
}

// 4. CREATE CUSTOM MARKER
function createMarker(asset) {
    const color = getMarkerColor(asset.type);

    const markerIcon = L.divIcon({
        className: "custom-asset-marker",
        html: `
            <div style="
                background:${color};
                width:32px;
                height:32px;
                border:3px solid white;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:white;
                font-weight:bold;
                box-shadow:0 2px 8px #555;
            ">
                ${asset.type === "School" ? "S" :
                  asset.type === "Hospital" ? "H" :
                  asset.type === "Water Tank" ? "W" :
                  asset.type === "Office" ? "O" : "R"}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const marker = L.marker(
        [asset.lat, asset.lng],
        { icon: markerIcon }
    );

    marker.bindPopup(`
        <div>
            <h3>${asset.name}</h3>
            <p><b>Category:</b> ${asset.type}</p>
            <p><b>Description:</b> ${asset.description}</p>
            <p><b>Status:</b> ${asset.status}</p>
            <p><b>Latitude:</b> ${asset.lat}</p>
            <p><b>Longitude:</b> ${asset.lng}</p>
        </div>
    `);

    return marker;
}

// 5. MARKER LAYER
const markerLayer = L.layerGroup().addTo(map);

// 6. DISPLAY ASSETS ON MAP
function displayAssets() {
    markerLayer.clearLayers();

    const searchText =
        document.getElementById("search").value.toLowerCase();

    const selectedCategory =
        document.getElementById("category-filter").value;

    assets.forEach(asset => {
        const matchesSearch =
            asset.name.toLowerCase().includes(searchText) ||
            asset.type.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            asset.type === selectedCategory;

        if (matchesSearch && matchesCategory) {
            createMarker(asset).addTo(markerLayer);
        }
    });
}

// 7. UPDATE DASHBOARD COUNTS
function updateDashboard() {
    document.getElementById("school-count").textContent =
        assets.filter(a => a.type === "School").length;

    document.getElementById("hospital-count").textContent =
        assets.filter(a => a.type === "Hospital").length;

    document.getElementById("water-count").textContent =
        assets.filter(a => a.type === "Water Tank").length;

    document.getElementById("road-count").textContent =
        assets.filter(a => a.type === "Road").length;
}

// 8. DISPLAY ASSET DIRECTORY
function displayAssetList() {
    const list = document.getElementById("asset-list");

    list.innerHTML = "";

    assets.forEach(asset => {
        const item = document.createElement("div");
        item.className = "asset-row";

        const details = document.createElement("div");
        const heading = document.createElement("strong");
        const description = document.createElement("p");

        heading.textContent = asset.name;
        description.textContent =
            `${asset.type} | ${asset.status}`;

        details.appendChild(heading);
        details.appendChild(description);

        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.type = "button";

        viewButton.addEventListener("click", () => {
            map.setView([asset.lat, asset.lng], 17);

            markerLayer.eachLayer(marker => {
                const position = marker.getLatLng();

                if (
                    position.lat === asset.lat &&
                    position.lng === asset.lng
                ) {
                    marker.openPopup();
                }
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            if (confirm("Delete this asset?")) {
                assets = assets.filter(a => a.id !== asset.id);
                refreshSystem();
            }
        });

        item.appendChild(details);
        item.appendChild(viewButton);
        item.appendChild(deleteButton);

        list.appendChild(item);
    });
}

// 9. REFRESH COMPLETE SYSTEM
function refreshSystem() {
    displayAssets();
    updateDashboard();
    displayAssetList();
}

// 10. SEARCH FUNCTION
document.getElementById("search").addEventListener(
    "input",
    displayAssets
);

// 11. CATEGORY FILTER
document.getElementById("category-filter").addEventListener(
    "change",
    displayAssets
);

// 12. ADD NEW ASSET
document.getElementById("asset-form").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        const name =
            document.getElementById("asset-name").value.trim();

        const type =
            document.getElementById("asset-type").value;

        const lat =
            Number(document.getElementById("asset-lat").value);

        const lng =
            Number(document.getElementById("asset-lng").value);

        const description =
            document.getElementById("asset-description").value.trim();

        const status =
            document.getElementById("asset-status").value;

        const message =
            document.getElementById("form-message");

        if (
            !name ||
            !type ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            message.textContent = "Please enter valid asset details and coordinates.";
            return;
        }

        const newAsset = {
            id: Date.now(),
            name,
            type,
            lat,
            lng,
            description,
            status
        };

        assets.push(newAsset);

        refreshSystem();

        map.setView([lat, lng], 17);

        message.textContent = "Asset added successfully!";

        this.reset();
    }
);

// 13. CLICK MAP TO READ COORDINATES
map.on("click", function(event) {
    const lat = event.latlng.lat.toFixed(6);
    const lng = event.latlng.lng.toFixed(6);

    L.popup()
        .setLatLng(event.latlng)
        .setContent(`
            <b>Selected Location</b><br>
            Latitude: ${lat}<br>
            Longitude: ${lng}
        `)
        .openOn(map);
});

// 14. MY LOCATION BUTTON
document.getElementById("locate-btn").addEventListener(
    "click",
    function() {
        if (!navigator.geolocation) {
            alert("Location is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                map.setView([lat, lng], 16);

                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("Your current location")
                    .openPopup();
            },
            function() {
                alert("Unable to get your location. Please allow location access.");
            }
        );
    }
);

// 15. RESET MAP BUTTON
document.getElementById("reset-map").addEventListener(
    "click",
    function() {
        document.getElementById("search").value = "";
        document.getElementById("category-filter").value = "All";

        map.setView([12.3000, 76.6400], 14);

        refreshSystem();
    }
);

// 16. FULLSCREEN MAP
document.getElementById("fullscreen-btn").addEventListener(
    "click",
    async function() {
        const mapElement = document.getElementById("map");

        try {
            if (!document.fullscreenElement) {
                await mapElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }

            setTimeout(() => map.invalidateSize(), 200);
        } catch (error) {
            alert("Fullscreen is not available in this browser.");
        }
    }
);

// 17. INITIALIZE SYSTEM
refreshSystem();

setTimeout(() => {
    map.invalidateSize();
}, 300);

console.log("VillageGIS Interactive Map Loaded Successfully!");
