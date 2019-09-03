//const cv = require('opencv4nodejs')
//global.cv = require('/usr/lib/node_modules/opencv4nodejs')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');
const { getVideoDurationInSeconds } = require('get-video-duration')

const io = require('socket.io').listen(process.env.PORT || 3000);
const iota = require('./iotaModule');
const fs = require('fs');

const FPS = 20;
var payment_granularity = 500;
var cost = 2;
var duration = 0;


function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

getVideoDurationInSeconds('sample4.mp4').then((dur) => {
  duration = dur;
})

ffmpeg('sample4.mp4')
    .fps(36)
    .on('end', function() {
      console.log('Screenshots taken');
    })
    .output('frames-%04d.jpg')
    .run()


  // for (i = 1; i < 10; i++) {
  //   const frame_name = '../frames/frames-' + pad(i,4) +'.jpg';
  //   console.log('read ',frame_name);
  // }


io.sockets.on('connection',(socket) =>{
  console.log('Connected to client!')
  var imageCount = 0;
  var isPaused = 0;
  var index = 1;
  setInterval(() => {
    //console.log('count:',imageCount)
    //console.log('paused:',isPaused)
    if(index>duration*36){index =1;}
    if(isPaused == 0){
      if(imageCount % payment_granularity == 0){
        isPaused = 1;
        console.log('*** Paused, wait for payment ***')
        socket.emit('DATA_INVOICE', payment_granularity);
      }
      // const frame = wCap.read();
      // const image = cv.imencode('.jpg',frame).toString('base64');
      // socket.emit('image',image);
      //const frame_name = '../frames/frames-' + pad(index,4) +'.jpg';
      //console.log('read ',frame_name);

      //const filepath = path.resolve(dir, filename);
      const filename = 'frames-' + pad(index,4) +'.jpg';
      const frame = fs.readFileSync(filename);

      const image = frame.toString('base64');
      socket.emit('image',image);
      index++;

      imageCount++;
    }
  }, 1000/FPS)

  socket.on('PAYMENT_ACK',(data) =>{
    console.log('*** Received PAYMENT_ACK ***');
    console.log(`[Transcation hash: ${data}]`);
    console.log('Resuming...')
    setTimeout(function(){
      isPaused = 0;
    },1000);
  })
})



//server.listen(3000);
