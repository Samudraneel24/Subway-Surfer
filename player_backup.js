/// <reference path="webgl.d.ts" />

let Player = class {
    constructor(gl, pos) {

        this.rotation = 0;
        this.pos = pos;
        this.speedx = 0, this.speedy = 0, this.speedz = 0;
        this.g = -0.008;
        this.isJump = 0;
        this.isBoot = 0;
        this.fly = 0;

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        this.positions = [
             // Front face
             -0.35, -0.5, 0.35,
             0.35, -0.5, 0.35,
             0.35, 0.5, 0.35,
             -0.35, 0.5, 0.35,
             //Back Face
             -0.35, -0.5, -0.35,
             0.35, -0.5, -0.35,
             0.35, 0.5, -0.35,
             -0.35, 0.5, -0.35,
             //Top Face
             -0.35, 0.5, -0.35,
             0.35, 0.5, -0.35,
             0.35, 0.5, 0.35,
             -0.35, 0.5, 0.35,
             //Bottom Face
             -0.35, -0.5, -0.35,
             0.35, -0.5, -0.35,
             0.35, -0.5, 0.35,
             -0.35, -0.5, 0.35,
             //Left Face
             -0.35, -0.5, -0.35,
             -0.35, 0.5, -0.35,
             -0.35, 0.5, 0.35,
             -0.35, -0.5, 0.35,
             //Right Face
             0.35, -0.5, -0.35,
             0.35, 0.5, -0.35,
             0.35, 0.5, 0.35,
             0.35, -0.5, 0.35,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions),
                        gl.STATIC_DRAW);

        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

        const textureCoordBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

          const textureCoordinates = [
            // Front
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Back
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Top
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Bottom
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Right
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Left
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
          ];

          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                        gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0, 1, 2,    0, 2, 3, // front
            4, 5, 6,    4, 6, 7,
            8, 9, 10,   8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23, 
        ];

        // Now send the element array to GL

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);

        this.buffer = {
            position: this.positionBuffer,
            texture: textureCoordBuffer,
            indices: indexBuffer,
        }

    }

    jump(){
      if(this.fly == 0 && this.isJump == 0){
        this.isJump = 1;
        if(this.isBoot == 1)
          this.speedy = 0.24;
        else
          this.speedy = 0.17;
      }
    }

    tick(xcord){
      this.pos[0] = xcord;
      if(this.fly == 0){
        this.pos[1] += this.speedy;
        this.speedy += this.g;
        if(this.pos[1] <= 1.5){
          this.pos[1] = 1.5;
          this.isJump = 0;
          this.speedy = 0.0;
        }
      }
    }

    drawPlayer(gl, projectionMatrix, PlayerInfo, deltaTime, texture) {
        const modelViewMatrix = mat4.create();
        mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            this.pos
        );
        
        //this.rotation += Math.PI / (((Math.random()) % 100) + 50);

        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            this.rotation,
            [1, 1, 1]);

        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
            gl.vertexAttribPointer(
                PlayerInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                PlayerInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.texture);
            gl.vertexAttribPointer(
                PlayerInfo.attribLocations.textureCoord,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                PlayerInfo.attribLocations.textureCoord);
            // Tell WebGL we want to affect texture unit 0
          gl.activeTexture(gl.TEXTURE0);

          // Bind the texture to texture unit 0
          gl.bindTexture(gl.TEXTURE_2D, texture);

          // Tell the shader we bound the texture to texture unit 0
          gl.uniform1i(PlayerInfo.uniformLocations.uSampler, 0 );
        }

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

        // Tell WebGL to use our program when drawing

        gl.useProgram(PlayerInfo.program);

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            PlayerInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            PlayerInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    }
};