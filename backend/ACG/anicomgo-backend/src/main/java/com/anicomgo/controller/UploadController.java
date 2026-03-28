package com.anicomgo.controller;

import com.anicomgo.common.result.Result;
import com.anicomgo.service.AvatarStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class UploadController {

    private final AvatarStorageService avatarStorageService;

    @PostMapping
    public Result<String> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type
    ) {
        String finalType = StringUtils.hasText(type) ? type : "common";
        String url = avatarStorageService.storeFile(file, finalType);
        return Result.success(url);
    }
}
