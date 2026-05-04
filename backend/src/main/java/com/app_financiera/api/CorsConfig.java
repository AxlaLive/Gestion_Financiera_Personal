package com.app_financiera.api;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Cambié /api/** por /** para cubrir todo por si acaso
                        .allowedOrigins(
                            "http://localhost:5173", 
                            "http://localhost:8080",
                            "https://gestion-financiera-personal.vercel.app" // <--- LA PIEZA CLAVE
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true); // Recomendado para sesiones o cookies futuras
            }
        };
    }
}