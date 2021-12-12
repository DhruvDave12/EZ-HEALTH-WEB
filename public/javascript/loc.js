const x = document.querySelector(".locDis");

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            console.log(position);
        });
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

// export function showPosition(position) {
//     x.innerHTML = "Latitude: " + position.coords.latitude +
//         "<br>Longitude: " + position.coords.longitude;
// }
