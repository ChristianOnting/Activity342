package edu.cit.onting.activity1.controller;

import edu.cit.onting.activity1.dto.ServiceRequestDTO;
import edu.cit.onting.activity1.model.ServiceRequest;
import edu.cit.onting.activity1.model.User;
import edu.cit.onting.activity1.repository.UserRepository;
import edu.cit.onting.activity1.service.ServiceRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;
    private final UserRepository userRepository;

    public ServiceRequestController(ServiceRequestService serviceRequestService, UserRepository userRepository) {
        this.serviceRequestService = serviceRequestService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createRequest(@PathVariable Integer userId, @RequestBody ServiceRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }
        if (!currentUser.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }

        ServiceRequestDTO saved = serviceRequestService.createRequest(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getRequestsByUser(@PathVariable Integer userId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }
        if (!currentUser.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }

        List<ServiceRequestDTO> requests = serviceRequestService.getRequestsByUserId(userId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{requestId}")
    public ResponseEntity<?> updateRequest(@PathVariable Long requestId, @RequestBody ServiceRequest details) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }

        try {
            return serviceRequestService.updateRequest(requestId, currentUser.getUserId(), details)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long requestId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }

        try {
            boolean deleted = serviceRequestService.deleteRequest(requestId, currentUser.getUserId());
            if (deleted) {
                return ResponseEntity.ok("Service request deleted successfully.");
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}