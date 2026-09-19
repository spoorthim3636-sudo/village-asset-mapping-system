// ==========================================
// VILLAGE ASSET MAPPING SYSTEM
// Main JavaScript
// ==========================================

const defaultAssets = [
    {
        id: 1,
        name: "Government High School",
        type: "school",
        category: "School",
        location: "Main Road",
        status: "Operational",
        latitude: 12.3000,
        longitude: 76.6400
    },
    {
        id: 2,
        name: "Primary Health Centre",
        type: "hospital",
        category: "Health Centre",
        location: "North Village",
        status: "Operational",
        latitude: 12.2920,
        longitude: 76.6450
    },
    {
        id: 3,
        name: "Community Water Tank",
        type: "water",
        category: "Water Facility",
        location: "East Village",
        status: "Operational",
        latitude: 12.2980,
        longitude: 76.6500
    },
    {
        id: 4,
        name: "Village Panchayat Office",
        type: "government",
        category: "Government Building",
        location: "Main Village",
        status: "Operational",
        latitude: 12.2900,
        longitude: 76.6350
    },
    {
        id: 5,
        name: "Government Primary School",
        type: "school",
        category: "School",
        location: "South Village",
        status: "Under Maintenance",
        latitude: 12.2870,
        longitude: 76.6420
    }
];

let savedAssets = JSON.parse(
    localStorage.getItem("villageAssets")
);

let assets = savedAssets || defaultAssets;


// ==========================================
// CREATE MAP
// ==========================================

const map = L.map("map").setView(
    [12.2958, 76.6394],
    13
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);

let markerObjects = [];


// ==========================================
// CREATE MARKER ICON
// ==========================================

function createIcon(type) {

    let symbol = "●";

    if (type === "school") symbol = "S";
    if (type === "hospital") symbol = "+";
    if (type === "water") symbol = "W";
    if (type === "government") symbol = "G";

    return L.divIcon({
        className: "",
        html: `
            <div class="asset-marker ${type}">
                ${symbol}
            </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20]
    });
}


// ==========================================
// DISPLAY MAP MARKERS
// ==========================================

function renderMarkers() {

    markerObjects.forEach(marker => {
        map.removeLayer(marker);
    });

    markerObjects = [];

    assets.forEach(asset => {

        const marker = L.marker(
            [
                Number(asset.latitude),
                Number(asset.longitude)
            ],
            {
                icon: createIcon(asset.type)
            }
        ).addTo(map);

        marker.bindPopup(`
            <div>
                <div class="popup-title">
                    ${escapeHTML(asset.name)}
                </div>

                <div class="popup-info">
                    <strong>Category:</strong>
                    ${escapeHTML(asset.category)}
                    <br>

                    <strong>Location:</strong>
                    ${escapeHTML(asset.location)}
                    <br>

                    <strong>Status:</strong>
                    ${escapeHTML(asset.status)}
                </div>
            </div>
        `);

        marker.assetId = asset.id;
        marker.assetType = asset.type;

        markerObjects.push(marker);
    });
}


// ==========================================
// DISPLAY ASSET LIST
// ==========================================

function renderAssetList() {

    const list = document.getElementById("asset-list");

    const searchText =
        document.getElementById("asset-search")
            .value
            .trim()
            .toLowerCase();

    list.innerHTML = "";

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchText) ||
        asset.category.toLowerCase().includes(searchText) ||
        asset.location.toLowerCase().includes(searchText)
    );

    if (filteredAssets.length === 0) {

        list.innerHTML = `
            <div style="padding:20px;text-align:center;">
                No matching assets found.
            </div>
        `;

        return;
    }

    filteredAssets.forEach(asset => {

        const row = document.createElement("div");

        row.className = "asset-row";

        let statusClass = "";

        if (asset.status === "Under Maintenance") {
            statusClass = "maintenance";
        }

        if (asset.status === "Inactive") {
            statusClass = "inactive";
        }

        row.innerHTML = `
            <span class="asset-name">
                ${escapeHTML(asset.name)}
            </span>

            <span class="asset-category">
                ${escapeHTML(asset.category)}
            </span>

            <span class="asset-location">
                ${escapeHTML(asset.location)}
            </span>

            <span>
                <span class="status-badge ${statusClass}">
                    ${escapeHTML(asset.status)}
                </span>
            </span>

            <span>
                <button
                    class="delete-btn"
                    data-id="${asset.id}">
                    Delete
                </button>
            </span>
        `;

        list.appendChild(row);
    });

    document.querySelectorAll(".delete-btn")
        .forEach(button => {
            button.addEventListener("click", deleteAsset);
        });
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateStatistics() {

    document.getElementById("total-assets").textContent =
        assets.length;

    document.getElementById("school-count").textContent =
        assets.filter(asset => asset.type === "school").length;

    document.getElementById("hospital-count").textContent =
        assets.filter(asset => asset.type === "hospital").length;

    document.getElementById("water-count").textContent =
        assets.filter(asset => asset.type === "water").length;
}


// ==========================================
// SAVE DATA
// ==========================================

function saveAssets() {

    localStorage.setItem(
        "villageAssets",
        JSON.stringify(assets)
    );
}


// ==========================================
// DELETE ASSET
// ==========================================

function deleteAsset(event) {

    const id = Number(event.target.dataset.id);

    if (!confirm("Are you sure you want to delete this asset?")) {
        return;
    }

    assets = assets.filter(asset => asset.id !== id);

    saveAssets();
    renderMarkers();
    renderAssetList();
    updateStatistics();
}


// ==========================================
// ADD NEW ASSET
// ==========================================

const form = document.getElementById("asset-form");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("asset-name").value.trim();

    const type =
        document.getElementById("asset-type").value;

    const location =
        document.getElementById("asset-location").value.trim();

    const status =
        document.getElementById("asset-status").value;

    const latitude =
        Number(document.getElementById("latitude").value);

    const longitude =
        Number(document.getElementById("longitude").value);

    if (
        !name ||
        !type ||
        !location ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
    ) {
        alert("Please enter all required information.");
        return;
    }

    const categoryMap = {
        school: "School",
        hospital: "Health Centre",
        water: "Water Facility",
        government: "Government Building"
    };

    const newAsset = {
        id: Date.now(),
        name: name,
        type: type,
        category: categoryMap[type],
        location: location,
        status: status,
        latitude: latitude,
        longitude: longitude
    };

    assets.push(newAsset);

    saveAssets();
    renderMarkers();
    renderAssetList();
    updateStatistics();

    form.reset();

    map.setView(
        [latitude, longitude],
        15
    );

    alert("Asset added successfully.");
});


// ==========================================
// CATEGORY FILTER
// ==========================================

document
    .getElementById("asset-filter")
    .addEventListener("change", function() {

        const selectedType = this.value;

        markerObjects.forEach(marker => {

            if (
                selectedType === "all" ||
                marker.assetType === selectedType
            ) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    });


// ==========================================
// SEARCH
// ==========================================

document
    .getElementById("asset-search")
    .addEventListener(
        "input",
        renderAssetList
    );


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==========================================
// START APPLICATION
// ==========================================

renderMarkers();
renderAssetList();
updateStatistics();
