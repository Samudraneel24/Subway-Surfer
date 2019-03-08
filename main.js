var cubeRotation = 0.0;
var temp = [1, 2.5, -5];
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
var fsSource = fsSource_color;
var shaderProgram;
var canvas;
var gl;
var programInfo;
var grayscale = 0;
var color_R, color_G, color_B;
var color_op = 1.0;

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
}

Mousetrap.bind('g', function() { 
    grayscale = 1 - grayscale;
    shader_update();
 });
Mousetrap.bind('right', function() { temp[0] = -1; });
Mousetrap.bind('left', function() { temp[0] = 1; });

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
    // shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    counter++;
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    for(i = 0; i < 10; i++){
      // floor
      floorarr[i].pos[2] -= curSpeed;
      if(floorarr[i].pos[2] < -10){
        floorarr[i].pos[2] += 50
      }

      // wall
      wallarr[i].pos[2] -= curSpeed;
      if(wallarr[i].pos[2] < -10){
        wallarr[i].pos[2] += 50
      }
    }

    // coin
    if(counter % 50 == 0){
      if(Math.random() < 0.25)
        coinarrLeft.push(new Coin(gl, [1, 1.5, 100]));
      if(Math.random() < 0.25)
        coinarrRight.push(new Coin(gl, [-1, 1.5, 100]));
    }

    if(counter % 200 == 0){
      if(Math.random() < 0.5)
        obstaclearr.push(new Obstacle(gl, [1, 1.5, 60]));
      else
        obstaclearr.push(new Obstacle(gl, [-1, 1.5, 60]));
    }

    for(i = 0; i < obstaclearr.length; i++)
      obstaclearr[i].pos[2] -= curSpeed;

    if(obstaclearr.length > 0 && obstaclearr[0].pos[2] < -10)
      obstaclearr.shift();

    for(i = 0; i < coinarrLeft.length; i++){
      coinarrLeft[i].pos[2] -= curSpeed;
    }
    for(i = 0; i < coinarrRight.length; i++){
      coinarrRight[i].pos[2] -= curSpeed;
    }
    if(coinarrLeft.length > 0 && coinarrLeft[0].pos[2] < -10)
      coinarrLeft.shift();

    if(coinarrRight.length > 0 && coinarrRight[0].pos[2] < -10)
      coinarrRight.shift();

    // train
    trainarrLeft[0].pos[2] -= curSpeed + trainSpeed;
    trainarrRight[0].pos[2] -= curSpeed + trainSpeed;
      if(trainarrLeft[0].pos[2] < -10){
        let z = 50 + Math.floor((Math.random() * 50) + 1);
        trainarrLeft[0].pos[2] = z;
      }

       if(trainarrRight[0].pos[2] < -10){
        let z = 50 + Math.floor((Math.random() * 50) + 1);
        trainarrRight[0].pos[2] = z;
      }
    // console.log(trainarrLeft.length);
    drawScene(gl, programInfo, deltaTime, texture);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime, texture) {
  // gl.clearColor((0.45, 0.76, 0.98, 1.0));  // Clear to black, fully opaque
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
      wallarr[i].drawWall(gl, viewProjectionMatrix, programInfo, deltaTime, texture[1]);
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

    trainarrLeft[0].drawTrain(gl, viewProjectionMatrix, programInfo, deltaTime, texture[2]);
    trainarrRight[0].drawTrain(gl, viewProjectionMatrix, programInfo, deltaTime, texture[2]);

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
