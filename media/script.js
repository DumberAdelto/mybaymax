const socket = io('/sse');

socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('distance-updated', (data) => {
  // Update the DOM with the new distance data
  document.getElementById('distanceData').innerHTML = `
    <h1>Distance data:</h1>
    <p>Centimeters: ${data.cm.toFixed(2)} cm</p>
    <p>Inches: ${data.data.in.toFixed(2)} in</p>
  `;
});