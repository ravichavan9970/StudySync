package com.studysync.controller;
import com.studysync.dto.auth.ChangePasswordRequest;
import com.studysync.dto.user.UserResponse;
import com.studysync.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/users")
public class UserController extends BaseController {private final ProfileService profiles;private final AuthService auth;
 public UserController(CurrentUserService current,ProfileService profiles,AuthService auth){super(current);this.profiles=profiles;this.auth=auth;}
 @GetMapping("/me") public UserResponse meResponse(Authentication a){return profiles.get(me(a));}
 @PostMapping("/change-password") @ResponseStatus(HttpStatus.NO_CONTENT) public void changePassword(Authentication a,@Valid @RequestBody ChangePasswordRequest r){auth.changePassword(a.getName(),r);}
}
