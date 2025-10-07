package org.example.cointoss.mappers;

import org.example.cointoss.dtos.RegisterUserRequest;
import org.example.cointoss.dtos.UpdateEmailRequest;
import org.example.cointoss.dtos.UpdateNameRequest;
import org.example.cointoss.dtos.UserDto;
import org.example.cointoss.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "wallet", ignore = true)
    @Mapping(target = "bets", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    User toEntity(RegisterUserRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "wallet", ignore = true)
    @Mapping(target = "bets", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEmail(UpdateEmailRequest request, @MappingTarget User user);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "wallet", ignore = true)
    @Mapping(target = "bets", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateUsername(UpdateNameRequest request, @MappingTarget User user);
}
