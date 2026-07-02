package com.alfa.accessories.repository;

import com.alfa.accessories.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // JpaRepository i ka te gjitha metodat bazike si save(), findAll(), findById()
}