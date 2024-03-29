/// <reference path="webgl.d.ts" />

let Police = class {
    constructor(gl, pos) {
      this.rotation = 0;
      this.pos = pos;
      this.speedx = 0, this.speedy = 0, this.speedz = 0;
      this.g = -0.008;
      this.isJump = 0;
      this.isBoot = 0;
      this.fly = 0;
      this.rot_x = 20;
      let scale = 1.3;
      this.scale = scale;

      this.Body = new Cube(gl, [pos[0], pos[1] + scale*0.15, pos[2]], scale*0.15, scale*0.15, scale*0.075, 0);
      this.Face = new Cube(gl, [pos[0], pos[1] + scale*0.375, pos[2]], scale*0.075, scale*0.075, scale*0.075, 0);
      this.hair = new Cube(gl, [pos[0], pos[1] + scale*0.475, pos[2]], scale*0.075, scale*0.025, scale*0.075, 0);
      this.left_leg = new Cube(gl, [pos[0] + scale*0.075, pos[1] - scale*0.2, pos[2]], scale*0.075, scale*0.2, scale*0.075, 15);
      this.right_leg = new Cube(gl, [pos[0] - scale*0.075, pos[1] - scale*0.2, pos[2]], scale*0.075, scale*0.2, scale*0.075, -15);
      this.left_shoe = new Cube(gl, [pos[0] + scale*0.075, pos[1] - scale*0.45, pos[2]], scale*0.075, scale*0.05, scale*0.075, 15);
      this.right_shoe = new Cube(gl, [pos[0] - scale*0.075, pos[1] - scale*0.45, pos[2]], scale*0.075, scale*0.05, scale*0.075, -15);
      this.left_sleeve = new Cube(gl, [pos[0] + scale*0.2, pos[1] + scale*0.25, pos[2]], scale*0.05, scale*0.05, scale*0.075, 15);
      this.right_sleeve = new Cube(gl, [pos[0] - scale*0.2, pos[1] + scale*0.25, pos[2]], scale*0.05, scale*0.05, scale*0.075, -15);
      this.left_hand = new Cube(gl, [pos[0] + scale*0.2, pos[1] + scale*0.075, pos[2]], scale*0.05, scale*0.125, scale*0.075, 15);
      this.right_hand = new Cube(gl, [pos[0] - scale*0.2, pos[1] + scale*0.075, pos[2]], scale*0.05, scale*0.125, scale*0.075, -15);
      this.texture_skin = loadTexture(gl, "skin.png");
      this.texture_black = loadTexture(gl, "black.jpg");
      this.texture_violet = loadTexture(gl, "violet.jpg");
      this.texture_lm10 = loadTexture(gl, "lm10.jpg");
      this.texture_white = loadTexture(gl, "white.jpeg");
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
      this.Body.pos = [this.pos[0], this.pos[1] + this.scale*0.15, this.pos[2]];
      this.Face.pos = [this.pos[0], this.pos[1] + this.scale*0.375, this.pos[2]];
      this.hair.pos = [this.pos[0], this.pos[1] + this.scale*0.475, this.pos[2]];
      this.left_leg.pos = [this.pos[0] + this.scale*0.12, this.pos[1] - this.scale*0.2, this.pos[2]];
      this.right_leg.pos = [this.pos[0] - this.scale*0.12, this.pos[1] - this.scale*0.2, this.pos[2]];
      this.left_shoe.pos = [this.pos[0] + this.scale*0.18, this.pos[1] - this.scale*0.45, this.pos[2]];
      this.right_shoe.pos = [this.pos[0] - this.scale*0.18, this.pos[1] - this.scale*0.45, this.pos[2]];
      this.left_sleeve.pos = [this.pos[0] + this.scale*0.2, this.pos[1] + this.scale*0.25, this.pos[2]];
      this.right_sleeve.pos = [this.pos[0] - this.scale*0.2, this.pos[1] + this.scale*0.25, this.pos[2]];
      this.left_hand.pos = [this.pos[0] + this.scale*0.24, this.pos[1] + this.scale*0.075, this.pos[2]];
      this.right_hand.pos = [this.pos[0] - this.scale*0.24, this.pos[1] + this.scale*0.075, this.pos[2]];
      // this.Body.rot_x = this.rot_x;
      // this.Face.rot_x = this.rot_x;
      // this.hair.rot_x = this.rot_x;
      this.left_leg.rot_x = this.rot_x;
      this.left_sleeve.rot_x = this.rot_x;
      this.left_hand.rot_x = this.rot_x;
      this.left_shoe.rot_x = this.rot_x;
      this.right_shoe.rot_x = -this.rot_x;
      this.right_leg.rot_x = -this.rot_x;
      this.right_sleeve.rot_x = -this.rot_x;
      this.right_hand.rot_x = -this.rot_x;
    }

    drawPolice(gl, projectionMatrix, programInfo, deltaTime) {
      this.Body.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_lm10);
      this.Face.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_black);
      this.hair.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_black);
      this.left_leg.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_violet);
      this.right_leg.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_violet);
      this.left_shoe.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_white);
      this.right_shoe.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_white);
      this.left_sleeve.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_dark_violet);
      this.right_sleeve.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_dark_violet);
      this.left_hand.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_skin);
      this.right_hand.drawCube(gl, projectionMatrix, programInfo, deltaTime, this.texture_skin);
    }
};