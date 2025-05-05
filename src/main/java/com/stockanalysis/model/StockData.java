package com.stockanalysis.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockData {
    private String symbol;
    private String name;
    private String sector;
    private double price;
    private double dailyChange;
    private double monthlyChange;
    private double yearlyChange;
    private double marketCap;
    private double volume;
}
