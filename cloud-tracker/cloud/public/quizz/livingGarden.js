const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Arrays
const orbs = [];
const flowers = [];
const flowerTypes = ["🌸","🌼","🌷","💮","🌻"];

class Orb {
  constructor() {
    this.x = Math.random()*canvas.width;
    this.y = canvas.height + Math.random()*200;
    this.radius = Math.random()*6+4;
    this.speed = Math.random()*1+0.2;
    this.alpha = Math.random()*0.5+0.3;
  }
  update() { this.y -= this.speed; if(this.y<-10) this.y = canvas.height+10; }
  draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.radius,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${this.alpha})`; ctx.fill(); }
}

class Flower {
  constructor(x,y,type) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.maxSize = Math.random()*30+10;
    this.growSpeed = Math.random()*0.2+0.05;
    this.type = type;
    this.swayOffset = Math.random()*Math.PI*2;
  }
  update() { if(this.size<this.maxSize)this.size+=this.growSpeed; this.swayOffset+=0.01; }
  draw() {
    ctx.save();
    ctx.translate(this.x+Math.sin(this.swayOffset)*5,this.y);
    ctx.font = this.size+'px Arial';
    ctx.fillText(this.type,0,0);
    ctx.restore();
  }
}

// initialize orbs
for(let i=0;i<50;i++) orbs.push(new Orb());

function animate() {
  // soft gradient background
  const gradient = ctx.createLinearGradient(0,0,0,canvas.height);
  gradient.addColorStop(0,'#a0e9ff');
  gradient.addColorStop(1,'#c2f0c2');
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  orbs.forEach(o=>{o.update(); o.draw();});
  flowers.forEach(f=>{f.update(); f.draw();});

  requestAnimationFrame(animate);
}
animate();

function bloomFlower() {
  const x = Math.random()*canvas.width;
  const y = canvas.height - 50 - Math.random()*150;
  const type = flowerTypes[Math.floor(Math.random()*flowerTypes.length)];
  flowers.push(new Flower(x,y,type));
}

// resize
window.addEventListener('resize',()=>{canvas.width=window.innerWidth; canvas.height=window.innerHeight;});
