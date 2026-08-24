package com.studysync.dto.note;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record NoteRequest(@NotBlank @Size(max=160) String title,@Size(max=30000) String content,UUID categoryId,boolean pinned){}
