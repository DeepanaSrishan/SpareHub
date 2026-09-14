package com.sparehub.entity.supplier;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "suppliers",
        indexes = {
                @Index(
                        name = "idx_supplier_code",
                        columnList = "supplier_code"
                ),
                @Index(
                        name = "idx_supplier_company",
                        columnList = "company_name"
                ),
                @Index(
                        name = "idx_supplier_contact",
                        columnList = "contact_number"
                ),
                @Index(
                        name = "idx_supplier_active",
                        columnList = "active"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_supplier_code",
                        columnNames = "supplier_code"
                ),
                @UniqueConstraint(
                        name = "uk_supplier_email",
                        columnNames = "email"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "supplier_code",
            nullable = false,
            unique = true,
            length = 30
    )
    private String supplierCode;

    @Column(
            name = "company_name",
            nullable = false,
            length = 150
    )
    private String companyName;

    @Column(
            name = "contact_person",
            nullable = false,
            length = 120
    )
    private String contactPerson;

    @Column(
            nullable = false,
            unique = true,
            length = 150
    )
    private String email;

    @Column(
            name = "contact_number",
            nullable = false,
            length = 25
    )
    private String contactNumber;

    @Column(
            name = "alternate_contact_number",
            length = 25
    )
    private String alternateContactNumber;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @Column(
            name = "tax_registration_number",
            length = 60
    )
    private String taxRegistrationNumber;

    @Column(
            name = "bank_account_details",
            length = 500
    )
    private String bankAccountDetails;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(
            mappedBy = "supplier",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SupplierProduct> products =
            new ArrayList<>();

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (active == null) {
            active = true;
        }

        normalizeValues();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        normalizeValues();
    }

    private void normalizeValues() {
        if (supplierCode != null) {
            supplierCode =
                    supplierCode.trim().toUpperCase();
        }

        if (companyName != null) {
            companyName = companyName.trim();
        }

        if (contactPerson != null) {
            contactPerson = contactPerson.trim();
        }

        if (email != null) {
            email = email.trim().toLowerCase();
        }

        if (contactNumber != null) {
            contactNumber = contactNumber.trim();
        }
    }

    public void addProduct(
            SupplierProduct supplierProduct
    ) {
        products.add(supplierProduct);
        supplierProduct.setSupplier(this);
    }

    public void removeProduct(
            SupplierProduct supplierProduct
    ) {
        products.remove(supplierProduct);
    }
}