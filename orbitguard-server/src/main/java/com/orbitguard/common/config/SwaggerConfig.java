package com.orbitguard.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI orbitGuardOpenAPI() {

        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()

                // JWT Configuration
                .addSecurityItem(
                        new SecurityRequirement()
                                .addList(securitySchemeName)
                )

                .components(
                        new Components()
                                .addSecuritySchemes(
                                        securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                )

                // API Information
                .info(
                        new Info()
                                .title("OrbitGuard AI API")
                                .version("v1.0.0")
                                .description(
                                        "REST APIs for OrbitGuard AI - Space Debris Monitoring & Satellite Management System."
                                )

                                .contact(
                                        new Contact()
                                                .name("Aashish Patil")
                                                .email("aashishpatil2144@gmail.com")
                                                .url("https://github.com/Aashish8591")
                                )

                                .license(
                                        new License()
                                                .name("MIT License")
                                                .url("https://opensource.org/licenses/MIT")
                                )
                );
    }
}