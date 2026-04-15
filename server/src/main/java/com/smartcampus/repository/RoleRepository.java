package com.smartcampus.repository;

import com.smartcampus.model.Role;
import com.smartcampus.model.RoleName;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(RoleName name);
}