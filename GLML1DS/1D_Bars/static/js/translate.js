let isTranslating = false;
let translateStartX, translateStartY;

document.getElementById('translateGrid').addEventListener('click', () => {
    isTranslating = !isTranslating;
    if (isTranslating) {
        canvas.style.cursor = 'move';
    } else {
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (isTranslating && e.button === 0) { // Check if the left mouse button is pressed
        translateStartX = e.offsetX;
        translateStartY = e.offsetY;
        canvas.addEventListener('mousemove', translateGrid);
    }
});

canvas.addEventListener('mouseup', () => {
    if (isTranslating) {
        canvas.removeEventListener('mousemove', translateGrid);
        canvas.style.cursor = 'default';
    }
});

function translateGrid(e) {
    const dx = e.offsetX - translateStartX;
    const dy = e.offsetY - translateStartY;
    originX += dx;
    originY += dy;
    translateStartX = e.offsetX;
    translateStartY = e.offsetY;
    draw(); // Redraw the grid and lines
}
