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
        <p>${data.data.state}</p>
      `;
    })
    .catch(error => console.error('Error:', error));
}

// Call refreshSection every second
setInterval(refreshModeSection, 500);

document.addEventListener("DOMContentLoaded", () => {
  let but = document.getElementById("but");
  let but2 = document.getElementById("but2");
  let toggleButton = document.getElementById("toggleButton");
  let musicButton = document.getElementById("musicMode");

  toggleButton.addEventListener("click", () => {
    fetch('/toggleLed')
      .then(response => {
        if (response.ok) {
          console.log('LED toggled successfully');
        } else {
          throw new Error('Failed to toggle LED');
        }
      })
      .catch(error => console.error('Error toggling LED:', error));
  });

  but.addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        let video = document.getElementById("vid");
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
          video.play();
          document.getElementById("vid").style.transform = "scaleX(-1)";
        });
      })
      .catch(error => console.error('Error accessing camera:', error));
  });

  but2.addEventListener("click", () => {
    let video = document.getElementById("vid");
    let stream = video.srcObject;
    if (stream) {
      let tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
  });

  musicButton.addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
        scriptProcessor.onaudioprocess = function () {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          const arraySum = array.reduce((a, value) => a + value, 0);
          const average = arraySum / array.length * 7;
          console.log(Math.round(average));

          // Adjust the LED brightness based on the average value
          fetch(`/adjustLedBrightness?brightness=${Math.round(average)}`)
            .then(response => {
              if (response.ok) {
                console.log('LED brightness adjusted successfully');
              } else {
                throw new Error('Failed to adjust LED brightness');
              }
            })
            .catch(error => console.error('Error adjusting LED brightness:', error));
        };
      })
      .catch(error => console.error('Error accessing microphone:', error));
  });
});

