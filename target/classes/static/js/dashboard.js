document.addEventListener('DOMContentLoaded', function() {
    // 確保Chart.js已正確加載
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        return;
    }

    // 獲取市場數據
    fetch('/api/stocks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                createMarketPerformanceChart(data);
                createSectorPerformanceChart(data);
                createMarketCapChart(data);
            } else {
                console.error('Empty or invalid data received');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // 在頁面上顯示錯誤信息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `<strong>Error loading data:</strong> ${error.message}`;
            document.querySelector('main').prepend(errorDiv);
        });

    // 市場表現圖表
    function createMarketPerformanceChart(stockData) {
        // 按市值排序（降序）並取前20名
        const topStocks = stockData
            .sort((a, b) => b.marketCap - a.marketCap)
            .slice(0, 20);

        const ctx = document.getElementById('marketPerformanceChart');
        if (!ctx) {
            console.error('Canvas element marketPerformanceChart not found');
            return;
        }

        const chartCtx = ctx.getContext('2d');

        new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: topStocks.map(stock => stock.symbol),
                datasets: [{
                    label: 'Daily Change (%)',
                    data: topStocks.map(stock => stock.dailyChange * 100),
                    backgroundColor: topStocks.map(stock => stock.dailyChange >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'),
                    borderColor: topStocks.map(stock => stock.dailyChange >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Daily Change (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Stock Symbol'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 20 Stocks by Market Cap - Daily Performance'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const stock = topStocks[context.dataIndex];
                                return [
                                    `Symbol: ${stock.symbol}`,
                                    `Name: ${stock.name}`,
                                    `Price: $${stock.price.toFixed(2)}`,
                                    `Change: ${(stock.dailyChange * 100).toFixed(2)}%`,
                                    `Market Cap: $${(stock.marketCap / 1e9).toFixed(2)}B`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    // 行業表現圖表
    function createSectorPerformanceChart(stockData) {
        // 按行業分組並計算平均表現
        const sectorMap = {};

        stockData.forEach(stock => {
            if (!sectorMap[stock.sector]) {
                sectorMap[stock.sector] = {
                    totalChange: 0,
                    count: 0
                };
            }

            sectorMap[stock.sector].totalChange += stock.dailyChange;
            sectorMap[stock.sector].count += 1;
        });

        const sectors = Object.keys(sectorMap);
        const sectorPerformance = sectors.map(sector => ({
            sector: sector,
            avgChange: sectorMap[sector].totalChange / sectorMap[sector].count
        }));

        // 按表現排序
        sectorPerformance.sort((a, b) => b.avgChange - a.avgChange);

        const ctx = document.getElementById('sectorPerformanceChart');
        if (!ctx) {
            console.error('Canvas element sectorPerformanceChart not found');
            return;
        }

        const chartCtx = ctx.getContext('2d');

        // 注意：horizontalBar類型在Chart.js v3中已棄用
        // 使用bar類型並設置indexAxis為'y'
        new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: sectorPerformance.map(item => item.sector),
                datasets: [{
                    label: 'Sector Performance (%)',
                    data: sectorPerformance.map(item => item.avgChange * 100),
                    backgroundColor: sectorPerformance.map(item =>
                        item.avgChange >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'
                    ),
                    borderColor: sectorPerformance.map(item =>
                        item.avgChange >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',  // 這使圖表水平顯示
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sector Performance'
                    }
                }
            }
        });
    }

    // 市值分佈圖表
    function createMarketCapChart(stockData) {
        // 按行業分組並計算總市值
        const sectorMap = {};

        stockData.forEach(stock => {
            if (!sectorMap[stock.sector]) {
                sectorMap[stock.sector] = 0;
            }

            sectorMap[stock.sector] += stock.marketCap;
        });

        const sectors = Object.keys(sectorMap);
        const marketCapData = sectors.map(sector => ({
            sector: sector,
            marketCap: sectorMap[sector]
        }));

        // 按市值排序
        marketCapData.sort((a, b) => b.marketCap - a.marketCap);

        const ctx = document.getElementById('marketCapChart');
        if (!ctx) {
            console.error('Canvas element marketCapChart not found');
            return;
        }

        const chartCtx = ctx.getContext('2d');

        new Chart(chartCtx, {
            type: 'pie',
            data: {
                labels: marketCapData.map(item => item.sector),
                datasets: [{
                    label: 'Market Cap Distribution',
                    data: marketCapData.map(item => item.marketCap / 1e9), // 轉換為十億
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)',
                        'rgba(83, 102, 255, 0.7)',
                        'rgba(40, 159, 64, 0.7)',
                        'rgba(210, 199, 199, 0.7)',
                        'rgba(78, 52, 199, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                        'rgba(83, 102, 255, 1)',
                        'rgba(40, 159, 64, 1)',
                        'rgba(210, 199, 199, 1)',
                        'rgba(78, 52, 199, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Market Cap Distribution by Sector (in Billions USD)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value * 100) / total).toFixed(2);
                                return `$${value.toFixed(2)}B (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
});
