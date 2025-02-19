import customNode from './customNode.js';
import 


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Disable image smoothing (for sharp lines)
ctx.imageSmoothingEnabled = false;

// Get device pixel ratio for high-DPI displays
const ratio = window.devicePixelRatio || 1;

// Set canvas width and height with consideration of pixel density
canvas.width = 800 * ratio;
canvas.height = 600 * ratio;

// Scale the canvas context to avoid blurriness
ctx.scale(ratio, ratio);

// Now your drawing should be crisp
console.log("Canvas size:", canvas.width, canvas.height);

// Draw the rectangle (make sure you use fillRect instead of Rect)
ctx.fillRect(10.5, 10.5, 100, 100);  // Draw rectangle at (10.5, 10.5) with width 100 and height 100

const node = new customNode(300, 300, 30, "gray", "hello")
node.draw(ctx)