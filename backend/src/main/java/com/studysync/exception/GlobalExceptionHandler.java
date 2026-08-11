package com.studysync.exception;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;
@RestControllerAdvice
public class GlobalExceptionHandler {
 record ApiError(Instant timestamp,int status,String error,Object details){}
 @ExceptionHandler(NotFoundException.class) ResponseEntity<ApiError> notFound(NotFoundException e){return error(HttpStatus.NOT_FOUND,e.getMessage());}
 @ExceptionHandler({BadRequestException.class,IllegalArgumentException.class}) ResponseEntity<ApiError> badRequest(RuntimeException e){return error(HttpStatus.BAD_REQUEST,e.getMessage());}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ApiError> invalid(MethodArgumentNotValidException e){Map<String,String> m=new LinkedHashMap<>();e.getBindingResult().getFieldErrors().forEach(x->m.put(x.getField(),x.getDefaultMessage()));return error(HttpStatus.BAD_REQUEST,m);}
 @ExceptionHandler(AccessDeniedException.class) ResponseEntity<ApiError> forbidden(AccessDeniedException e){return error(HttpStatus.FORBIDDEN,"You are not permitted to perform this action");}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<ApiError> conflict(DataIntegrityViolationException e){return error(HttpStatus.CONFLICT,"This record already exists or is linked to another record");}
 @ExceptionHandler(Exception.class) ResponseEntity<ApiError> generic(Exception e){return error(HttpStatus.INTERNAL_SERVER_ERROR,"Unexpected server error");}
 private ResponseEntity<ApiError> error(HttpStatus status,Object details){return ResponseEntity.status(status).body(new ApiError(Instant.now(),status.value(),status.getReasonPhrase(),details));}
}
