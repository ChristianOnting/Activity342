package edu.cit.onting.activity1.controller;

import edu.cit.onting.activity1.model.User;
import edu.cit.onting.activity1.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private  UserRepository userRepository;

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserbyId(@PathVariable("id") Integer id){
        Optional<User> user = userRepository.findById(id);
        if(user.isPresent()){
            return ResponseEntity.ok(user.get());
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("user not found");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user){
        if (userRepository.findByUsername(user.getUsername()).isPresent()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("user already exists");
        }
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("user has been registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginDtls){
        Optional<User> user = userRepository.findByUsername(loginDtls.getUsername());
        if(user.isPresent() && user.get().getPassword().equals(loginDtls.getPassword())){
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid login details");
    }
}
