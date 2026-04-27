package com.takabachai.service;

import com.takabachai.exception.BadRequestException;
import com.takabachai.exception.ResourceNotFoundException;
import com.takabachai.model.User;
import com.takabachai.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<com.takabachai.dto.UserSummaryDTO> getUserFinancialSummaries() {
        return userRepository.getUserFinancialSummaries();
    }

    public User createUser(User user) {
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new BadRequestException("A user with that email already exists");
        }
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Could not create user: " + rootCauseMessage(e));
        }
    }

    public User updateUser(Long id, User userData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        user.setFullName(userData.getFullName());
        user.setEmail(userData.getEmail());
        user.setPhone(userData.getPhone());
        if (userData.getRole() != null && !userData.getRole().isBlank()) {
            user.setRole(userData.getRole());
        }
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Could not update user: " + rootCauseMessage(e));
        }
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw ResourceNotFoundException.of("User", id);
        }
        userRepository.deleteById(id);
    }

    private String rootCauseMessage(Throwable t) {
        Throwable cur = t;
        while (cur.getCause() != null && cur.getCause() != cur) {
            cur = cur.getCause();
        }
        return cur.getMessage();
    }
}
