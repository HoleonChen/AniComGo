package com.anicomgo.generator;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;

import java.util.Collections;

public class CodeGenerator {

    public static void main(String[] args) {
        String projectPath = "C:/Users/31216/Desktop/ACG/anicomgo-backend";

        FastAutoGenerator.create(
                        "jdbc:mysql://localhost:3306/anicomgo?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai",
                        "root",
                        "123456"
                )
                .globalConfig(builder -> {
                    builder.author("AniComGo")
                            .outputDir(projectPath + "/src/main/java")
                            .disableOpenDir();
                })
                .packageConfig(builder -> {
                    builder.parent("com.anicomgo")
                            .entity("entity")
                            .mapper("mapper")
                            .service("service")
                            .serviceImpl("service.impl")
                            .controller("controller")
                            .pathInfo(Collections.singletonMap(
                                    OutputFile.xml,
                                    projectPath + "/src/main/resources/mapper"
                            ));
                })
                .strategyConfig(builder -> {
                    builder.addInclude("users", "animes","comments","collections")
                            .entityBuilder()
                            .enableLombok()
                            .controllerBuilder()
                            .enableRestStyle()
                            .serviceBuilder()
                            .formatServiceFileName("%sService");
                })
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();
    }
}