package com.studysync.controller;
import com.studysync.dto.user.*;
import com.studysync.service.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController @RequestMapping("/profile")
public class ProfileController extends BaseController {private final ProfileService profiles;private final FileStorageService files;public ProfileController(CurrentUserService c,ProfileService p,FileStorageService f){super(c);profiles=p;files=f;}
 @GetMapping public UserResponse get(Authentication a){return profiles.get(me(a));}
 @PutMapping public UserResponse update(Authentication a,@Valid @RequestBody UserProfileRequest r){return profiles.update(me(a),r);}
 @PostMapping(value="/picture",consumes="multipart/form-data") public UserResponse picture(Authentication a,@RequestPart("file") MultipartFile file){var user=me(a);user.setProfilePictureUrl(files.storeProfileImage(file));return profiles.update(user,new UserProfileRequest(user.getName(),user.getProfilePictureUrl(),user.isDarkMode(),user.getTheme()));}
}
