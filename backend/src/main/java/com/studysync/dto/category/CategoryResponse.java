package com.studysync.dto.category;
import com.studysync.domain.Category;
import java.util.UUID;
public record CategoryResponse(UUID id,String name,String color){public static CategoryResponse from(Category c){return new CategoryResponse(c.getId(),c.getName(),c.getColor());}}
