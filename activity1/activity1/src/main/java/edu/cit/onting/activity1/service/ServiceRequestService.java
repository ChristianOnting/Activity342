package edu.cit.onting.activity1.service;

import edu.cit.onting.activity1.dto.ServiceRequestDTO;
import edu.cit.onting.activity1.model.ServiceRequest;
import edu.cit.onting.activity1.model.User;
import edu.cit.onting.activity1.repository.ServiceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository repository;

    public ServiceRequestService(ServiceRequestRepository repository) {
        this.repository = repository;
    }

    public ServiceRequestDTO convertToDTO(ServiceRequest request) {
        return new ServiceRequestDTO(
                request.getId(),
                request.getTitle(),
                request.getDescription(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUser().getUserId(),
                request.getUser().getUsername()
        );
    }

    @Transactional
    public ServiceRequestDTO createRequest(User user, ServiceRequest incoming) {
        ServiceRequest request = new ServiceRequest(incoming.getTitle(), incoming.getDescription(), user);
        return convertToDTO(repository.save(request));
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getRequestsByUserId(Integer userId) {
        return repository.findByUser_UserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<ServiceRequestDTO> updateRequest(Long requestId, Integer userId, ServiceRequest details) {
        return repository.findById(requestId).map(existing -> {
            if (!existing.getUser().getUserId().equals(userId)) {
                throw new SecurityException("Forbidden: Resource belongs to another user.");
            }
            existing.setTitle(details.getTitle());
            existing.setDescription(details.getDescription());
            if (details.getStatus() != null) {
                existing.setStatus(details.getStatus());
            }
            return convertToDTO(repository.save(existing));
        });
    }

    @Transactional
    public boolean deleteRequest(Long requestId, Integer userId) {
        return repository.findById(requestId).map(request -> {
            if (!request.getUser().getUserId().equals(userId)) {
                throw new SecurityException("Forbidden: Resource belongs to another user.");
            }
            repository.delete(request);
            return true;
        }).orElse(false);
    }
}