document.addEventListener('DOMContentLoaded', function() {
    // 確保D3.js已正確加載
    if (typeof d3 === 'undefined') {
        console.error('D3.js not loaded!');
        return;
    }

    // 設置尺寸
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const width = document.getElementById('heatmap-container').offsetWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // 創建SVG
    const svg = d3.select('#heatmap-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // 創建提示框
    const tooltip = d3.select('#tooltip');

    // 顏色比例尺
    const colorScale = d3.scaleLinear()
        .domain([-0.05, -0.025, -0.01, 0, 0.01, 0.025, 0.05])
        .range(['#d73027', '#fc8d59', '#fee090', '#ffffbf', '#e0f3f8', '#91bfdb', '#4575b4'])
        .clamp(true);

    // 獲取數據並創建熱圖
    fetch('/api/heatmap/detailed')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => createHeatmap(data))
        .catch(error => {
            console.error('Error fetching heatmap data:', error);
            // 顯示錯誤信息在容器中
            d3.select('#heatmap-container')
                .append('div')
                .attr('class', 'alert alert-danger')
                .html(`<strong>Error loading data:</strong> ${error.message}<br>Please check console for details.`);
        });

    // 創建熱圖
    function createHeatmap(data) {
        // 確保數據有效
        if (!data || !data.children || data.children.length === 0) {
            console.error('Invalid or empty data received');
            d3.select('#heatmap-container')
                .append('div')
                .attr('class', 'alert alert-warning')
                .text('No data available for visualization');
            return;
        }

        // 創建層次結構
        const root = d3.hierarchy(data)
            .sum(d => d.size || 0)  // 防止undefined值
            .sort((a, b) => b.value - a.value);

        // 樹狀圖佈局
        const treemap = d3.treemap()
            .size([width, height])
            .paddingOuter(3)
            .paddingTop(19)
            .paddingInner(1)
            .round(true);

        treemap(root);

        // 創建單元格
        const cell = svg.selectAll('g')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        // 添加矩形
        cell.append('rect')
            .attr('width', d => Math.max(0, d.x1 - d.x0))  // 確保寬度不為負
            .attr('height', d => Math.max(0, d.y1 - d.y0))  // 確保高度不為負
            .attr('fill', d => {
                if (d.children) return '#ddd';
                return d.data.value !== undefined ? colorScale(d.data.value) : '#ccc';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                // 顯示提示框
                if (!d.children && d.data.symbol) {
                    tooltip.style('display', 'block');
                    tooltip.select('.tooltip-header').html(`${d.data.name} (${d.data.symbol})`);

                    const change = (d.data.change || 0) * 100;
                    const changeClass = change >= 0 ? 'text-success' : 'text-danger';
                    const changePrefix = change >= 0 ? '+' : '';

                    tooltip.select('.tooltip-body').html(`
                        <div>Price: $${(d.data.price || 0).toFixed(2)}</div>
                        <div>Change: <span class="${changeClass}">${changePrefix}${change.toFixed(2)}%</span></div>
                        <div>Market Cap: $${((d.data.size || 0) / 1e9).toFixed(2)}B</div>
                    `);

                    // 定位提示框
                    const tooltipWidth = tooltip.node().offsetWidth;
                    const tooltipHeight = tooltip.node().offsetHeight;
                    const x = event.pageX;
                    const y = event.pageY;

                    // 調整位置以確保提示框在視口內
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
                // 更新提示框位置
                const tooltipWidth = tooltip.node().offsetWidth;
                const tooltipHeight = tooltip.node().offsetHeight;
                const x = event.pageX;
                const y = event.pageY;

                // 調整位置以確保提示框在視口內
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
                // 隱藏提示框
                tooltip.style('display', 'none');
            });

        // 添加文本標籤
        cell.append('text')
            .attr('x', 5)
            .attr('y', 15)
            .attr('font-size', d => d.children ? '14px' : '10px')
            .attr('font-weight', d => d.children ? 'bold' : 'normal')
            .text(d => {
                if (d.children) return d.data.name || '';
                return (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 25) ? (d.data.symbol || '') : '';
            });

        // 添加縮放功能
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                svg.attr('transform', event.transform);
            });

        d3.select('#heatmap-container svg').call(zoom);

        // 縮放控制
        document.getElementById('zoomIn').addEventListener('click', function() {
            d3.select('#heatmap-container svg').transition().call(zoom.scaleBy, 1.5);
        });

        document.getElementById('zoomOut').addEventListener('click', function() {
            d3.select('#heatmap-container svg').transition().call(zoom.scaleBy, 0.75);
        });

        document.getElementById('resetZoom').addEventListener('click', function() {
            d3.select('#heatmap-container svg').transition().call(zoom.transform, d3.zoomIdentity);
        });

        // 視圖控制
        document.getElementById('viewBySector').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('viewByPerformance').classList.remove('active');

            // 按行業重新排序
            const root = d3.hierarchy(data)
                .sum(d => d.size || 0)
                .sort((a, b) => b.value - a.value);

            treemap(root);

            // 更新單元格
            const t = d3.transition().duration(750);

            cell.data(root.descendants())
                .transition(t)
                .attr('transform', d => `translate(${d.x0},${d.y0})`)
                .select('rect')
                .attr('width', d => Math.max(0, d.x1 - d.x0))
                .attr('height', d => Math.max(0, d.y1 - d.y0));

            cell.select('text')
                .transition(t)
                .attr('x', 5)
                .attr('y', 15)
                .text(d => {
                    if (d.children) return d.data.name || '';
                    return (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 25) ? (d.data.symbol || '') : '';
                });
        });

        document.getElementById('viewByPerformance').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('viewBySector').classList.remove('active');

            // 按表現重新排序
            const root = d3.hierarchy(data)
                .sum(d => d.size || 0)
                .sort((a, b) => {
                    if (a.data.value === undefined || b.data.value === undefined) return 0;
                    return b.data.value - a.data.value;
                });

            treemap(root);

            // 更新單元格
            const t = d3.transition().duration(750);

            cell.data(root.descendants())
                .transition(t)
                .attr('transform', d => `translate(${d.x0},${d.y0})`)
                .select('rect')
                .attr('width', d => Math.max(0, d.x1 - d.x0))
                .attr('height', d => Math.max(0, d.y1 - d.y0));

            cell.select('text')
                .transition(t)
                .attr('x', 5)
                .attr('y', 15)
                .text(d => {
                    if (d.children) return d.data.name || '';
                    return (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 25) ? (d.data.symbol || '') : '';
                });
        });
    }

    // 處理窗口調整大小
    window.addEventListener('resize', function() {
        const newWidth = document.getElementById('heatmap-container').offsetWidth - margin.left - margin.right;

        d3.select('#heatmap-container svg')
            .attr('width', newWidth + margin.left + margin.right);

        // 重新繪製熱圖
        d3.select('#heatmap-container svg g').selectAll('*').remove();

        fetch('/api/heatmap/detailed')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => createHeatmap(data))
            .catch(error => console.error('Error fetching heatmap data:', error));
    });
});
