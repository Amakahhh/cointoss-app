package org.example.cointoss.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.example.cointoss.entities.Role;

import javax.crypto.SecretKey;
import java.util.Date;

public class Jwt {

    private final Claims claims;
    private final SecretKey secretKey;

    public Jwt(Claims claims, SecretKey secretKey) {
        this.claims = claims;
        this.secretKey = secretKey;
    }

    public Boolean isExpired(){
        return claims.getExpiration().before(new Date());
    }

    public Long getUserId(){
        return Long.valueOf(claims.getSubject());
    }

    public Role getRole(){
        return Role.valueOf(claims.get("role", String.class));
    }

    public String toString(){
       return Jwts.builder().claims(claims).signWith(secretKey).compact();
    }
}
