package org.example.cointoss.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.example.cointoss.validation.Lowercase;

@Data
public class UpdateEmailRequest {
    @Email
    @NotBlank(message = "An email is required")
    @Lowercase
    public String email;
}
