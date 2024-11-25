//Socket Variables
const express = require('express');
// const path = require('path');
const http = require("http").createServer();
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
const cors = require("cors");
//Routing Variables
const app = express();
const PORT = process.env.PORT || 3000;
/*DO NOT DELETE */
//GPIO Logic Variables
// const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
// var LED = new Gpio(516, 'out'); //use GPIO pin 4, and specify that it is output
// var blinkInterval; //run the blinkLED function every 250ms
// var spiceAmount = 0; //the amount of spice to be dispensed
// var timerOut; // how long the blink function will run
// const interval = 250; //how long the LED stays on/off


app.use(cors());
// Define a route handler for the root path
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

io.on("connection", (socket) => {
  console.log("New client connected"); // Verifying connections from client
  socket.on("disconnect", () => {
    console.log("Client disconnected"); // Verifying Disconnect from client
  
  });
  socket.on('message', (data, isDone) => {
     console.log('Received message:', data); // Recieving sent messages fom clients
     spiceAmount = data;
    /*DO NOT DELETE */
     //  blinkInterval = setInterval(blinkLED, interval);//run the blinkLED function every 250ms
     //timerOut = (interval * spiceAmount) * 2;
    //  console.log('timer', timerOut);
    //  console.log('interval ',interval );
    //  setTimeout(endBlink, timerOut);
    
    setTimeout(()=>{//SIMULATES dispense time, Delete
      isDone = true;
      io.emit('finished', isDone); // Broadcasting the message to all clients that Dispensing is finished
      console.log('Sent message:', isDone);

    }, 5000);
    // isDone = true;
    //  io.emit('finished', isDone); // Broadcasting the message to all clients that Dispensing is finished
    //  console.log('Sent message:', isDone);
});

});



/*DO NOT DELETE */
// //GPIO Functions
// function blinkLED() { //function to start blinking
//   if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
//     LED.writeSync(1); //set pin state to 1 (turn LED on)
//   } else {
//     LED.writeSync(0); //set pin state to 0 (turn LED off)
//   }
// }


// function endBlink() { //function to stop blinking
//   clearInterval(blinkInterval); // Stop blink intervals
//   LED.writeSync(0); // Turn LED off
//   //LED.unexport(); // Unexport GPIO to free resources

// }

http.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});




