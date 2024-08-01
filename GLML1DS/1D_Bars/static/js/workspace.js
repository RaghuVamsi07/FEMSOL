document.addEventListener('DOMContentLoaded', () => {
    const workspaceContent = document.getElementById('workspaceContent');

    function filterData(data) {
        const keysToFilter = [
            'compiledAlpha', 
            'compiledDeltaT', 
            'compiledExpression', 
            'compiledAreaExpression'
        ];
        return JSON.parse(JSON.stringify(data, (key, value) => 
            keysToFilter.includes(key) ? undefined : value
        ));
    }

    function updateWorkspace() {
        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        const materialProperties = JSON.parse(localStorage.getItem('materialProperties')) || [];
        const forces = JSON.parse(localStorage.getItem('forces')) || [];
        const distributiveForces = JSON.parse(localStorage.getItem('distributiveForces')) || [];
        const bodyForces = JSON.parse(localStorage.getItem('bodyForces')) || [];
        const thermalForces = JSON.parse(localStorage.getItem('thermalForces')) || [];

        workspaceContent.innerHTML = `
            <h4>Lines</h4>
            <pre>${JSON.stringify(filterData(lines), null, 2)}</pre>
            <h4>Material Properties</h4>
            <pre>${JSON.stringify(filterData(materialProperties), null, 2)}</pre>
            <h4>Forces</h4>
            <pre>${JSON.stringify(filterData(forces), null, 2)}</pre>
            <h4>Distributive Forces</h4>
            <pre>${JSON.stringify(filterData(distributiveForces), null, 2)}</pre>
            <h4>Body Forces</h4>
            <pre>${JSON.stringify(filterData(bodyForces), null, 2)}</pre>
            <h4>Thermal Forces</h4>
            <pre>${JSON.stringify(filterData(thermalForces), null, 2)}</pre>
        `;
    }

    updateWorkspace();

    window.addEventListener('storage', updateWorkspace);

    // Watch for localStorage changes and trigger updateWorkspace
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        const event = new Event('storage');
        event.key = key;
        event.newValue = value;
        event.oldValue = localStorage.getItem(key);
        originalSetItem.apply(this, arguments);
        window.dispatchEvent(event);
    };
});
