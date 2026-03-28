package com.anicomgo.common.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {

    @NotBlank
    private String savePath = "uploads";

    @NotBlank
    private String baseUrl = "http://127.0.0.1:9000/";

    @Min(1)
    private long maxSizeBytes = 2 * 1024 * 1024;

    private List<String> allowedExtensions = new ArrayList<>(List.of("jpg", "jpeg", "png", "webp"));

    private List<String> allowedContentTypes = new ArrayList<>(List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    ));

    private List<String> allowedTypes = new ArrayList<>(List.of("common", "avatar", "poster"));
}
