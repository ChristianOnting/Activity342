package edu.cit.onting.activity1.controller;

import edu.cit.onting.activity1.model.ServiceRequest;
import edu.cit.onting.activity1.model.User;
import edu.cit.onting.activity1.repository.ServiceRequestRepository;
import edu.cit.onting.activity1.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
public class ServiceRequestController {

    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;

    public ServiceRequestController(ServiceRequestRepository serviceRequestRepository, UserRepository userRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.userRepository = userRepository;
    }

    // Helper method to get the authenticated user matching the active JWT
    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    // para create
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createRequest(@PathVariable Integer userId, @RequestBody ServiceRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }

        // Ownership Check
        if (!currentUser.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: You cannot create a service request for another user.");
        }

        request.setUser(currentUser);
        ServiceRequest saved = serviceRequestRepository.save(request);
        return ResponseEntity.ok(saved);
    }

    // para read
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getRequestsByUser(@PathVariable Integer userId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }

        // Ownership Check
        if (!currentUser.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: You cannot view another user's service requests.");
        }

        List<ServiceRequest> requests = serviceRequestRepository.findByUser_UserId(userId);
        return ResponseEntity.ok(requests);
    }

    // para update
    @PutMapping("/{requestId}")
    public ResponseEntity<?> updateRequest(@PathVariable Long requestId, @RequestBody ServiceRequest updatedDetails) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }

        return serviceRequestRepository.findById(requestId).map(existing -> {
            // Ownership Check
            if (!existing.getUser().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: You cannot update another user's service request.");
            }

            existing.setTitle(updatedDetails.getTitle());
            existing.setDescription(updatedDetails.getDescription());
            if (updatedDetails.getStatus() != null) {
                existing.setStatus(updatedDetails.getStatus());
            }
            ServiceRequest saved = serviceRequestRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // para delete
    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long requestId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User authentication required.");
        }

        return serviceRequestRepository.findById(requestId).map(request -> {
            // Ownership Check
            if (!request.getUser().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: You cannot delete another user's service request.");
            }

            serviceRequestRepository.delete(request);
            return ResponseEntity.ok("Service request deleted successfully");
        }).orElse(ResponseEntity.notFound().build());
    }
}