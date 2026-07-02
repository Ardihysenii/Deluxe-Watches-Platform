package com.alfa.accessories.repository;

import com.alfa.accessories.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findTop3ByOrderByIdDesc();

    List<Product> findTop3ByCategoryAndIdNot(String category, Long id);

    java.util.Optional<Product> findFirstByNameIgnoreCase(String name);
}
