package com.sparehub.specification;

import com.sparehub.entity.User;
import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;
import org.springframework.data.jpa.domain.Specification;

public final class CustomerSpecification {

    private CustomerSpecification() {
    }

    public static Specification<User> isCustomer() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("role"),
                        Role.CUSTOMER
                );
    }

    public static Specification<User> containsKeyword(
            String keyword
    ) {
        return (root, query, criteriaBuilder) -> {

            if (keyword == null
                    || keyword.isBlank()) {

                return criteriaBuilder
                        .conjunction();
            }

            String searchValue =
                    "%" + keyword
                            .trim()
                            .toLowerCase()
                            + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("fullName")
                            ),
                            searchValue
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("email")
                            ),
                            searchValue
                    )
            );
        };
    }

    public static Specification<User> hasStatus(
            AccountStatus status
    ) {
        return (root, query, criteriaBuilder) -> {

            if (status == null) {
                return criteriaBuilder
                        .conjunction();
            }

            return criteriaBuilder.equal(
                    root.get("accountStatus"),
                    status
            );
        };
    }
}