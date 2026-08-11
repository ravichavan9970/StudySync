package com.studysync.controller;
import com.studysync.dto.note.*;
import com.studysync.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/notes")
public class NoteController extends BaseController {private final NoteService notes;public NoteController(CurrentUserService c,NoteService s){super(c);notes=s;}
 @GetMapping public Page<NoteResponse> list(Authentication a,@RequestParam(defaultValue="false") boolean archived,@RequestParam(required=false) String q,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return notes.list(me(a),archived,q,Math.max(page,0),Math.max(size,1));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public NoteResponse create(Authentication a,@Valid @RequestBody NoteRequest r){return notes.create(me(a),r);}
 @PutMapping("/{id}") public NoteResponse update(Authentication a,@PathVariable UUID id,@Valid @RequestBody NoteRequest r){return notes.update(me(a),id,r);}
 @PatchMapping("/{id}/archive") public NoteResponse archive(Authentication a,@PathVariable UUID id,@RequestParam(defaultValue="true") boolean archived){return notes.archive(me(a),id,archived);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication a,@PathVariable UUID id){notes.delete(me(a),id);}
}
