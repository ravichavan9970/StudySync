package com.studysync.service;
import com.studysync.domain.*;
import com.studysync.dto.category.*;
import com.studysync.exception.*;
import com.studysync.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @RequiredArgsConstructor
public class CategoryService {private final CategoryRepository categories;
 @Transactional(readOnly=true)
 public List<CategoryResponse> list(User user){return categories.findAllByUserOrderByNameAsc(user).stream().map(CategoryResponse::from).toList();}
 @Transactional
 public CategoryResponse create(User user,CategoryRequest req){String name=req.name().trim();if(categories.findByUserAndNameIgnoreCase(user,name).isPresent())throw new BadRequestException("A category named '"+name+"' already exists");return CategoryResponse.from(categories.save(Category.builder().user(user).name(name).color(req.color()==null?"#7259ef":req.color()).build()));}
 @Transactional
 public CategoryResponse update(User user,UUID id,CategoryRequest req){Category c=get(user,id);String name=req.name().trim();categories.findByUserAndNameIgnoreCase(user,name).ifPresent(found->{if(!found.getId().equals(id))throw new BadRequestException("A category named '"+name+"' already exists");});c.setName(name);if(req.color()!=null)c.setColor(req.color());return CategoryResponse.from(categories.save(c));}
 @Transactional
 public void delete(User user,UUID id){categories.delete(get(user,id));}
 @Transactional(readOnly=true)
 public Category get(User user,UUID id){return categories.findByIdAndUser(id,user).orElseThrow(()->new NotFoundException("Category not found"));}
}
