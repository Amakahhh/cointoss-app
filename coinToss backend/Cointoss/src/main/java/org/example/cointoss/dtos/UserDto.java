package org.example.cointoss.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class UserDto {
    private long id;
    private String firstName;
    private String lastName;
    private String email;
}
