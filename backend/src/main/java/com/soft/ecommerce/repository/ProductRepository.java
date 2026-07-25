package com.soft.ecommerce.repository;

import com.soft.ecommerce.model.Category;
import com.soft.ecommerce.model.Product;
import com.soft.ecommerce.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findByCategoryOrderByPriceAsc(Category category, Pageable pageDetails);

    Page<Product> findByNameContainingIgnoreCase(String keyword, Pageable pageDetails);

    Page<Product> findByUser(User user, Pageable pageDetails);

    long countByUser(User user);
}
