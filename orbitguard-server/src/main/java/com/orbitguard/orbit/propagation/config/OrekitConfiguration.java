package com.orbitguard.orbit.propagation.config;

import jakarta.annotation.PostConstruct;
import org.orekit.data.ClasspathCrawler;
import org.orekit.data.DataContext;
import org.orekit.data.DataProvidersManager;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrekitConfiguration {

    private static final String OREKIT_DATA_FILE = "orekit-data.zip";

    @PostConstruct
    public void configureOrekit() {

        DataProvidersManager manager =
                DataContext.getDefault().getDataProvidersManager();

        manager.clearProviders();

        manager.addProvider(
                new ClasspathCrawler(OREKIT_DATA_FILE)
        );
    }
}