package com.stockanalysis.service;

import com.stockanalysis.model.HeatmapData;
import com.stockanalysis.model.StockData;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    private final DataExtractionService dataExtractionService;

    public AnalysisService(DataExtractionService dataExtractionService) {
        this.dataExtractionService = dataExtractionService;
    }

    public HeatmapData generateHeatmapData() {
        List<StockData> stockDataList = dataExtractionService.extractStockData();

        // Group by sector
        Map<String, List<StockData>> sectorMap = stockDataList.stream()
                .collect(Collectors.groupingBy(StockData::getSector));

        List<HeatmapData.HeatmapItem> children = new ArrayList<>();

        for (Map.Entry<String, List<StockData>> entry : sectorMap.entrySet()) {
            String sector = entry.getKey();
            List<StockData> stocks = entry.getValue();

            HeatmapData.HeatmapItem sectorItem = new HeatmapData.HeatmapItem();
            sectorItem.setName(sector);

            // Calculate sector size based on total market cap
            double sectorMarketCap = stocks.stream()
                    .mapToDouble(StockData::getMarketCap)
                    .sum();

            sectorItem.setSize(sectorMarketCap);

            // Calculate average sector performance
            double sectorPerformance = stocks.stream()
                    .mapToDouble(StockData::getDailyChange)
                    .average()
                    .orElse(0.0);

            sectorItem.setValue(sectorPerformance);

            children.add(sectorItem);
        }

        HeatmapData heatmapData = new HeatmapData();
        heatmapData.setName("Stock Market");
        heatmapData.setChildren(children);

        return heatmapData;
    }

    public HeatmapData generateDetailedHeatmapData() {
        List<StockData> stockDataList = dataExtractionService.extractStockData();

        // Group by sector
        Map<String, List<StockData>> sectorMap = stockDataList.stream()
                .collect(Collectors.groupingBy(StockData::getSector));

        List<HeatmapData.HeatmapItem> sectors = new ArrayList<>();

        for (Map.Entry<String, List<StockData>> entry : sectorMap.entrySet()) {
            String sectorName = entry.getKey();
            List<StockData> sectorStocks = entry.getValue();

            List<HeatmapData.HeatmapItem> stockItems = new ArrayList<>();

            for (StockData stock : sectorStocks) {
                HeatmapData.HeatmapItem stockItem = new HeatmapData.HeatmapItem();
                stockItem.setName(stock.getName());
                stockItem.setSymbol(stock.getSymbol());
                stockItem.setSize(stock.getMarketCap());
                stockItem.setValue(stock.getDailyChange());
                stockItem.setPrice(stock.getPrice());
                stockItem.setChange(stock.getDailyChange());

                stockItems.add(stockItem);
            }

            HeatmapData sectorData = new HeatmapData();
            sectorData.setName(sectorName);
            sectorData.setChildren(stockItems);

            HeatmapData.HeatmapItem sectorItem = new HeatmapData.HeatmapItem();
            sectorItem.setName(sectorName);

            // Calculate sector size based on total market cap
            double sectorMarketCap = sectorStocks.stream()
                    .mapToDouble(StockData::getMarketCap)
                    .sum();

            sectorItem.setSize(sectorMarketCap);

            // Calculate average sector performance
            double sectorPerformance = sectorStocks.stream()
                    .mapToDouble(StockData::getDailyChange)
                    .average()
                    .orElse(0.0);

            sectorItem.setValue(sectorPerformance);

            sectors.add(sectorItem);
        }

        HeatmapData heatmapData = new HeatmapData();
        heatmapData.setName("Stock Market");
        heatmapData.setChildren(sectors);

        return heatmapData;
    }

    public Map<String, Object> getMarketSummary() {
        List<StockData> stockDataList = dataExtractionService.extractStockData();

        double avgDailyChange = stockDataList.stream()
                .mapToDouble(StockData::getDailyChange)
                .average()
                .orElse(0.0);

        double totalMarketCap = stockDataList.stream()
                .mapToDouble(StockData::getMarketCap)
                .sum();

        double totalVolume = stockDataList.stream()
                .mapToDouble(StockData::getVolume)
                .sum();

        List<StockData> topGainers = stockDataList.stream()
                .sorted((a, b) -> Double.compare(b.getDailyChange(), a.getDailyChange()))
                .limit(5)
                .collect(Collectors.toList());

        List<StockData> topLosers = stockDataList.stream()
                .sorted((a, b) -> Double.compare(a.getDailyChange(), b.getDailyChange()))
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> summary = new HashMap<>();
        summary.put("averageDailyChange", avgDailyChange);
        summary.put("totalMarketCap", totalMarketCap);
        summary.put("totalVolume", totalVolume);
        summary.put("topGainers", topGainers);
        summary.put("topLosers", topLosers);

        return summary;
    }
}
