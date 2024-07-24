const lineData = {
    x1: [],
    y1: [],
    x2: [],
    y2: []
};

function updateLineData(lines) {
    lineData.x1 = lines.map(line => line.x1);
    lineData.y1 = lines.map(line => line.y1);
    lineData.x2 = lines.map(line => line.x2);
    lineData.y2 = lines.map(line => line.y2);

    // Save to localStorage for persistence
    localStorage.setItem('lineData', JSON.stringify(lineData));
}

function loadLineData() {
    const storedData = JSON.parse(localStorage.getItem('lineData'));
    if (storedData) {
        lineData.x1 = storedData.x1 || [];
        lineData.y1 = storedData.y1 || [];
        lineData.x2 = storedData.x2 || [];
        lineData.y2 = storedData.y2 || [];
    }
}

loadLineData();
