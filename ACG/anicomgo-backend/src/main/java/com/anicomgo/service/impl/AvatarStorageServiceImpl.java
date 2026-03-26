package com.anicomgo.service.impl;

import com.anicomgo.common.config.UploadProperties;
import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.dto.user.AvatarUploadResponse;
import com.anicomgo.service.AvatarStorageService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AvatarStorageServiceImpl implements AvatarStorageService {

    private static final DateTimeFormatter YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy");

    private final UploadProperties uploadProperties;

    public AvatarStorageServiceImpl(UploadProperties uploadProperties) {
        this.uploadProperties = uploadProperties;
    }

    @Override
    public AvatarUploadResponse storeAvatar(Long userId, MultipartFile file) {
        String avatarUrl = storeInternal(file, "avatar", List.of(
                "请选择要上传的头像文件",
                "头像文件过大",
                "头像文件缺少扩展名",
                "头像文件扩展名不受支持",
                "头像文件类型不受支持",
                "头像存储路径不合法",
                "头像保存失败"
        ));
        return new AvatarUploadResponse(avatarUrl);
    }

    @Override
    public String storeFile(MultipartFile file, String type) {
        String normalizedType = normalizeType(type);
        return storeInternal(file, normalizedType, List.of(
                "文件不能为空",
                "文件过大",
                "文件缺少扩展名",
                "文件扩展名不受支持",
                "文件类型不受支持",
                "文件存储路径不合法",
                "文件存储失败"
        ));
    }

    private String storeInternal(MultipartFile file, String type, List<String> messages) {
        validateFile(file, messages);

        String extension = extractExtension(file.getOriginalFilename(), messages.get(2));
        String fileName = UUID.randomUUID() + "." + extension;
        String relativePath = type + "/" + LocalDate.now().format(YEAR_FORMATTER) + "/" + fileName;

        Path storageRoot = Paths.get(uploadProperties.getSavePath()).toAbsolutePath().normalize();
        Path targetFile = storageRoot.resolve(relativePath).normalize();
        if (!targetFile.startsWith(storageRoot)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, messages.get(5));
        }

        try {
            Files.createDirectories(targetFile.getParent());
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException(ResultCode.ERROR, messages.get(6));
        }

        return buildFinalUrl(relativePath);
    }

    private void validateFile(MultipartFile file, List<String> messages) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, messages.get(0));
        }
        if (file.getSize() > uploadProperties.getMaxSizeBytes()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, messages.get(1));
        }

        String extension = extractExtension(file.getOriginalFilename(), messages.get(2));
        Set<String> allowedExtensions = uploadProperties.getAllowedExtensions().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        if (!allowedExtensions.contains(extension)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, messages.get(3));
        }

        String contentType = file.getContentType();
        Set<String> allowedContentTypes = uploadProperties.getAllowedContentTypes().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        if (!StringUtils.hasText(contentType) || !allowedContentTypes.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ResultCode.BAD_REQUEST, messages.get(4));
        }
    }

    private String normalizeType(String type) {
        String normalizedType = StringUtils.hasText(type) ? type.trim().toLowerCase(Locale.ROOT) : "common";
        Set<String> allowedTypes = uploadProperties.getAllowedTypes().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        if (!allowedTypes.contains(normalizedType)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "文件类型参数不合法");
        }
        return normalizedType;
    }

    private String extractExtension(String originalFilename, String missingExtensionMessage) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            throw new BusinessException(ResultCode.BAD_REQUEST, missingExtensionMessage);
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1)
                .trim()
                .toLowerCase(Locale.ROOT);
        if (!StringUtils.hasText(extension)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, missingExtensionMessage);
        }
        return extension;
    }

    private String buildFinalUrl(String relativePath) {
        String normalizedBaseUrl = uploadProperties.getBaseUrl().trim();
        if (!normalizedBaseUrl.endsWith("/")) {
            normalizedBaseUrl += "/";
        }
        return normalizedBaseUrl + relativePath.replace("\\", "/");
    }
}
