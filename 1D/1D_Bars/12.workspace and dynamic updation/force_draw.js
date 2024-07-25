const forceCanvasUnique = document.getElementById('canvas');
const forceCtxUnique = forceCanvasUnique.getContext('2d');
let forceScaleUnique = 1;
let forceOriginXUnique = forceCanvasUnique.width / 2;
let forceOriginYUnique = forceCanvasUnique.height / 2;

let forceLinesUnique = JSON.parse(localStorage.getItem('lines')) || [];
let forcesDataUnique = JSON.parse(localStorage.getItem('forces')) || [];

function forceResizeCanvasUnique() {
    forceCanvasUnique.width = forceCanvasUnique.parentElement.clientWidth;
    forceCanvasUnique.height = forceCanvasUnique.parentElement.clientHeight;
    forceOriginXUnique = forceCanvasUnique.width / 2;
    forceOriginYUnique = forceCanvasUnique.height / 2;
    forceDrawUnique();
}

window.addEventListener('resize', forceResizeCanvasUnique);
forceResizeCanvasUnique();

function forceDrawGridUnique() {
    forceCtxUnique.clearRect(0, 0, forceCanvasUnique.width, forceCanvasUnique.height);
    forceCtxUnique.strokeStyle = '#e0e0e0';
    forceCtxUnique.lineWidth = 1;

    for (let i = -forceOriginXUnique; i < forceCanvasUnique.width - forceOriginXUnique; i += 20 * forceScaleUnique) {
        forceCtxUnique.moveTo(forceOriginXUnique + i, 0);
        forceCtxUnique.lineTo(forceOriginXUnique + i, forceCanvasUnique.height);
    }

    for (let i = -forceOriginYUnique; i < forceCanvasUnique.height - forceOriginYUnique; i += 20 * forceScaleUnique) {
        forceCtxUnique.moveTo(0, forceOriginYUnique + i);
        forceCtxUnique.lineTo(forceCanvasUnique.width, forceOriginYUnique + i);
    }

    forceCtxUnique.stroke();

    // Draw origin lines
    forceCtxUnique.strokeStyle = 'blue';
    forceCtxUnique.beginPath();
    forceCtxUnique.moveTo(forceOriginXUnique, 0);
    forceCtxUnique.lineTo(forceOriginXUnique, forceCanvasUnique.height);
    forceCtxUnique.moveTo(0, forceOriginYUnique);
    forceCtxUnique.lineTo(forceCanvasUnique.width, forceOriginYUnique);
    forceCtxUnique.stroke();
}

function forceDrawLinesUnique() {
    forceCtxUnique.strokeStyle = 'black';
    forceCtxUnique.lineWidth = 2;

    forceLinesUnique.forEach(line => {
        forceCtxUnique.beginPath();
        forceCtxUnique.moveTo(forceOriginXUnique + line.x1 * forceScaleUnique, forceOriginYUnique + line.y1 * forceScaleUnique);
        forceCtxUnique.lineTo(forceOriginXUnique + line.x2 * forceScaleUnique, forceOriginYUnique + line.y2 * forceScaleUnique);
        forceCtxUnique.stroke();
    });
}

function forceDrawForcesUnique() {
    forceCtxUnique.fillStyle = 'blue';
    forcesDataUnique.forEach(force => {
        const line = forceLinesUnique[force.lineIndex];
        const x = forceOriginXUnique + line.x1 * forceScaleUnique + (line.x2 - line.x1) * force.x;
        const y = forceOriginYUnique + line.y1 * forceScaleUnique + (line.y2 - line.y1) * force.y;
        forceCtxUnique.beginPath();
        forceCtxUnique.arc(x, y, 5, 0, 2 * Math.PI);
        forceCtxUnique.fill();
        forceCtxUnique.fillText(`Fx: ${force.fx}, Fy: ${force.fy}`, x + 10, y);
    });
}

function forceDrawUnique() {
    forceDrawGridUnique();
    forceDrawLinesUnique();
    forceDrawForcesUnique();
}

function forceHighlightLineUnique(line) {
    forceDrawUnique();
    forceCtxUnique.strokeStyle = 'red';
    forceCtxUnique.lineWidth = 3;
    forceCtxUnique.beginPath();
    forceCtxUnique.moveTo(forceOriginXUnique + line.x1 * forceScaleUnique, forceOriginYUnique + line.y1 * forceScaleUnique);
    forceCtxUnique.lineTo(forceOriginXUnique + line.x2 * forceScaleUnique, forceOriginYUnique + line.y2 * forceScaleUnique);
    forceCtxUnique.stroke();
}

document.getElementById('translateGrid').addEventListener('click', () => {
    forceTranslating = !forceTranslating;
    if (forceTranslating) {
        forceCanvasUnique.style.cursor = 'move';
    } else {
        forceCanvasUnique.style.cursor = 'default';
    }
});

forceDrawUnique();
