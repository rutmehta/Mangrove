class customNode {
    constructor(x, y, radius, color, text) {
      this.x = x;  // Set the "name" property
      this.y = y;    // Set the "age" property
      this.radius = radius
      this.color = color
      this.text = text
    }
  
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); // Draw the circle
        ctx.fill(); // Fill the circle

        // Draw the text
        ctx.fillStyle = "black"; // Set text color
        ctx.font = "16px Arial"; // Set font size and style
        const textWidth = ctx.measureText(this.text).width; // Get the width of the text
        const textX = this.x - textWidth / 2;  // Center text horizontally
        const textY = this.y + 5;  // Adjust text position vertically (5px below center)
        
        ctx.fillText(this.text, textX, textY);  // Draw the text on the canvas
    }
  }

export default customNode;  // Exporting the object