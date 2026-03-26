# 后端接口与存储架构改造建议书 (针对 npm http-server 环境)

## 0. 背景说明
前端目前已完成“头像上传”与“番剧海报上传”的组件改造，不再传输 base64 或只依赖外部链接，而是对接统一的文件上传接口。
鉴于目前的图片服务采用 `npm http-server` 托管静态文件，后端需要承担“文件写入”与“URL映射”的桥梁作用。

---

## 1. 核心变更目标
1.  **接口统一**：废弃仅针对用户头像的 `/users/me/avatar` 接口，改为通用的 `/upload` 接口，供“用户头像”、“番剧海报”及未来“评论图片”等因为场景共用。
2.  **存储逻辑适配**：业务后端接收前端上传的文件流，将其写入到 `http-server` 托管的物理目录中，并返回对应的 HTTP 访问地址。

---

## 2. 架构拓扑 (基于 npm http-server)

*   **业务后端 (API Server)**: 运行在端口 `A` (如 8080)。负责接收 `POST` 上传请求，进行权限验证和文件重命名。
*   **图片服务器 (Asset Server)**: 运行在端口 `B` (如 9000)，使用 `http-server` 启动 (例如 `http-server ./uploads -p 9000`)。
*   **物理存储**: 两个服务需要能够访问同一个文件目录（如果是同机部署，则是本地目录；如果是跨机部署，需要 NFS/挂载共享目录）。

**数据流向：**
1.  前端 `POST /upload` (文件) -> **业务后端**
2.  **业务后端** -> (保存文件) -> **共享目录** (即 http-server 的根目录)
3.  **业务后端** -> (返回 URL) -> 前端
4.  前端 `<img src="URL">` -> **图片服务器** (http-server)

---

## 3. API 接口规范建议

请新增或重构以下接口：

### 3.1 通用上传接口
*   **Method**: `POST`
*   **Path**: `/upload`
*   **Access**: 登录用户 (User/Admin)
*   **Header**: `Content-Type: multipart/form-data`
*   **Request Body**:
    *   `file`: Binary (文件流, 必填)
    *   `type`: String (可选, 默认为 `common`。用于建立子目录，如 `avatar`, `poster`)
*   **Response**:
    ```json
    {
        "code": 200,
        "message": "success",
        "data": "http://192.168.1.100:9000/avatar/20260326_uuid.jpg"
    }
    ```
    *(注：返回的 URL 必须是完整的、前端可直接访问的链接)*

---

## 4. 后端实现逻辑建议 (Java/Spring Boot 示例)

由于 `npm http-server` 是只读的静态文件服务器（不具备接收 POST 写入的能力），**写入动作必须由业务后端完成**。

### 4.1 配置项 (application.yml)
后端需要知道文件存哪，以及对外生成的 URL前缀是啥。

```yaml
app:
  upload:
    # 物理存储路径：必须指向 npm http-server 正在服务的那个文件夹
    save-path: "/var/www/anicomgo-assets/"
    # 访问前缀：npm http-server 的访问地址
    base-url: "http://static.anicomgo.com:9000/" 
```

### 4.2 代码逻辑 (Controller/Service)

```java
@RestController
public class FileUploadController {

    @Value("${app.upload.save-path}")
    private String uploadDir; // 例如 D:/project/static/ 或 /var/www/static/

    @Value("${app.upload.base-url}")
    private String staticServerUrl; // 例如 http://localhost:9000/

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file, 
                                 @RequestParam(value = "type", defaultValue = "common") String type) {
        
        // 1. 基础校验 (判空、文件类型、大小限制)
        if (file.isEmpty()) return Result.error(400, "文件不能为空");
        
        // 2. 生成文件名 (防止覆盖)
        // 建议结构: {save-path}/{type}/{日期}/{UUID}.jpg
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uuid = UUID.randomUUID().toString();
        // 相对路径: avatar/2026/uuid.jpg
        String relativePath = type + "/" + LocalDate.now().getYear() + "/" + uuid + suffix;

        try {
            // 3. 物理写入
            // 确保目录存在
            File destFile = new File(uploadDir + File.separator + relativePath);
            if (!destFile.getParentFile().exists()) {
                destFile.getParentFile().mkdirs();
            }
            // 写入磁盘 (这一步将文件放到了 http-server 的根目录下)
            file.transferTo(destFile);

            // 4. 生成 URL
            // URL = http-server地址 + 相对路径
            // 注意处理路径分隔符，URL统一用 "/"
            String finalUrl = staticServerUrl + relativePath.replace("\\", "/");

            return Result.success(finalUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return Result.error(500, "文件存储失败");
        }
    }
}
```

### 4.3 注意事项
1.  **权限问题**：如果后端以 `java -jar` 运行，通过 IDE 启动，或者在 Linux 上以特定用户运行，请确保它对 `npm http-server` 的目录有**写权限**。
2.  **路径分隔符**：生成 URL 时，请务必将 Windows 的 `\` 转换为 `/`。
3.  **同源/跨域**：如果前端(80端口)、后端(8080端口)、图片服务(9000端口) 端口不同，前端 `<img>` 标签加载图片通常没问题，但如果涉及 Canvas 操作可能需要 `http-server` 开启 CORS (`http-server --cors`)。

---

## 5. 现有业务接口调整

以下接口不需要改变参数定义，但处理逻辑需要适配：

1.  **用户注册/修改资料**:
    *   前端会先调用 `/upload` 拿到 URL，然后把 URL 字符串传给 `avatarUrl` 字段。后端直接存字符串即可。
2.  **番剧管理 (新增/修改)**:
    *   前端会先调用 `/upload` 拿到 URL，然后把 URL 字符串传给 `posterUrl` 字段。后端直接存字符串即可。
