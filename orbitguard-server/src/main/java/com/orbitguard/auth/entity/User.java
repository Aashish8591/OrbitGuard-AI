package com.orbitguard.auth.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.orbitguard.auth.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;

    private String email;

    private String password;

    /**
     * User role used for Role-Based Access Control (RBAC).
     *
     * <p>
     * New users are assigned USER by default.
     * Administrative privileges must be assigned explicitly.
     * </p>
     */
    @Builder.Default
    private Role role = Role.USER;

    /**
     * Optional profile image URL/path.
     */
    private String profileImage;

    /**
     * Indicates whether the user account is active.
     */
    @Builder.Default
    private Boolean active = true;

    /**
     * Timestamp when the user account was created.
     */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Timestamp when the user account was last updated.
     */
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}