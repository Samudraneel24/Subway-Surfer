var cubeRotation = 0.0;
var temp = [1, 2.5, -5];
Mousetrap.bind('right', function() { temp[0] = -1; });
Mousetrap.bind('left', function() { temp[0] = 1; });

main();

//
// Start here
//

function main() {


  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

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

  // Vertex shader program

  // const vsSource = `
  //   attribute vec4 aVertexPosition;
  //   attribute vec4 aVertexColor;

  //   uniform mat4 uModelViewMatrix;
  //   uniform mat4 uProjectionMatrix;

  //   varying lowp vec4 vColor;

  //   void main(void) {
  //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  //     vColor = aVertexColor;
  //   }
  // `;
  const vsSource = `
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

  // Fragment shader program

  // const fsSource = `
  //   varying lowp vec4 vColor;

  //   void main(void) {
  //     gl_FragColor = vColor;
  //   }
  // `;
  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  // Load texture
  texture = [];
  texture[0] = loadTexture(gl, 'track3.jpg');
  texture[1] = loadTexture(gl, 'brick.jpeg');
  texture[2] = loadTexture(gl, 'train2.png');
  texture[3] = loadTexture(gl, 'hehehe.jpg');
  texture[4] = loadTexture(gl, "obstacle2.jpg");

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  // const programInfo = {
  //   program: shaderProgram,
  //   attribLocations: {
  //     vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
  //     vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
  //   },
  //   uniformLocations: {
  //     projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
  //     modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
  //   },
  // };
  const programInfo = {
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

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers

  for(i = 0; i < 5; i++){
    // floor
    floorarr[2*i] = new Track(gl, [-1, 0, 10*i]);
    floorarr[2*i + 1] = new Track(gl, [1, 0, 10*i]);
    // wall
    wallarr[2*i] = new Wall(gl, [-3, 2, 10*i]);
    wallarr[2*i + 1] = new Wall(gl, [3, 2, 10*i]);
    // console.log(wallarr[2*i]);

    // coinarr[2*i] = new Coin(gl, [-1, 2, 10*i]);
    // coinarr[2*i + 1] = new Coin(gl, [1, 2, 10*i]);
    // console.log(coinarr[2*i]);
  }
  // C = new Coin(gl, [1, 2, 10]);

  trainarrLeft[0] = new Train(gl, [-1, 2, 60]);
  trainarrRight[0] = new Train(gl, [1, 2, 100]);

  var then = 0;
  var curSpeed = 0.1;
  var trainSpeed = 0.1;
  var counter = 0;

  // Draw the scene repeatedly
  function render(now) {
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
        obstaclearr.push(new Obstacle(gl, [1, 1.75, 60]));
      else
        obstaclearr.push(new Obstacle(gl, [-1, 1.75, 60]));
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
  gl.clearColor(0.45, 0.76, 0.98, 1.0);  // Clear to black, fully opaque
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
    // C.drawCoin(gl, viewProjectionMatrix, programInfo, deltaTime, texture[3]);

  // c1.drawTrack(gl, viewProjectionMatrix, programInfo, deltaTime, texture);
  // c2.drawTrack(gl, viewProjectionMatrix, programInfo, deltaTime, texture);

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
