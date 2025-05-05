package com.stockanalysis.controller;

import com.stockanalysis.service.AnalysisService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    private final AnalysisService analysisService;

    public DashboardController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("marketSummary", analysisService.getMarketSummary());
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("marketSummary", analysisService.getMarketSummary());
        return "dashboard";
    }

    @GetMapping("/heatmap")
    public String heatmap() {
        return "heatmap";
    }
}
