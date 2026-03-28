package com.anicomgo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.anicomgo.mapper")
public class AniComGoApplication {

    public static void main(String[] args) {
        SpringApplication.run(AniComGoApplication.class, args);
    }
}