package com.yrhp.crud.repository;

import com.yrhp.crud.model.UserDtls;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserDtls, Integer> {

    boolean existsByEmail(String email);

    UserDtls findByEmail(String email);

}
