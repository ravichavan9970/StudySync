package com.studysync.controller;
import com.studysync.dto.category.*;
import com.studysync.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/categories")
public class CategoryController extends BaseController {private final CategoryService categories;public CategoryController(CurrentUserService c,CategoryService s){super(c);categories=s;}
 @GetMapping public List<CategoryResponse> list(Authentication a){return categories.list(me(a));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public CategoryResponse create(Authentication a,@Valid @RequestBody CategoryRequest r){return categories.create(me(a),r);}
 @PutMapping("/{id}") public CategoryResponse update(Authentication a,@PathVariable UUID id,@Valid @RequestBody CategoryRequest r){return categories.update(me(a),id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication a,@PathVariable UUID id){categories.delete(me(a),id);}
}
