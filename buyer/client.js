const express = require('express');
const app = express();
const path = require('path');
//display data to web page
const client_server = require('http').Server(app);
const io = require('socket.io')(client_server);
//connect to sdpp server to get data
const sdpp_client = require('socket.io-client');
const client_socket =  sdpp_client.connect('http://seller:3000');
//const client_socket =  sdpp_client.connect('http://localhost:3000');
const iota = require('./iotaModule');

const sender_seed = 'RAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHUL9RAHUL';
const recv_address ='HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD';

var hash = '';
var payment_granularity = 0;;
var cost = 2;

app.get('/', (req,res) =>{
  res.sendFile(path.join(__dirname, 'index.html'));
})

//data from SDPP server
client_socket.on('connect', function(){
  console.log('Connected to SDPP server')

  client_socket.on('image',function(data){
    console.log('img from sdpp server, forward')
    io.to('lobby').emit('image',data)
  })

  client_socket.on('DATA_INVOICE',function(data){

    async function payment(){
      try{
        console.log('*** Received Innovice ***')
        console.log('Processing payment...')
        payment_granularity = data
        payment_invoice = "Sent: " + payment_granularity;
        payment_invoice += "\nPayment: " + payment_granularity*cost;
        hash = await iota.sendTokens(sender_seed, recv_address, 0, payment_invoice);
        client_socket.emit('PAYMENT_ACK',hash);
        console.log('Sent payment transaction_hash:',hash);
      }catch(e){
        console.log(e);
      }
    }

    payment();
  })
})
//connection to the web display
io.sockets.on('connection',(socket) =>{
  console.log('Connected to web page display');

  socket.join('lobby');
  socket.on('image',(data) =>{
    console.log('forward')
    client_socket.emit('image',data);
  })


});

client_server.listen(8080);
