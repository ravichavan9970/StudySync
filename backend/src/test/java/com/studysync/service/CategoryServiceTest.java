package com.studysync.service;

import com.studysync.domain.*;
import com.studysync.dto.category.*;
import com.studysync.exception.BadRequestException;
import com.studysync.repository.CategoryRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {
  @Mock private CategoryRepository categories;
  @InjectMocks private CategoryService categoryService;

  private User user;

  @BeforeEach
  void setUp() {
    user = User.builder().id(UUID.randomUUID()).email("student@example.com").name("Student").build();
  }

  @Test
  void createsCategorySuccessfully() {
    CategoryRequest req = new CategoryRequest("Mathematics", "#7259ef");
    when(categories.findByUserAndNameIgnoreCase(user, "Mathematics")).thenReturn(Optional.empty());
    when(categories.save(any(Category.class))).thenAnswer(i -> {
      Category c = i.getArgument(0);
      c.setId(UUID.randomUUID());
      return c;
    });

    CategoryResponse res = categoryService.create(user, req);
    assertThat(res.name()).isEqualTo("Mathematics");
  }

  @Test
  void throwsExceptionOnDuplicateCategoryNameUpdate() {
    UUID catId1 = UUID.randomUUID();
    UUID catId2 = UUID.randomUUID();
    Category cat1 = Category.builder().id(catId1).user(user).name("Math").build();
    Category cat2 = Category.builder().id(catId2).user(user).name("Physics").build();

    when(categories.findByIdAndUser(catId1, user)).thenReturn(Optional.of(cat1));
    when(categories.findByUserAndNameIgnoreCase(user, "Physics")).thenReturn(Optional.of(cat2));

    CategoryRequest req = new CategoryRequest("Physics", "#7259ef");

    assertThatThrownBy(() -> categoryService.update(user, catId1, req))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("already exists");
  }
}
