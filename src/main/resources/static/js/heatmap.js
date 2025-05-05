document.addEventListener('DOMContentLoaded', function() {
    // Set up dimensions
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const width = document.getElementById('heatmap-container').offsetWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select('#heatmap-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tooltip
    const tooltip = d3.select('#tooltip');

    // Color scale for performance
    const colorScale = d3.scaleLinear()
        .domain([-0.05, -0.025, -0.01, 0, 0.01, 0.025, 0.05])
        .range(['#d73027', '#fc8d59', '#fee090', '#ffffbf', '#e0f3f8', '#91bfdb', '#4575b4'])
        .clamp(true);

    // Fetch data and create heatmap
    fetch('/api/heatmap/detailed')
        .then(response => response.json())
        .then(data => createHeatmap(data))
        .catch(error => console.error('Error fetching heatmap data:', error));

    // Create treemap
    function createHeatmap(data) {
        // Hierarchy
        const root = d3.hierarchy(data)
            .sum(d => d.size)
            .sort((a, b) => b.value - a.value);

        // Treemap layout
        const treemap = d3.treemap()
            .size([width, height])
            .paddingOuter(3)
            .paddingTop(19)
            .paddingInner(1)
            .round(true);

        treemap(root);

        // Create cells
        const cell = svg.selectAll('g')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        // Add rectangles
        cell.append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => d.children ? '#ddd' : colorScale(d.data.value))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                // Show tooltip
                if (!d.children) {
                    tooltip.style('display', 'block');
                    tooltip.select('.tooltip-header').html(`${d.data.name} (${d.data.symbol})`);

                    const change = d.data.change * 100;
                    const changeClass = change >= 0 ? 'text-success' : 'text-danger';
                    const changePrefix = change >= 0 ? '+' : '';

                    tooltip.select('.tooltip-body').html(`
                        <div>Price: $${d.data.price.toFixed(2)}</div>
                        <div>Change: <span class="${changeClass}">${changePrefix}${change.toFixed(2)}%</span></div>
                        <div>Market Cap: $${(d.data.size / 1e9).toFixed(2)}B</div>
                    `);

                    // Position tooltip
                    const tooltipWidth = tooltip.node().offsetWidth;
                    const tooltipHeight = tooltip.node().offsetHeight;
                    const x = event.pageX;
                    const y = event.pageY;

                    // Adjust position to keep tooltip within viewport
                    let tooltipX = x + 10;
                    let tooltipY = y + 10;

                    if (tooltipX + tooltipWidth > window.innerWidth) {
                        tooltipX = x - tooltipWidth - 10;
                    }

                    if (tooltipY + tooltipHeight > window.innerHeight) {
                        tooltipY = y - tooltipHeight - 10;
                    }

                    tooltip
                        .style('left', `${tooltipX}px`)
                        .style('top', `${tooltipY}px`);
                }
            })
            .on('mousemove', function(event) {
                // Update tooltip position
                const tooltipWidth = tooltip.node().offsetWidth;
                const tooltipHeight = tooltip.node().offsetHeight;
                const x = event.pageX;
                const y = event.pageY;

                // Adjust position to keep tooltip within viewport
                let tooltipX = x + 10;
                let tooltipY = y + 10;

                if (tooltipX + tooltipWidth > window.innerWidth) {
                    tooltipX = x - tooltipWidth - 10;
                }

                if (tooltipY + tooltipHeight > window.innerHeight) {
                    tooltipY = y - tooltipHeight - 10;
                }

                tooltip
                    .style('left', `${tooltipX}px`)
                    .style('top', `${tooltipY}px`);
            })
            .on('mouseout', function() {
                // Hide tooltip
                tooltip.style('display', 'none');
            });

        // Add text labels
        cell.append('text')
            .attr('x', 5)
            .attr('y', 15)
            .attr('font-size', d => d.children ? '14px' : '10px')
            .attr('font-weight', d => d.children ? 'bold' : 'normal')
            .text(d => d.children ? d.data.name : (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 25) ? d.data.symbol : '');

        // Add zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                svg.attr('transform', event.transform);
            });

        d3.select('#heatmap-container svg').call(zoom);

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', function() {
            d3.select('#heatmap-container svg').transition().call(zoom.scaleBy, 1.5);
        });

        document.getElementById('zoomOut').addEventListener('click', function() {
            d3.select('#heatmap-container svg').transition().call(zoom.scaleBy, 0.75);
        });

        document.getElementById('resetZoom').addEventListener('click', function() {
            d3.select('#heatmap-container svg').transition().call(zoom.transform, d3.zoomIdentity);
        });

        // View controls
        document.getElementById('viewBySector').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('viewByPerformance').classList.remove('active');

            // Reorder by sector
            const root = d3.hierarchy(data)
                .sum(d => d.size)
                .sort((a, b) => b.value - a.value);

            treemap(root);

            // Update cells
            const t = d3.transition().duration(750);

            cell.data(root.descendants())
                .transition(t)
                .attr('transform', d => `translate(${d.x0},${d.y0})`)
                .select('rect')
                .attr('width', d => d.x1 - d.x0)
                .attr('height', d => d.y1 - d.y0);

            cell.select('text')
                .transition(t)
                .attr('x', 5)
                .attr('y', 15)
                .text(d => d.children ? d.data.name : (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 25) ? d.data.symbol : '');
        });

        document.getElementById('viewByPerformance').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('viewBySector').classList.remove('active');

            // Reorder by performance
            const root = d3.hierarchy(data)
                .sum(d => d.size)
                .sort((a, b) => b.data.value - a.data.value);

            treemap(root);

            // Update cells
            const t = d3.transition().duration(750);

            cell.data(root.descendants())
                .transition(t)
                .attr('transform', d => `translate(${d.x0},${d.y0})`)
                .select('rect')
                .attr('width', d => d.x1 - d.x0)
                .attr('height', d => d.y1 - d.y0);

            cell.select('text')
                .transition(t)
                .attr('x', 5)
                .attr('y', 15)
                .text(d => d.children ? d.data.name : (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 25) ? d.data.symbol : '');
        });
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        const newWidth = document.getElementById('heatmap-container').offsetWidth - margin.left - margin.right;

        d3.select('#heatmap-container svg')
            .attr('width', newWidth + margin.left + margin.right);

        // Redraw heatmap
        d3.select('#heatmap-container svg g').selectAll('*').remove();

        fetch('/api/heatmap/detailed')
            .then(response => response.json())
            .then(data => createHeatmap(data))
            .catch(error => console.error('Error fetching heatmap data:', error));
    });
});
