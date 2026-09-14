package com.sparehub.service.inventory;



import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LowStockAlertScheduler {

    private final LowStockAlertService
            lowStockAlertService;

    /*
     * සෑම දිනකම උදේ 8:00ට Sri Lankan time අනුව.
     */
    @Scheduled(
            cron = "0 0 8 * * *",
            zone = "Asia/Colombo"
    )
    public void evaluateLowStockProducts() {
        lowStockAlertService
                .evaluateAllSpareParts();
    }
}