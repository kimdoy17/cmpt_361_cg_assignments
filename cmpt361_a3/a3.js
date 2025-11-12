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
  let deltaX = x2 - x1;
  let deltaY = y2 - y1;

  let color1 = [r1, g1, b1];
  let color2 = [r2, g2, b2];
  let numSteps;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    numSteps = Math.abs(deltaX);
  }
  else {
    numSteps = Math.abs(deltaY);
  }
  deltaX /= numSteps;
  deltaY /= numSteps;

  let x = x1
  let y = y1
  for (let i = 0; i <= numSteps; ++i) {
    let interpolationFactor = i / numSteps;
    let interpolationColor = color_interp(color1, color2, interpolationFactor)
    this.setPixel(Math.floor(x), Math.floor(y), interpolationColor);
    x += deltaX;
    y += deltaY;
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

const tripleProduct = (x0, y0, x1, y1, px, py) => px*(y0-y1) + py*(x1-x0) + x0*y1-y0*x1;

function color_interp(c1, c2, t) {
  const [red1, green1, blue1] = c1;
  const [red2, green2, blue2] = c2;
  
  const interpolated_red = red1 + (red2 - red1) * t;
  const interpolated_green = green1 + (green2 - green1) * t;
  const interpolated_blue = blue1 + (blue2 - blue1) * t;
  
  return [interpolated_red, interpolated_green, interpolated_blue];
}

function barycentricCoordinates(vertex1, vertex2, vertex3, point) {
  const [vx1, vy1, [vr1, vg1, vb1]] = vertex1;
  const [vx2, vy2, [vr2, vg2, vb2]] = vertex2;
  const [vx3, vy3, [vr3, vg3, vb3]] = vertex3;
  const [pointX, pointY] = point;
  
  const area1 = tripleProduct(vx2, vy2, vx3, vy3, pointX, pointY);
  const area2 = tripleProduct(vx3, vy3, vx1, vy1, pointX, pointY);
  const totalArea = tripleProduct(vx1, vy1, vx2, vy2, vx3, vy3);
  
  const lambda1 = area1 / totalArea;
  const lambda2 = area2 / totalArea;
  const lambda3 = 1.0 - lambda1 - lambda2;
  
  const red = lambda1 * vr1 + lambda2 * vr2 + lambda3 * vr3;
  const green = lambda1 * vg1 + lambda2 * vg2 + lambda3 * vg3;
  const blue = lambda1 * vb1 + lambda2 * vb2 + lambda3 * vb3;
  
  return [red, green, blue];
}

function pointIsInsideTriangle(vert1, vert2, vert3, pt) {
  const [vx1, vy1] = vert1;
  const [vx2, vy2] = vert2;
  const [vx3, vy3] = vert3;
  const [ptx, pty] = pt;
  
  const weight1 = tripleProduct(vx1, vy1, vx2, vy2, ptx, pty);
  const weight2 = tripleProduct(vx2, vy2, vx3, vy3, ptx, pty);
  const weight3 = tripleProduct(vx3, vy3, vx1, vy1, ptx, pty);
  const triangleArea = tripleProduct(vx1, vy1, vx2, vy2, vx3, vy3);
  
  const edgeTopLeft1 = isTopLeft(vert1, vert2);
  const edgeTopLeft2 = isTopLeft(vert2, vert3);
  const edgeTopLeft3 = isTopLeft(vert3, vert1);
  
  if (triangleArea > 0) {
    return (weight1 > 0 || (weight1 === 0 && edgeTopLeft1)) &&
           (weight2 > 0 || (weight2 === 0 && edgeTopLeft2)) &&
           (weight3 > 0 || (weight3 === 0 && edgeTopLeft3));
  } else {
    return (weight1 < 0 || (weight1 === 0 && edgeTopLeft1)) &&
           (weight2 < 0 || (weight2 === 0 && edgeTopLeft2)) &&
           (weight3 < 0 || (weight3 === 0 && edgeTopLeft3));
  }
}

function isTopLeft(v_start, v_end) {
  const [start_x, start_y] = v_start;
  const [end_x, end_y] = v_end;
  
  const X_INDEX = 0;
  const Y_INDEX = 1;
  
  const edgeVector = [end_x - start_x, end_y - start_y];
  
  const isTopEdge = edgeVector[Y_INDEX] === 0 && edgeVector[X_INDEX] > 0;
  const isLeftEdge = edgeVector[Y_INDEX] > 0;
  
  return isLeftEdge || isTopEdge;
}

export { Rasterizer, Framebuffer, DEF_INPUT};