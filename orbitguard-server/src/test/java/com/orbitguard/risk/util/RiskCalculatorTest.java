
package com.orbitguard.risk.util;

import com.orbitguard.risk.enums.RiskLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RiskCalculatorTest {

    private RiskCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new RiskCalculator();
    }

    @Test
    void shouldClassifyLowRisk() {
        assertEquals(RiskLevel.LOW, calculator.calculateRiskLevel(0.0));
        assertEquals(RiskLevel.LOW, calculator.calculateRiskLevel(24.99));
    }

    @Test
    void shouldClassifyMediumRisk() {
        assertEquals(RiskLevel.MEDIUM, calculator.calculateRiskLevel(25.0));
        assertEquals(RiskLevel.MEDIUM, calculator.calculateRiskLevel(49.99));
    }

    @Test
    void shouldClassifyHighRisk() {
        assertEquals(RiskLevel.HIGH, calculator.calculateRiskLevel(50.0));
        assertEquals(RiskLevel.HIGH, calculator.calculateRiskLevel(74.99));
    }

    @Test
    void shouldClassifyCriticalRisk() {
        assertEquals(RiskLevel.CRITICAL, calculator.calculateRiskLevel(75.0));
        assertEquals(RiskLevel.CRITICAL, calculator.calculateRiskLevel(100.0));
    }

    @Test
    void shouldRejectScoreAbove100() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculator.calculateRiskLevel(100.1)
        );
    }

    @Test
    void shouldRejectNegativeScore() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculator.calculateRiskLevel(-0.1)
        );
    }

    @Test
    void shouldGenerateRecommendationForEveryRiskLevel() {
        for (RiskLevel level : RiskLevel.values()) {
            assertNotNull(calculator.generateRecommendation(level));
            assertFalse(calculator.generateRecommendation(level).isBlank());
        }
    }

    @Test
    void shouldRejectNullRiskLevel() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculator.generateRecommendation(null)
        );
    }
}
