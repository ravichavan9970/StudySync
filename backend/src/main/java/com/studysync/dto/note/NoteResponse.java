package com.studysync.dto.note;
import com.studysync.domain.Note;
import java.time.*;
import java.util.UUID;
public record NoteResponse(UUID id,String title,String content,boolean pinned,boolean archived,UUID categoryId,String categoryName,Instant createdAt,Instant updatedAt){public static NoteResponse from(Note n){return new NoteResponse(n.getId(),n.getTitle(),n.getContent(),n.isPinned(),n.isArchived(),n.getCategory()==null?null:n.getCategory().getId(),n.getCategory()==null?null:n.getCategory().getName(),n.getCreatedAt(),n.getUpdatedAt());}}
