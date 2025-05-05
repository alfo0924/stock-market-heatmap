package com.stockanalysis.util;

import com.stockanalysis.model.StockData;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DataTransformer {

    public static Map<String, List<StockData>> groupBySector(List<StockData> stockDataList) {
        return stockDataList.stream()
                .collect(Collectors.groupingBy(StockData::getSector));
    }

    public static double calculateAverageChange(List<StockData> stockDataList) {
        return stockDataList.stream()
                .mapToDouble(StockData::getDailyChange)
                .average()
                .orElse(0.0);
    }
}
