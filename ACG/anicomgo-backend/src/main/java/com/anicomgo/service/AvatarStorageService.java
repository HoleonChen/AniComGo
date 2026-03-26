package com.anicomgo.service;

import com.anicomgo.dto.user.AvatarUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AvatarStorageService {

    AvatarUploadResponse storeAvatar(Long userId, MultipartFile file);

    String storeFile(MultipartFile file, String type);
}
