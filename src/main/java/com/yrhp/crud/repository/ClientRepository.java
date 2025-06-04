package com.yrhp.crud.repository;

import com.yrhp.crud.model.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {

    List<Client> findByName(String name);

    Optional<Client> findByEmail(String email);

    Optional<Client> findByMobile(String mobile);

    Optional<Client> findById(int id);

    Optional<Client> findByGenerateLink(String generateLink);

    Optional<Client> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
    boolean existsByEmail(String email);
    boolean existsByMobile(String mobile);
    boolean existsByReviewLink(String reviewLink);

    Page<Client> findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
        String name, String mobile, String email, Pageable pageable);
}
