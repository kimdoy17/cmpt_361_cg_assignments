import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw line
  let dx = x2 - x1;
  let dy = y2 - y1;

  let color1 = [r1, g1, b1];
  let color2 = [r2, g2, b2];
  let step;
  if (Math.abs(dx) >= Math.abs(dy)) {
    step = Math.abs(dx);
  }
  else {
    step = Math.abs(dy);
  }
  dx /= step;
  dy /= step;

  let x = x1
  let y = y1
  for (let i = 0; i <= step; ++i) {
    let frac = i / step;
    let colormix = color_interp(color1, color2, frac)
    this.setPixel(Math.floor(x), Math.floor(y), colormix);
    x += dx;
    y += dy;
  }
}

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v1, v2, v3) {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  const [x3, y3] = v3;

  const xmin = Math.ceil(Math.min(x1,x2,x3));
  const xmax = Math.ceil(Math.max(x1,x2,x3));
  const ymin = Math.ceil(Math.min(y1,y2,y3));
  const ymax = Math.ceil(Math.max(y1,y2,y3));

  for (let x = xmin; x <= xmax; x++) {
    for (let y = ymin; y <= ymax; y++) {
      let p = [x + 0.5, y + 0.5];
      let color = barycentricCoordinates(v1, v2, v3, p);
      if (pointIsInsideTriangle(v1, v2, v3, p)) {
        this.setPixel(x, y, color);
      }
    }
  }
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw triangle
}

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "v,10,10,1.0,0.0,0.0;",
  "v,52,52,0.0,1.0,0.0;",
  "v,52,10,0.0,0.0,1.0;",
  "v,10,52,1.0,1.0,1.0;",
  "t,0,1,2;",
  "t,0,3,1;",
  "v,10,10,1.0,1.0,1.0;",
  "v,10,52,0.0,0.0,0.0;",
  "v,52,52,1.0,1.0,1.0;",
  "v,52,10,0.0,0.0,0.0;",
  "l,4,5;",
  "l,5,6;",
  "l,6,7;",
  "l,7,4;"
].join("\n");

function color_interp(color1,color2,frac) {
  const [r1,g1,b1] = color1;
  const [r2,g2,b2] = color2;
  const r = (r2 - r1) * frac + r1;
  const g = (g2 - g1) * frac + g1;
  const b = (b2 - b1) * frac + b1;
  return [r,g,b]
}

function barycentricCoordinates(v1, v2, v3, p) {
  const [x1, y1, [r1,g1,b1]] = v1;
  const [x2, y2, [r2,g2,b2]] = v2;
  const [x3, y3, [r3,g3,b3]] = v3;
  const [px, py] = p;
  const a1 = tripleProduct(x2,y2,x3,y3,px,py);
  const a2 = tripleProduct(x3,y3,x1,y1,px,py);
  const A = tripleProduct(x1, y1, x2, y2, x3, y3);
  const u = a1 / A; 
  const v = a2 / A; 
  const w = 1.0 - u - v;   
  const r = u * r1 + v * r2 + w * r3;
  const g = u * g1 + v * g2 + w * g3;
  const b = u * b1 + v * b2 + w * b3;
  return [r, g, b]
}


function pointIsInsideTriangle(v1,v2,v3,p){
  const [x1,y1] = v1;
  const [x2,y2] = v2;
  const [x3,y3] = v3;
  const [px,py] = p;
  
  const w1 = tripleProduct(x1, y1, x2, y2, px, py);
  const w2 = tripleProduct(x2, y2, x3, y3, px, py);
  const w3 = tripleProduct(x3, y3, x1, y1, px, py);

  const area = tripleProduct(x1, y1, x2, y2, x3, y3);

  const topLeft1 = isTopLeft(v1, v2);
  const topLeft2 = isTopLeft(v2, v3);
  const topLeft3 = isTopLeft(v3, v1);

  if (area > 0) {
    return (w1 > 0 || (w1 === 0 && topLeft1)) &&
           (w2 > 0 || (w2 === 0 && topLeft2)) &&
           (w3 > 0 || (w3 === 0 && topLeft3));
  } else {        // CW -> signs flip
    return (w1 < 0 || (w1 === 0 && topLeft1)) &&
           (w2 < 0 || (w2 === 0 && topLeft2)) &&
           (w3 < 0 || (w3 === 0 && topLeft3));
  }
}


function isTopLeft (v0,v1) {
  const [x1, y1] = v0;
  const [x2, y2] = v1;
  let x = 0;
  let y = 1;
  const edge = [x2 - x1, y2 - y1];

  const is_top_edge = edge[y] === 0 && edge[x] > 0; 
  const is_left_edge = edge[y] > 0;

  return is_left_edge || is_top_edge;
}

const tripleProduct = (x0, y0, x1, y1, px, py) => px*(y0-y1) + py*(x1-x0) + x0*y1-y0*x1;
export { Rasterizer, Framebuffer, DEF_INPUT};