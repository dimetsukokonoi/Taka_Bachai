package com.takabachai.controller;

import com.takabachai.exception.ResourceNotFoundException;
import com.takabachai.model.Category;
import com.takabachai.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/type/{type}")
    public List<Category> getCategoriesByType(@PathVariable String type) {
        return categoryRepository.findByType(type.toUpperCase());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Category createCategory(@Valid @RequestBody Category category) {
        return categoryRepository.save(category);
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @Valid @RequestBody Category data) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
        existing.setName(data.getName());
        existing.setType(data.getType());
        existing.setIcon(data.getIcon());
        existing.setColor(data.getColor());
        return categoryRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Category", id);
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
