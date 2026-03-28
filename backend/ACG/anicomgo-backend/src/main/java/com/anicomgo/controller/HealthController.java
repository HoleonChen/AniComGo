package com.anicomgo.controller;

import com.anicomgo.common.result.Result;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public Result<Map<String, String>> index() {
        return health();
    }

    @GetMapping("/health")
    public Result<Map<String, String>> health() {
        return Result.success(Map.of(
                "service", "AniComGo backend",
                "status", "UP"
        ));
    }
}
