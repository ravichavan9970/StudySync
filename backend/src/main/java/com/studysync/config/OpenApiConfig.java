package com.studysync.config;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
@Configuration
public class OpenApiConfig { @Bean OpenAPI studySyncOpenApi(){return new OpenAPI().info(new Info().title("StudySync API").version("1.0.0").description("Secure productivity API for StudySync.")).addSecurityItem(new SecurityRequirement().addList("bearerAuth")).components(new Components().addSecuritySchemes("bearerAuth",new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));}}
