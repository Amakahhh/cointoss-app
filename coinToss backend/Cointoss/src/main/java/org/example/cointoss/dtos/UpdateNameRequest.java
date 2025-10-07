package org.example.cointoss.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data

/* I should  have named this method better, but it's basically if user wants to change their names present in the app*/
public class UpdateNameRequest {
        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "First name must be less that 255 characters")
        public String firstName;

        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "Last name must be less that 255 characters")
        public String lastName;
}
