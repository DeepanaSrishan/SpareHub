package com.sparehub.entity.inventory;




import com.sparehub.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_category_name",
                        columnNames = "name"
                )
        },
        indexes = {
                @Index(
                        name = "idx_category_name",
                        columnList = "name"
                ),
                @Index(
                        name = "idx_category_active",
                        columnList = "active"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "name",
            nullable = false,
            length = 100
    )
    private String name;

    @Column(
            name = "description",
            length = 500
    )
    private String description;

    @Column(
            name = "active",
            nullable = false
    )
    private boolean active = true;

    public Category(
            String name,
            String description
    ) {
        this.name = name;
        this.description = description;
        this.active = true;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }
}
