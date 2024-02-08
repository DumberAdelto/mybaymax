import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Board, Button, Repl, Led, Proximity } = require('johnny-five');
const player = require('play-sound')();
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3000;
const server = http.createServer(app);
const ws = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const audioPath = 'media/baymax-intro.mp3';
const board = new Board();
let button;
let ultrasonicButton;
let led;
let blueLed;
let spokenHold = false;
let spokenUp = false;
let latestDistanceData = {};
let latestModeData = {};
let onlineLed;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/media', express.static(path.join(__dirname, 'media')));

app.get('/getDistanceData', (req, res) => {
  res.json({ data: latestDistanceData });
});
app.get('/getModeData', (req, res) => {
  res.json({ data: latestModeData });
});

app.get('/', (req, res) => {
  res.render('index', { data: latestDistanceData, latestModeData });
});

app.get('/html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

ws.on('connection', (client) => {
  client.on('message', (msg) => {
    console.log(`Received message: ${msg}`);
  });

  client.send(JSON.stringify({ event: 'distance-updated', data: latestDistanceData }));
  client.send(JSON.stringify({ event: 'distance-updated', data: latestModeData }));
});

board.on('ready', () => {
  const proximity = new Proximity({
    controller: 'HCSR04',
    pin: 7
  });
  app.get('/toggleLed', (req, res) => {
    onlineLed.toggle();
    res.send('LED toggled');
  });

  // Increase the maximum number of listeners for proximity
  proximity.setMaxListeners(20);
  player.play(audioPath, (err) => {
    if (err) {
      console.error('Error playing audio:', err);
      player.play('media/oh_no.mp3', (err) => {
        console.error('Error playing audio:', err);
        if (err) {
          console.error('Error playing audio (x2):', err);
        }
      });
    }
  });
  led = new Led(13);
  blueLed = new Led(12);
  const repl = new Repl(board);

  button = new Button(2);
  ultrasonicButton = new Button(3);
  let pressCount = 0;
  let bluePressCount = 0;
  const ultraLed = new Led(10);
  ultrasonicButton.on('hold', () => {
    ultraLed.on()
    proximity.on('data', ({ centimeters, inches }) => {
      const data = {
        cm: centimeters,
        in: inches,
      };

      latestDistanceData = data;
      if (ultrasonicButton.downValue === 1) {
          // setTimeout(() => {
            // console.log(`Ultrasonic Sensor Reading`);
            // console.log(`centimeters: ${centimeters}cm`);
            // console.log(`inches: ${inches}in`)
            // console.log(`------------------`);
            // console.log(`------------------`);
            // console.log(`------------------`);
            // console.log(`------------------`);
            // console.log(`------------------`);
            app.get('/proximity', function (req, res) {
              res.json({
                "cm": centimeters,
                "in": inches
              })
            })
          // }, 100)
      } else return;
    });
  });

  ultrasonicButton.on('up', () => {
    ultraLed.off();
    // Stop listening for proximity changes
    proximity.removeAllListeners('data');
  });

  let dataState;
  button.on('hold', () => {
    if (!spokenHold) {
      led.on();
      blueLed.off();
      pressCount++;
      console.log(`LED RED ON! ${pressCount} is the total amount of times the red LED has been toggled!`);
      player.play('media/busy_mode.wav');
      spokenHold = true;
      spokenUp = false;
      if (pressCount === "1") {
        dataState = `${pressCount}st`;
      } else if (pressCount === "2") {
        dataState = `${pressCount}nd`;
      } else if (pressCount === "3") {
        dataState = `${pressCount}rd`;
      } else if (pressCount === "4" || pressCount > "4") {
        dataState = `${pressCount}th`;
      }
      const data = {
        state: `<br>Busy 🔴 (${dataState} time toggled to busy mode)`
      }
      latestModeData = data;
    }
  });

  button.on('up', () => {
    if (!spokenUp) {
      led.off();
      blueLed.on();
      bluePressCount++;
      console.log(`LED BLUE ON! ${bluePressCount} is the total amount of times the blue LED has been toggled!`);
      player.play('media/availiable_mode.wav');
      spokenUp = true;
      spokenHold = false;
      if (bluePressCount === 1) {
        dataState = `${bluePressCount}st`;
      } else if (bluePressCount === 2) {
        dataState = `${bluePressCount}nd`;
      } else if (bluePressCount === 3) {
        dataState = `${bluePressCount}rd`;
      } else if (bluePressCount === 4 || bluePressCount > 4) {
        dataState = `${bluePressCount}th`;
      }
      const data = {
        state: `<br>Avaliable 🟢 (${dataState} time toggled to avaliable mode)`
      }
      latestModeData = data;
    }
  });

  repl.inject({
    buttonState: () => (button.isPressed ? 'pressed' : 'released'),
    ledOn: () => {
      led.on();
      spokenHold = false;
      spokenUp = false;
    },
    ledOff: () => {
      led.off();
    },
  });

  server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});