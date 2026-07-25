package com.soft.ecommerce.repository;

import com.soft.ecommerce.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(
            value = """
                    SELECT DISTINCT o
                    FROM Order o
                    JOIN o.orderItems oi
                    JOIN oi.product p
                    WHERE p.user.id = :sellerId
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT o)
                    FROM Order o
                    JOIN o.orderItems oi
                    JOIN oi.product p
                    WHERE p.user.id = :sellerId
                    """
    )
    Page<Order> findAllBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    Double getTotalRevenue();

    @Query("""
            SELECT COUNT(DISTINCT o)
            FROM Order o
            JOIN o.orderItems oi
            JOIN oi.product p
            WHERE p.user.id = :sellerId
            """)
    long countDistinctBySellerId(@Param("sellerId") Long sellerId);

    @Query("""
            SELECT COALESCE(SUM(oi.price * oi.quantity * (1 - COALESCE(oi.discount, 0) / 100.0)), 0)
            FROM OrderItem oi
            JOIN oi.product p
            WHERE p.user.id = :sellerId
            """)
    Double getTotalRevenueBySellerId(@Param("sellerId") Long sellerId);

    Page<Order> findByEmail(String email, Pageable pageable);

    Optional<Order> findByIdAndEmail(Long orderId, String email);
}
