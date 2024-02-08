function refreshSection() {
  fetch('/getDistanceData') // Use the correct endpoint to fetch data
    .then(response => response.json()) // Parse response as JSON
    .then(data => {
      // Update the section with the latest data
      document.getElementById('sectionToRefresh').innerHTML = `
        <p>Centimeters: ${data.data.cm.toFixed(2)} cm</p>
        <p>Inches: ${data.data.in.toFixed(2)} in</p>
      `;
    })
    .catch(error => console.error('Error:', error));
}

// Call refreshSection every second
setInterval(refreshSection, 100);

function refreshModeSection() {
  fetch('/getModeData') // Use the correct endpoint to fetch data
    .then(response => response.json()) // Parse response as JSON
    .then(data => {
      // Update the section with the latest data
      document.getElementById('modeSectionToRefresh').innerHTML = `
        <p>Current state: ${data.data.state}</p>
      `;
    })
    .catch(error => console.error('Error:', error));
}

// Call refreshSection every second
setInterval(refreshModeSection, 500);

document.addEventListener("DOMContentLoaded", () => {
  let but = document.getElementById("but");
  let but2 = document.getElementById("but2");
  let video = document.getElementById("vid");
  let mediaDevices = navigator.mediaDevices;
  vid.muted = true;
  but.addEventListener("click", () => {

      // Accessing the user camera and video.
      mediaDevices
          .getUserMedia({
              video: true,
              audio: true,
          })
          .then((stream) => {
              // Changing the source of video to current stream.
              video.srcObject = stream;
              video.addEventListener("loadedmetadata", () => {
                  video.play();
                  document.getElementById("vid").style.transform = "scaleX(-1)";
              });
          })
          .catch(alert);
  });
  but2.addEventListener("click", () => {
    let stream = video.srcObject;
    let tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
  });
  
});