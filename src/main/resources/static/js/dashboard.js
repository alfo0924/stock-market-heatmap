document.addEventListener('DOMContentLoaded', function() {
    // Fetch market data
    fetch('/api/stocks')
        .then(response => response.json())
        .then(data => {
            createMarketPerformanceChart(data);
            createSectorPerformanceChart(data);
            createMarketCapChart(data);
        })
        .catch(error => console.error('Error fetching data:', error));

    // Market Performance Chart
    function createMarketPerformanceChart(stockData) {
        // Sort stocks by market cap (descending) and take top 20
        const topStocks = stockData
            .sort((a, b) => b.marketCap - a.marketCap)
            .slice(0, 20);

        const ctx = document.getElementById('marketPerformanceChart').getContext('2d');

        new Chart(ctx, {
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

    // Sector Performance Chart
    function createSectorPerformanceChart(stockData) {
        // Group stocks by sector and calculate average performance
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

        // Sort by performance
        sectorPerformance.sort((a, b) => b.avgChange - a.avgChange);

        const ctx = document.getElementById('sectorPerformanceChart').getContext('2d');

        new Chart(ctx, {
            type: 'horizontalBar',
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
                indexAxis: 'y',
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

    // Market Cap Distribution Chart
    function createMarketCapChart(stockData) {
        // Group stocks by sector and calculate total market cap
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

        // Sort by market cap
        marketCapData.sort((a, b) => b.marketCap - a.marketCap);

        const ctx = document.getElementById('marketCapChart').getContext('2d');

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: marketCapData.map(item => item.sector),
                datasets: [{
                    label: 'Market Cap Distribution',
                    data: marketCapData.map(item => item.marketCap / 1e9), // Convert to billions
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
                                const percentage = ((value * 100) / context.dataset.data.reduce((a, b) => a + b, 0)).toFixed(2);
                                return `$${value.toFixed(2)}B (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
});
