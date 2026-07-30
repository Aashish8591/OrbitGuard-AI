package com.orbitguard.risk.constants;

public final class RiskApiConstants {

    private RiskApiConstants() {
        throw new IllegalStateException("Utility class");
    }

    public static final String BASE_URL = "/api/v1/risk";

    public static final String ANALYZE = "/analyze";

    public static final String GET_BY_ID = "/{id}";

    public static final String GET_ALL = "";

    public static final String UPDATE_STATUS = "/{id}/status";

    public static final String DELETE = "/{id}";

}