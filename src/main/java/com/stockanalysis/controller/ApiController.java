package com.stockanalysis.controller;

import com.stockanalysis.model.HeatmapData;
import com.stockanalysis.model.StockData;
import com.stockanalysis.service.AnalysisService;
import com.stockanalysis.service.DataExtractionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final DataExtractionService dataExtractionService;
    private final AnalysisService analysisService;

    public ApiController(DataExtractionService dataExtractionService, AnalysisService analysisService) {
        this.dataExtractionService = dataExtractionService;
        this.analysisService = analysisService;
    }

    @GetMapping("/stocks")
    public List<StockData> getStockData() {
        return dataExtractionService.extractStockData();
    }

    @GetMapping("/heatmap")
    public HeatmapData getHeatmapData() {
        return analysisService.generateHeatmapData();
    }

    @GetMapping("/heatmap/detailed")
    public HeatmapData getDetailedHeatmapData() {
        return analysisService.generateDetailedHeatmapData();
    }

    @GetMapping("/market-summary")
    public Map<String, Object> getMarketSummary() {
        return analysisService.getMarketSummary();
    }
}
