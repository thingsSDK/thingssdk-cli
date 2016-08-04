var isOn = false;
var interval = 500; // 500 milliseconds = 0.5 seconds

setInterval(function(){
    isOn = !isOn; // Flips the state on or off
    digitalWrite(D2, isOn); // D2 is the blue LED on the ESP8266 boards
}, interval);
