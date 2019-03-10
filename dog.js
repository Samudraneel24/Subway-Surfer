/// <reference path="webgl.d.ts" />

let Dog = class {
    constructor(gl, pos) {
      this.rotation = 0;
      this.pos = pos;
      this.speedx = 0, this.speedy = 0, this.speedz = 0;
      this.g = -0.008;
      this.isJump = 0;
      this.isBoot = 0;
      this.fly = 0;
      this.rot_x = 20;
      this.isDuck = 0;

      this.Body = new Cube(gl, [pos[0], pos[1], pos[2]], 0.15, 0.15, 0.2, 0);
      this.Face = new Cube(gl, [pos[0], pos[1] + 0.1125, pos[2]] + 0.125, 0.075, 0.075, 0.075, 0);
      this.left_leg = new Cube(gl, [pos[0] + 0.075, pos[1] - 0.2, pos[2]] - 0.1375, 0.075, 0.12, 0.075, 15);
      this.right_leg = new Cube(gl, [pos[0] - 0.075, pos[1] - 0.2, pos[2]] - 0.1375, 0.075, 0.12, 0.075, -15);
      this.left_ear = new Cube(gl, [pos[0] + 0.2, pos[1] + 0.2, pos[2]] + 0.125, 0.05, 0.05, 0.075, 15);
      this.right_ear = new Cube(gl, [pos[0] - 0.2, pos[1] + 0.2, pos[2]] + 0.125, 0.05, 0.05, 0.075, -15);
      this.texture_skin = loadTexture(gl, "dog.jpg");
      this.texture_black = loadTexture(gl, "black.jpg");
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
        if(this.isDuck == 0){
          this.speedy += this.g;
          if(this.pos[1] <= 1.5){
            this.pos[1] = 1.5;
            this.isJump = 0;
            this.speedy = 0.0;
          }
        }
      }
      this.Body.pos = [this.pos[0], this.pos[1], this.pos[2]];
      this.Face.pos = [this.pos[0], this.pos[1] + 0.13, this.pos[2]];
      this.left_leg.pos = [this.pos[0] + 0.075, this.pos[1] - 0.2, this.pos[2] - 0.15];
      this.right_leg.pos = [this.pos[0] - 0.075, this.pos[1] - 0.2, this.pos[2] - 0.15];
      this.left_ear.pos = [this.pos[0] + 0.15, this.pos[1] + 0.2, this.pos[2]];
      this.right_ear.pos = [this.pos[0] - 0.15, this.pos[1] + 0.2, this.pos[2]];
      this.left_leg.rot_x = this.rot_x;
      this.right_leg.rot_x = -this.rot_x;
    }

    drawDog(gl, projectionMatrix, programInfo, deltaTime) {
      this.Body.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_skin);
      this.Face.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_skin);
      this.right_ear.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_black);
      this.left_ear.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_black);
      this.left_leg.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_skin);
      this.right_leg.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_skin);
    }
};