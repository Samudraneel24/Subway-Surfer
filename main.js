var cubeRotation = 0.0;
var temp = [1, 4, -9];
var vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;
var vsSource_wall = vsSource;

var fsSource_bw = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      precision mediump float;
      vec4 color = texture2D(uSampler, vTextureCoord);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(vec3(gray), 1.0);
    }
  `;
var fsSource_color = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;
var fsSource_dark = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;
    highp vec3 vLighting;

    void main(void) {
      precision mediump float;
      vec4 color = texture2D(uSampler, vTextureCoord);
      vLighting = color.rgb*vec3(0.5, 0.5, 0.5);
      gl_FragColor = vec4(vLighting, 1.0);
    }
  `;
var fsSource_bw_dark = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      precision mediump float;
      vec4 color = texture2D(uSampler, vTextureCoord);
      float gray = dot(color.rgb*vec3(0.5, 0.5, 0.5), vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(vec3(gray), 1.0);
    }
  `;
var fsSource = fsSource_color;
var fsSource_wall = fsSource_color;
var shaderProgram;
var shaderWall;
var canvas;
var gl;
var programInfo;
var wallInfo;
var wall_option = 0;
var grayscale = 0;
var color_R, color_G, color_B;
var color_op = 1.0;
var Pl;
var num_coin = 0;
var tripped_count = 550;
var bootcounter = 0;
var flycounter = 0;
function detect_collision(a, b) {
    return (Math.abs(a.x - b.x) * 2 < (a.Width + b.Width)) &&
           (Math.abs(a.y - b.y) * 2 < (a.Height + b.Height)) &&
           (Math.abs(a.z - b.z) * 2 < (a.Length + b.Length));
}

function shader_update(){
  if(grayscale == 0){
    fsSource = fsSource_color;
    color_R = 0.45;
    color_G = 0.76;
    color_B = 0.98;
  }
  else{
    fsSource = fsSource_bw;
    color_R = 0.65;
    color_G = 0.65;
    color_B = 0.65;
  }
  shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  if(wall_option == 0 && grayscale == 0)
    fsSource_wall = fsSource_color;
  else if(wall_option == 0 && grayscale == 1)
    fsSource_wall = fsSource_bw;
  else if(wall_option == 1 && grayscale == 0)
    fsSource_wall = fsSource_dark;
  else
    fsSource_wall = fsSource_bw_dark;
  shaderWall = initShaderProgram(gl, vsSource_wall, fsSource_wall);
  wallInfo = {
    program: shaderWall,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderWall, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderWall, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderWall, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderWall, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderWall, 'uSampler'),
    },
  };
}

Mousetrap.bind('g', function() { 
    grayscale = 1 - grayscale;
    shader_update();
 });
Mousetrap.bind('right', function() { temp[0] = -1; });
Mousetrap.bind('left', function() { temp[0] = 1; });
Mousetrap.bind('up', function(){Pl.jump(), Pol.jump()});

main();

//
// Start here
//

function main() {


  canvas = document.querySelector('#glcanvas');
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // c1 = new Track(gl, [-1, 0, 0]);
  // c2 = new Track(gl, [1, 0, 0]);
  floorarr = []
  wallarr = []
  trainarrLeft = []
  trainarrRight = []
  coinarrLeft = []
  coinarrRight = []
  obstaclearr = []
  obstaclearrUp = []
  boot_arr = []
  jet_arr = []
  Pl = new Player(gl, [1, 1.5, 0]);
  Pol = new Police(gl, [1, 1.5, -3]);
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Load texture
  texture = [];
  texture[0] = loadTexture(gl, 'track3.jpg');
  texture[1] = loadTexture(gl, 'brick.jpeg');
  texture[2] = loadTexture(gl, 'train2.png');
  texture[3] = loadTexture(gl, 'gold_texture.jpg');
  texture[4] = loadTexture(gl, "obstacle3.jpg");
  texture[5] = loadTexture(gl, "skin.png");
  texture[6] = loadTexture(gl, "boot2.jpg");
  texture[7] = loadTexture(gl, "Jetpack3.jpg");

  shader_update();

  for(i = 0; i < 5; i++){
    // floor
    floorarr[2*i] = new Track(gl, [-1, 0, 10*i]);
    floorarr[2*i + 1] = new Track(gl, [1, 0, 10*i]);
    // wall
    wallarr[2*i] = new Wall(gl, [-3, 2, 10*i]);
    wallarr[2*i + 1] = new Wall(gl, [3, 2, 10*i]);
  }

  trainarrLeft[0] = new Train(gl, [-1, 2, 60]);
  trainarrRight[0] = new Train(gl, [1, 2, 100]);

  var then = 0;
  var curSpeed = 0.1;
  var trainSpeed = 0.1;
  var counter = 0;

  // Draw the scene repeatedly
  function render(now) {
    // console.log(counter, jet_arr.length);
    if(counter % 20 == 0){
      wall_option = 1 - wall_option;
      shader_update();
    }
    if(counter % 10 == 0){
      Pl.rot_x = -Pl.rot_x;
      Pol.rot_x = -Pol.rot_x;
    }

    Pol.pos[1] = Pl.pos[1];
    // console.log(num_coin);
    // shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    counter++;
    tripped_count++;
    bootcounter++;
    flycounter++;
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    Pl.tick(temp[0]);
    Pol.tick(temp[0]);

    playerBound = {
      x : Pl.pos[0] - 0.35,
      y : Pl.pos[1] - 0.5,
      z : Pl.pos[2] - 0.35,
      Width : 0.7,
      Height : 1.0,
      Length : 0.7,
    }

    if(tripped_count < 500){
      if(Pol.pos[2] < -3){
        speedz = 1.2 - curSpeed;
        Pol.pos[2] += speedz;
      }
    }
    else{
      if(Pol.pos[2] > -10)
        Pol.pos[2] -= 0.02;
    }

    if(counter % 1500 == 0){
      if(Math.random() < 0.5)
        boot_arr.push(new Boot(gl, [1, 1.75 + Math.random()*1.5, 50 + Math.random()*20]));
      else
        boot_arr.push(new Boot(gl, [-1, 1.75 + Math.random()*1.5, 50 + Math.random()*20]));
    }

    if(counter % 2200 == 0){
      if(Math.random() < 0.5)
        jet_arr.push(new Jetpack(gl, [1, 1.75 + Math.random()*1.5, 50 + Math.random()*20]));
      else
        jet_arr.push(new Jetpack(gl, [-1, 1.75 + Math.random()*1.5, 50 + Math.random()*20]));
    }

    if(boot_arr.length > 0){
      boot_arr[0].pos[2] -= curSpeed;
      bootBound = {
        x : boot_arr[0].pos[0] - 0.5,
        y : boot_arr[0].pos[1] - 0.25,
        z : boot_arr[0].pos[2],
        Width : 1,
        Height : 0.5,
        Length : 0.05,
      }
      if(detect_collision(bootBound, playerBound)){
        boot_arr.shift();
        Pl.isBoot = 1;
        bootcounter = 0;
      }
      if(boot_arr.length > 0 && boot_arr[0].pos[2] < -15)
        boot_arr.shift();
    }

    if(jet_arr.length > 0){
      jet_arr[0].pos[2] -= curSpeed;
      jetBound = {
        x : jet_arr[0].pos[0] - 0.5,
        y : jet_arr[0].pos[1] - 0.6,
        z : jet_arr[0].pos[2],
        Width : 1,
        Height : 1.2,
        Length : 0.05,
      }
      if(detect_collision(jetBound, playerBound)){
        jet_arr.shift();
        Pl.fly = 1;
        Pl.pos[1] = 4;
        flycounter = 0;
      }
      if(jet_arr.length > 0 && jet_arr[0].pos[2] < -15)
        jet_arr.shift();
    }

    if(tripped_count > 500)
      curSpeed = 0.1;

    if(bootcounter > 800)
      Pl.isBoot = 0;

    if(flycounter > 800)
      Pl.fly = 0;

    for(i = 0; i < 10; i++){
      // floor
      floorarr[i].pos[2] -= curSpeed;
      if(floorarr[i].pos[2] < -15){
        floorarr[i].pos[2] += 50
      }

      // wall
      wallarr[i].pos[2] -= curSpeed;
      if(wallarr[i].pos[2] < -15){
        wallarr[i].pos[2] += 50
      }
    }

    // coin
    if(counter % 50 == 0){
      if(Math.random() < 0.25)
        coinarrLeft.push(new Coin(gl, [1, Pl.pos[1], 35]));
      if(Math.random() < 0.25)
        coinarrRight.push(new Coin(gl, [-1, Pl.pos[1], 35]));
    }

    if(counter % 200 == 0){
      if(Math.random() < 0.25)
        obstaclearr.push(new Obstacle(gl, [1, 1.5, 60], 1));
      else if(Math.random() < 0.5)
        obstaclearr.push(new Obstacle(gl, [-1, 1.5, 60], 1));
      else if(Math.random() < 0.75)
        obstaclearrUp.push(new Obstacle(gl, [1.5, 2.7, 60], 1.6));
      else
        obstaclearrUp.push(new Obstacle(gl, [-1.5, 2.7, 60], 1.6));
    }

    for(i = 0; i < obstaclearr.length; i++){
      obstaclearr[i].pos[2] -= curSpeed;
      obstacleBound = {
        x : obstaclearr[i].pos[0] - 0.9,
        y : obstaclearr[i].pos[1] - 0.5,
        z : obstaclearr[i].pos[2],
        Width : 1.8,
        Height : 1,
        Length : 0.05,
      }
      if(detect_collision(obstacleBound, playerBound)){
        if(tripped_count < 500){
          alert("GameOver!! Start Again ?");
          location.reload(); 
          return;
        }
        tripped_count = 0;
        curSpeed = 0.06;
      }

    }

    for(i = 0; i < obstaclearrUp.length; i++){
      obstaclearrUp[i].pos[2] -= curSpeed;
      obstacleBound = {
        x : obstaclearrUp[i].pos[0] - 0.9,
        y : obstaclearrUp[i].pos[1] - 0.5*1.6,
        z : obstaclearrUp[i].pos[2],
        Width : 1.8,
        Height : 1.6,
        Length : 0.05,
      }
      if(detect_collision(obstacleBound, playerBound)){
          alert("GameOver!! Start Again ?");
          location.reload(); 
          return;
      }

    }

    if(obstaclearr.length > 0 && obstaclearr[0].pos[2] < -15)
      obstaclearr.shift();

    for(i = 0; i < coinarrLeft.length; i++){
      coinarrLeft[i].pos[2] -= curSpeed;
      coinBound = {
        x : coinarrLeft[i].pos[0] - 0.3,
        y : coinarrLeft[i].pos[1] - 0.3,
        z : coinarrLeft[i].pos[2],
        Width : 0.6,
        Height : 0.6,
        Length : 0.05,
      }
      if(detect_collision(coinBound, playerBound)){
          coinarrLeft.splice(i, 1);
          num_coin++;
          i--;
      }
    }
    for(i = 0; i < coinarrRight.length; i++){
      coinarrRight[i].pos[2] -= curSpeed;
      coinBound = {
        x : coinarrRight[i].pos[0] - 0.3,
        y : coinarrRight[i].pos[1] - 0.3,
        z : coinarrRight[i].pos[2],
        Width : 0.6,
        Height : 0.6,
        Length : 0.05,
      }
      if(detect_collision(coinBound, playerBound)){
          coinarrRight.splice(i, 1);
          num_coin++;
          i--;
      }
    }
    if(coinarrLeft.length > 0 && coinarrLeft[0].pos[2] < -15)
      coinarrLeft.shift();

    if(coinarrRight.length > 0 && coinarrRight[0].pos[2] < -15)
      coinarrRight.shift();

    // train
    trainarrLeft[0].pos[2] -= curSpeed + trainSpeed;
    trainarrRight[0].pos[2] -= curSpeed + trainSpeed;
    trainBoundRightFront = {
        x : trainarrRight[0].pos[0] - 0.9,
        y : trainarrRight[0].pos[1] - 1.0,
        z : trainarrRight[0].pos[2] - 3.0,
        Width : 1.8,
        Height : 2.0,
        Length : 0.05,
    }
    trainBoundLeftFront = {
        x : trainarrLeft[0].pos[0] - 0.9,
        y : trainarrLeft[0].pos[1] - 1.0,
        z : trainarrLeft[0].pos[2] - 3.0,
        Width : 1.8,
        Height : 2.0,
        Length : 0.05,
    }
    if(detect_collision(trainBoundLeftFront, playerBound) || detect_collision(trainBoundRightFront, playerBound)){
      alert("GameOver!! Start Again ?");
      location.reload(); 
      return;
    }

    if(trainarrLeft[0].pos[2] < -15){
      let z = 50 + Math.floor((Math.random() * 50) + 1);
      trainarrLeft[0].pos[2] = z;
    }

    if(trainarrRight[0].pos[2] < -15){
      let z = 50 + Math.floor((Math.random() * 50) + 1);
      trainarrRight[0].pos[2] = z;
    }

    trainBoundLeftSide = {
        x : trainarrLeft[0].pos[0] - 0.9,
        y : trainarrLeft[0].pos[1] - 1.0,
        z : trainarrLeft[0].pos[2] - 0.5,
        Width : 1.8,
        Height : 2.0,
        Length : 2.5,
    }
    trainBoundRightSide = {
        x : trainarrRight[0].pos[0] - 0.9,
        y : trainarrRight[0].pos[1] - 1.0,
        z : trainarrRight[0].pos[2] - 0.5,
        Width : 1.8,
        Height : 2.0,
        Length : 2.5,
    }
    if(detect_collision(trainBoundLeftSide, playerBound)){
      if(tripped_count < 500){
          alert("GameOver!! Start Again ?");
          location.reload(); 
          return;
        }
       tripped_count = 0;
       curSpeed = 0.06;
       temp[0] = 1;
    }
    if(detect_collision(trainBoundRightSide, playerBound)){
      if(tripped_count < 500){
          alert("GameOver!! Start Again ?");
          location.reload(); 
          return;
        }
       tripped_count = 0;
       curSpeed = 0.06;
       temp[0] = -1;
    }

    trainBoundRightTop = {
        x : trainarrRight[0].pos[0] - 0.9,
        y : trainarrRight[0].pos[1] + 1.0,
        z : trainarrRight[0].pos[2],
        Width : 1.8,
        Height : 0.05,
        Length : 6.0,
    }
    trainBoundLeftTop = {
        x : trainarrLeft[0].pos[0] - 0.9,
        y : trainarrLeft[0].pos[1] + 1.0,
        z : trainarrLeft[0].pos[2],
        Width : 1.8,
        Height : 0.05,
        Length : 6.0,
    }    
    if(detect_collision(trainBoundRightTop, playerBound) || detect_collision(trainBoundLeftTop, playerBound)){
      if(Pl.fly == 0 && Pl.pos[1] < 3.5)
       Pl.pos[1] = 3.5;
      Pl.speedy = 0;
    }

    drawScene(gl, wallInfo, programInfo, deltaTime, texture);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//
function drawScene(gl, wallInfo, programInfo, deltaTime, texture) {
  gl.clearColor(color_R, color_G, color_B, color_op);
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 40.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
    var cameraMatrix = mat4.create();
    mat4.translate(cameraMatrix, cameraMatrix, temp);
    var cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    ];

    var up = [0, 1, 0];

    mat4.lookAt(cameraMatrix, cameraPosition, [1, 2.5, 25], up);

    var viewMatrix = cameraMatrix;//mat4.create();

    //mat4.invert(viewMatrix, cameraMatrix);

    var viewProjectionMatrix = mat4.create();

    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

    for(i = 0; i < 10; i++){
      floorarr[i].drawTrack(gl, viewProjectionMatrix, programInfo, deltaTime, texture[0]);
      wallarr[i].drawWall(gl, viewProjectionMatrix, wallInfo, deltaTime, texture[1]);
      // coinarr[i].drawCoin(gl, viewProjectionMatrix, programInfo, deltaTime, texture[3]);
    }

    for(i = 0; i < coinarrLeft.length; i++){
      coinarrLeft[i].drawCoin(gl, viewProjectionMatrix, programInfo, deltaTime, texture[3]);
    }

    for(i = 0; i < coinarrRight.length; i++){
      coinarrRight[i].drawCoin(gl, viewProjectionMatrix, programInfo, deltaTime, texture[3]);
    }

    for(i = 0; i < obstaclearr.length; i++){
      obstaclearr[i].drawObstacle(gl, viewProjectionMatrix, programInfo, deltaTime, texture[4]);
    }

    for(i = 0; i < obstaclearrUp.length; i++){
      obstaclearrUp[i].drawObstacle(gl, viewProjectionMatrix, programInfo, deltaTime, texture[4]);
    }

    trainarrLeft[0].drawTrain(gl, viewProjectionMatrix, programInfo, deltaTime, texture[2]);
    trainarrRight[0].drawTrain(gl, viewProjectionMatrix, programInfo, deltaTime, texture[2]);

    if(boot_arr.length > 0)
      boot_arr[0].drawBoot(gl, viewProjectionMatrix, programInfo, deltaTime, texture[6]);

    if(jet_arr.length > 0)
      jet_arr[0].drawJetpack(gl, viewProjectionMatrix, programInfo, deltaTime, texture[7]);

    Pl.drawPlayer(gl, viewProjectionMatrix, programInfo, deltaTime);
    Pol.drawPolice(gl, viewProjectionMatrix, programInfo, deltaTime);

}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
