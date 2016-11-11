let isOn = false;
const interval = 500; // 500 milliseconds = 0.5 seconds

/**
 * The `main` function gets executed when the board is initialized.
 * Development: npm run dev
 * Production: npm run deploy
 */
function main() {
    setInterval(() => {
        isOn = !isOn; // Flips the state on or off
        digitalWrite(D2, isOn); // D2 is the blue LED on the ESP8266 boards
    }, interval);
}
