package com.studysync.controller;
import com.studysync.dto.session.*;
import com.studysync.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/study-sessions")
public class StudySessionController extends BaseController {private final StudySessionService sessions;public StudySessionController(CurrentUserService c,StudySessionService s){super(c);sessions=s;}
 @GetMapping public List<StudySessionResponse> history(Authentication a){return sessions.history(me(a));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public StudySessionResponse start(Authentication a,@Valid @RequestBody StudySessionRequest r){return sessions.create(me(a),r);}
 @PutMapping("/{id}") public StudySessionResponse finish(Authentication a,@PathVariable UUID id,@Valid @RequestBody StudySessionRequest r){return sessions.finish(me(a),id,r);}
}
