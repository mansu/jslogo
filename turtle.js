class Turtle {
    constructor(canvas, overlayCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.overlayCanvas = overlayCanvas;
        this.overlayCtx = overlayCanvas.getContext('2d');
        this.sprite = null;
        this.reset();
    }

    setSprite(img) {
        this.sprite = img;
        this.drawTurtle();
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.angle = -Math.PI / 2; // Pointing up
        this.penDown = true;
        this.color = '#ff6b6b';
        this.width = 2;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.drawTurtle();
    }

    forward(distance) {
        const newX = this.x + distance * Math.cos(this.angle);
        const newY = this.y + distance * Math.sin(this.angle);

        if (this.penDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(newX, newY);
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.stroke();
        }

        this.x = newX;
        this.y = newY;
        this.drawTurtle();
    }

    right(degrees) {
        this.angle += (degrees * Math.PI) / 180;
        this.drawTurtle();
    }

    left(degrees) {
        this.angle -= (degrees * Math.PI) / 180;
        this.drawTurtle();
    }

    setPen(isDown) {
        this.penDown = isDown;
    }

    setColor(color) {
        this.color = color;
    }

    drawTurtle() {
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

        this.overlayCtx.save();
        this.overlayCtx.translate(this.x, this.y);
        this.overlayCtx.rotate(this.angle + Math.PI / 2); // Sprite face up, but 0 is right

        if (this.sprite) {
            const size = 30;
            this.overlayCtx.drawImage(this.sprite, -size / 2, -size / 2, size, size);
        } else {
            // Default triangle turtle
            this.overlayCtx.beginPath();
            this.overlayCtx.moveTo(0, -10);
            this.overlayCtx.lineTo(7, 7);
            this.overlayCtx.lineTo(-7, 7);
            this.overlayCtx.closePath();
            this.overlayCtx.fillStyle = this.color;
            this.overlayCtx.fill();
        }

        this.overlayCtx.restore();
    }
}

// Export for app.js
window.Turtle = Turtle;
