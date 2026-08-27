package edu.cit.onting.activity1.repository;

import edu.cit.onting.activity1.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    // Use findByUser_UserId to tell Spring Data to look inside 'user' for 'userId'
    List<ServiceRequest> findByUser_UserId(Integer userId);
}