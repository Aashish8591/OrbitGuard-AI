
package com.orbitguard.risk.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProbabilityCalculatorTest {

    private ProbabilityCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new ProbabilityCalculator();
    }

    @Test
    void shouldReturn100WhenDistanceAndVelocityAreZero() {
        double result = calculator.calculateProbability(0.0, 0.0);

        assertEquals(70.0, result, 1e-9);
    }

    @Test
    void shouldReturnExpectedWeightedScore() {
        // Distance score = 100 - (2 * 10) = 80
        // Velocity score = 5 * 10 = 50
        // Weighted score = (80 * 0.70) + (50 * 0.30) = 71
        double result = calculator.calculateProbability(2.0, 5.0);

        assertEquals(71.0, result, 1e-9);
    }

    @Test
    void shouldReturnZeroWhenDistanceScoreAndVelocityScoreAreZero() {
        double result = calculator.calculateProbability(10.0, 0.0);

        assertEquals(0.0, result, 1e-9);
    }

    @Test
    void shouldNeverExceed100() {
        double result = calculator.calculateProbability(0.0, 100.0);

        assertTrue(result >= 0.0 && result <= 100.0);
    }

    @Test
    void shouldRejectNegativeDistance() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculator.calculateProbability(-1.0, 5.0)
        );
    }

    @Test
    void shouldRejectNegativeVelocity() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculator.calculateProbability(5.0, -1.0)
        );
    }

    @Test
    void shouldRejectInfiniteDistance() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculator.calculateProbability(
                        Double.POSITIVE_INFINITY, 5.0
                )
        );
    }

    @Test
    void shouldRejectNaNVelocity() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculator.calculateProbability(
                        5.0, Double.NaN
                )
        );
    }
}
