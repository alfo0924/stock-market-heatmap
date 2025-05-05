# 股市數據視覺化平台：特點、技術框架與實現原理

## 平台特點與優勢

這個股市數據視覺化平台具有以下主要特點：

1. **多維度數據展示**：通過儀表板、熱圖等多種視覺化方式，全方位展示股市數據，包括個股表現、行業分布和市場概況。

2. **直觀的熱圖可視化**：使用顏色強度和矩形大小同時表達兩個維度的數據（股價變動和市值），讓用戶能快速識別市場熱點。

3. **互動式體驗**：提供縮放、切換視圖等交互功能，使用戶能深入探索數據細節。

4. **響應式設計**：適配不同屏幕尺寸，確保在桌面和移動設備上都有良好的使用體驗。

5. **實時數據處理**：基於2025年5月5日的股市數據，展示市場表現、行業分布和個股排名。

## 技術框架與架構

### 後端技術

1. **Spring Boot**：作為核心框架，提供依賴注入、REST API支持和Web應用開發環境。

2. **Thymeleaf**：服務器端模板引擎，用於動態生成HTML頁面。

3. **Java 8+**：利用Stream API進行數據處理和分析。

4. **Jackson**：處理JSON數據序列化和反序列化。

### 前端技術

1. **Bootstrap 5**：提供響應式布局和UI組件。

2. **D3.js**：用於創建熱圖(Heatmap)的強大數據可視化庫。

3. **Chart.js**：用於創建儀表板中的各類圖表，如柱狀圖、餅圖等。

4. **JavaScript ES6**：實現前端交互邏輯和數據處理。

## 程式碼運作原理與數據流

### 1. 數據提取與處理流程

```
數據源(JSON) → DataExtractionService → 數據模型(StockData) → AnalysisService → 視覺化數據模型(HeatmapData) → 前端展示
```

1. **數據來源**：系統從`stock-data-2025-05-05.json`文件中讀取原始股市數據。

2. **數據提取**：`DataExtractionService`負責讀取JSON文件並轉換為Java對象。

3. **數據分析**：`AnalysisService`處理原始數據，計算市場摘要、行業表現和熱圖所需的數據結構。

4. **數據轉換**：將分析結果轉換為前端可用的格式，如熱圖數據、圖表數據等。

### 2. 視覺化實現過程

#### 熱圖(Heatmap)實現原理

1. **後端準備數據**：
   ```java
   // 生成熱圖數據結構
   public HeatmapData generateHeatmapData() {
       List stockDataList = dataExtractionService.extractStockData();
       // 按行業分組
       Map> sectorMap = stockDataList.stream()
               .collect(Collectors.groupingBy(StockData::getSector));
       // 構建層次結構數據
       // ...
   }
   ```

2. **前端獲取數據**：
   ```javascript
   // 通過API獲取熱圖數據
   fetch('/api/heatmap/detailed')
       .then(response => response.json())
       .then(data => createHeatmap(data))
   ```

3. **D3.js渲染熱圖**：
   ```javascript
   // 使用D3.js的treemap佈局
   const treemap = d3.treemap()
       .size([width, height])
       .paddingOuter(3)
       .paddingTop(19)
       .paddingInner(1);
   
   // 創建層次結構
   const root = d3.hierarchy(data)
       .sum(d => d.size)
       .sort((a, b) => b.value - a.value);
   
   // 應用treemap佈局
   treemap(root);
   
   // 渲染矩形
   cell.append('rect')
       .attr('width', d => d.x1 - d.x0)
       .attr('height', d => d.y1 - d.y0)
       .attr('fill', d => colorScale(d.data.value))
   ```

#### 儀表板圖表實現原理

1. **後端準備數據**：
   ```java
   // 計算市場摘要
   public Map getMarketSummary() {
       List stockDataList = dataExtractionService.extractStockData();
       
       double avgDailyChange = stockDataList.stream()
               .mapToDouble(StockData::getDailyChange)
               .average()
               .orElse(0.0);
       
       // 獲取漲幅最大的股票
       List topGainers = stockDataList.stream()
               .sorted((a, b) -> Double.compare(b.getDailyChange(), a.getDailyChange()))
               .limit(5)
               .collect(Collectors.toList());
       
       // ...其他數據計算
   }
   ```

2. **前端獲取數據**：
   ```javascript
   // 獲取股票數據
   fetch('/api/stocks')
       .then(response => response.json())
       .then(data => {
           createMarketPerformanceChart(data);
           createSectorPerformanceChart(data);
           createMarketCapChart(data);
       })
   ```

3. **Chart.js渲染圖表**：
   ```javascript
   // 創建市場表現柱狀圖
   new Chart(ctx, {
       type: 'bar',
       data: {
           labels: topStocks.map(stock => stock.symbol),
           datasets: [{
               label: 'Daily Change (%)',
               data: topStocks.map(stock => stock.dailyChange * 100),
               backgroundColor: topStocks.map(stock => 
                   stock.dailyChange >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)')
           }]
       },
       options: { /* 圖表配置 */ }
   });
   ```

## 數據到視覺化的完整流程

1. **數據獲取**：Spring Boot應用啟動時，`DataExtractionService`從JSON文件中讀取股市數據。

2. **數據轉換**：原始數據被轉換為Java對象模型(`StockData`)，便於後續處理。

3. **數據分析**：`AnalysisService`對數據進行分析，計算各種指標和統計數據。

4. **API暴露**：通過`ApiController`將處理後的數據以REST API形式暴露。

5. **頁面渲染**：`DashboardController`處理頁面請求，使用Thymeleaf渲染HTML頁面框架。

6. **前端數據獲取**：頁面加載後，JavaScript通過fetch API獲取數據。

7. **視覺化渲染**：
    - D3.js將數據轉換為熱圖
    - Chart.js將數據轉換為各類圖表
    - Bootstrap提供整體頁面布局和響應式支持

8. **用戶交互**：用戶可以通過縮放、切換視圖等方式與可視化結果交互，深入探索數據。

這個平台展示了現代Web應用的完整技術棧，從後端數據處理到前端視覺化呈現，為用戶提供了直觀、互動的股市數據分析工具。

