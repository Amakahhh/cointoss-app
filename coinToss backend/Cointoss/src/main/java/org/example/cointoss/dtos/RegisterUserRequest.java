package org.example.cointoss.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.example.cointoss.validation.Lowercase;

@Data
public class RegisterUserRequest {
    @NotBlank(message = "First name is required")
    @Size(max = 255, message = "Name must be less that 255 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 255, message = "Name must be less that 255 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Lowercase(message = "Email must be written in lowercase")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 25, message = "Password must be between 8 to 25 characters long.")
    private String password;
}
