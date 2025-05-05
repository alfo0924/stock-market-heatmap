package com.stockanalysis.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapData {
    private String name;
    private List<HeatmapItem> children;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeatmapItem {
        private String name;
        private double size;
        private double value;
        private String symbol;
        private double price;
        private double change;
    }
}
