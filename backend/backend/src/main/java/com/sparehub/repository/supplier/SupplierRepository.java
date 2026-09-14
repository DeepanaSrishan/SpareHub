package com.sparehub.repository.supplier;

import com.sparehub.entity.supplier.Supplier;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository
        extends JpaRepository<Supplier, Long> {

    boolean existsBySupplierCodeIgnoreCase(
            String supplierCode
    );

    boolean existsByEmailIgnoreCase(
            String email
    );

    boolean existsByEmailIgnoreCaseAndIdNot(
            String email,
            Long supplierId
    );

    Optional<Supplier>
    findBySupplierCodeIgnoreCase(
            String supplierCode
    );

    /*
     * Supplier list එක map කරන විට products
     * collection එක කලින් load කරගනී.
     */
    @EntityGraph(attributePaths = {
            "products"
    })
    List<Supplier>
    findAllByOrderByCompanyNameAsc();

    /*
     * Active supplier list එක map කරන විටත්
     * products collection එක කලින් load කරගනී.
     */
    @EntityGraph(attributePaths = {
            "products"
    })
    List<Supplier>
    findAllByActiveTrueOrderByCompanyNameAsc();

    /*
     * Supplier details සමඟ supplier products සහ
     * ඒවාට සම්බන්ධ spare-part details load කරගනී.
     */
    @EntityGraph(attributePaths = {
            "products",
            "products.sparePart"
    })
    @Query("""
            SELECT DISTINCT supplier
            FROM Supplier supplier
            WHERE supplier.id = :supplierId
            """)
    Optional<Supplier> findDetailedById(
            @Param("supplierId")
            Long supplierId
    );

    /*
     * US-47:
     * Company name, contact person, email,
     * contact number, alternate contact number
     * සහ supplier code මඟින් suppliers search කරයි.
     *
     * SupplierMapper එකට product count අවශ්‍ය නිසා
     * products collection එක EntityGraph මඟින්
     * load කරගනී.
     */
    @EntityGraph(attributePaths = {
            "products"
    })
    @Query("""
            SELECT DISTINCT supplier
            FROM Supplier supplier
            WHERE LOWER(supplier.companyName)
                    LIKE LOWER(
                        CONCAT('%', :search, '%')
                    )
               OR LOWER(supplier.contactPerson)
                    LIKE LOWER(
                        CONCAT('%', :search, '%')
                    )
               OR LOWER(supplier.email)
                    LIKE LOWER(
                        CONCAT('%', :search, '%')
                    )
               OR LOWER(supplier.contactNumber)
                    LIKE LOWER(
                        CONCAT('%', :search, '%')
                    )
               OR LOWER(
                    COALESCE(
                        supplier.alternateContactNumber,
                        ''
                    )
               )
                    LIKE LOWER(
                        CONCAT('%', :search, '%')
                    )
               OR LOWER(supplier.supplierCode)
                    LIKE LOWER(
                        CONCAT('%', :search, '%')
                    )
            ORDER BY supplier.companyName ASC
            """)
    List<Supplier> searchSuppliers(
            @Param("search")
            String search
    );
}