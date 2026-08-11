package com.studysync.dto.category;
import jakarta.validation.constraints.*;
public record CategoryRequest(@NotBlank @Size(max=50) String name,@Pattern(regexp="^#[0-9a-fA-F]{6}$",message="color must be a hex value") String color){}
