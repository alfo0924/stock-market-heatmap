package com.stockanalysis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockanalysis.model.StockData;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class DataExtractionService {

    private final ObjectMapper objectMapper;

    public DataExtractionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<StockData> extractStockData() {
        try {
            InputStream inputStream = new ClassPathResource("data/stock-data-2025-05-05.json").getInputStream();
            return objectMapper.readValue(inputStream, new TypeReference<List<StockData>>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract stock data", e);
        }
    }
}
