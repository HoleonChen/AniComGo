# Apifox 测试用例建议

## 环境变量

- 基础地址：`http://localhost:8080`
- 静态资源地址：`http://127.0.0.1:9000`
- 普通用户令牌：`{{user_token}}`
- 管理员令牌：`{{admin_token}}`
- 用户 ID：`{{user_id}}`
- 番剧 ID：`{{anime_id}}`
- 评论 ID：`{{comment_id}}`
- 收藏 ID：`{{collection_id}}`
- 头像地址：`{{avatar_url}}`
- 海报地址：`{{poster_url}}`

## 认证模块

### 用户注册成功

- 请求：`POST /auth/register`
- 请求体：
```json
{
  "username": "misaka_10032",
  "password": "12345678",
  "avatarUrl": "https://cdn.example.com/avatar/misaka.jpg",
  "bio": "Railgun fan."
}
```
- 预期：`200`，响应中包含 `data.token`、`data.user.id`

### 用户注册重复用户名

- 请求：重复提交相同注册信息
- 预期：`400`，提示类似 `用户名已存在`

### 用户登录成功

- 请求：`POST /auth/login`
- 请求体：
```json
{
  "username": "misaka_10032",
  "password": "12345678"
}
```
- 预期：`200`，将 `data.token` 保存到 `{{user_token}}`

### 用户登录密码错误

- 请求：相同用户名，错误密码
- 预期：`401`

### 获取当前登录用户信息

- 请求：`GET /auth/me`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`200`

### 未登录获取当前用户信息

- 请求：`GET /auth/me`
- 预期：`401`

## 用户模块

### 查询用户列表

- 请求：`GET /users?page=1&size=5`
- 预期：`200`

### 修改个人资料成功

- 请求：`PUT /users/me`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：
```json
{
  "username": "misaka_10033",
  "avatarUrl": "https://cdn.example.com/avatar/misaka-new.jpg",
  "bio": "Level 5 fan."
}
```
- 预期：`200`，返回中的用户名已更新

### 修改个人资料用户名重复

- 前置条件：系统中已存在另一个用户名
- 请求：`PUT /users/me`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体使用已存在用户名
- 预期：`400`

### 修改密码成功

- 请求：`PATCH /users/me/password`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：
```json
{
  "oldPassword": "12345678",
  "newPassword": "87654321"
}
```
- 预期：`200`

### 修改密码时旧密码错误

- 请求：同一接口
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体中的 `oldPassword` 填错
- 预期：`400`

### 通用上传头像成功

- 请求：`POST /upload`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：`multipart/form-data`
- 表单字段：
  - `file`：选择一个 `jpg/png/webp` 图片文件
  - `type`：`avatar`
- 预期：`200`，响应中 `data` 为完整可访问 URL
- 后续操作：将返回的 `data` 保存到 `{{avatar_url}}`

### 通用上传番剧海报成功

- 请求：`POST /upload`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：`multipart/form-data`
- 表单字段：
  - `file`：选择一个 `jpg/png/webp` 图片文件
  - `type`：`poster`
- 预期：`200`，响应中 `data` 为完整可访问 URL
- 后续操作：将返回的 `data` 保存到 `{{poster_url}}`

### 旧头像上传接口兼容成功

- 请求：`POST /users/me/avatar`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：`multipart/form-data`
- 表单字段：
  - `file`：选择一个 `jpg/png/webp` 图片文件
- 预期：`200`，响应中包含 `data.avatarUrl`
- 后续操作：将返回的 `data.avatarUrl` 保存到 `{{avatar_url}}`

### 上传头像后更新个人资料

- 前置条件：已成功上传头像并拿到 `{{avatar_url}}`
- 请求：`PUT /users/me`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：
```json
{
  "username": "misaka_10033",
  "avatarUrl": "{{avatar_url}}",
  "bio": "头像已更新"
}
```
- 预期：`200`，返回中的 `avatarUrl` 等于 `{{avatar_url}}`

### 通用上传未登录

- 请求：`POST /upload`
- 不带 `Authorization`
- 预期：`401`

### 通用上传文件为空

- 请求：`POST /upload`
- 请求头：`Authorization: Bearer {{user_token}}`
- 表单字段：
  - `type`：`avatar`
- 不传 `file` 或传空文件
- 预期：`400`，提示 `文件不能为空`

### 通用上传文件类型不支持

- 请求：`POST /upload`
- 请求头：`Authorization: Bearer {{user_token}}`
- 表单字段：
  - `type`：`avatar`
- 表单上传 `txt`、`pdf` 等非图片文件
- 预期：`400`，提示 `文件类型不受支持` 或 `文件扩展名不受支持`

### 通用上传文件业务类型不合法

- 请求：`POST /upload`
- 请求头：`Authorization: Bearer {{user_token}}`
- 表单字段：
  - `file`：一个合法图片文件
  - `type`：`../../evil`
- 预期：`400`，提示 `文件类型参数不合法`

### 通用上传文件过大

- 请求：`POST /upload`
- 请求头：`Authorization: Bearer {{user_token}}`
- 表单字段：
  - `type`：`avatar`
- 上传大于 `2MB` 的图片文件
- 预期：`400`，提示 `文件过大`

## 番剧模块

### 查询番剧列表

- 请求：`GET /animes?page=1&size=5`
- 预期：`200`

### 查询番剧详情不存在

- 请求：`GET /animes/999999`
- 预期：`404`

### 查询番剧详情包含标签和制作公司

- 请求：`GET /animes/{{anime_id}}`
- 预期：`200`
- 检查点：
  - 响应 `data.tags` 存在并为字符串
  - 响应 `data.studios` 存在并为字符串

### 管理员新增番剧

- 请求：`POST /animes`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "title": "Frieren",
  "posterUrl": "{{poster_url}}",
  "tags": "奇幻,冒险,治愈",
  "studios": "Madhouse",
  "rating": 4.8,
  "totalEpisodes": 28,
  "releaseDate": "2023-09-29",
  "description": "Adventure after the hero party victory.",
  "status": 2
}
```
- 预期：`200`

### 番剧详情返回综合评分

- 请求：`GET /animes/{{anime_id}}`
- 预期：`200`
- 检查点：
  - 响应 `data.rating` 存在
  - 支持返回类似 `4.8` 的小数评分

### 普通用户新增番剧

- 请求：同上，使用 `{{user_token}}`
- 预期：`403`

### 未登录新增番剧

- 请求：同上，不带认证头
- 预期：`401`

## 收藏模块

### 新增收藏成功

- 请求：`POST /collections`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：
```json
{
  "animeId": {{anime_id}},
  "progress": 3,
  "rating": 5
}
```
- 预期：`200`

### 重复新增收藏

- 请求：重复提交同样的收藏请求
- 预期：`400`

### 未登录新增收藏

- 请求：同样请求但不带认证头
- 预期：`401`

### 删除自己的收藏

- 请求：`DELETE /collections/{{collection_id}}`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`200`

### 查询当前用户对指定番剧的收藏详情

- 请求：`GET /collections/anime/{{anime_id}}`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`200`
- 检查点：
  - 响应中包含 `data.progress`
  - 响应中包含 `data.rating`

### 修改追番进度成功

- 请求：`PATCH /collections/anime/{{anime_id}}/progress`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：
```json
{
  "progress": 4
}
```
- 预期：`200`
- 检查点：响应中的 `data.progress` 等于 `4`

### 修改追番进度超过总集数

- 请求：`PATCH /collections/anime/{{anime_id}}/progress`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体中的 `progress` 大于番剧总集数
- 预期：`400`，提示 `观看进度不能超过总集数`

### 未收藏时查询收藏详情

- 请求：`GET /collections/anime/{{anime_id}}`
- 请求头：`Authorization: Bearer {{user_token}}`
- 前置条件：当前用户未收藏该番剧
- 预期：`404`

### 未登录修改追番进度

- 请求：`PATCH /collections/anime/{{anime_id}}/progress`
- 不带 `Authorization`
- 预期：`401`

### 删除他人的收藏

- 请求：普通用户令牌删除别人的收藏 ID
- 预期：`403`

## 评论模块

### 收藏后发表评论成功

- 前置条件：用户已收藏目标番剧
- 请求：`POST /comments`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：
```json
{
  "animeId": {{anime_id}},
  "content": "This ending was excellent."
}
```
- 预期：`200`

### 未收藏时发表评论

- 前置条件：用户未收藏目标番剧
- 预期：`403`

### 未登录发表评论

- 请求：同样请求但不带认证头
- 预期：`401`

### 修改自己的评论

- 请求：`PUT /comments/{{comment_id}}`
- 请求头：`Authorization: Bearer {{user_token}}`
- 请求体：
```json
{
  "content": "I changed my mind, episode 12 was the best."
}
```
- 预期：`200`

### 修改他人的评论

- 请求：普通用户令牌修改别人的评论 ID
- 预期：`403`

### 删除自己的评论

- 请求：`DELETE /comments/{{comment_id}}`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`200`

### 查询评论点赞状态

- 请求：`GET /comments/{{comment_id}}/like-status`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`200`
- 检查点：
  - 响应中包含 `data.liked`
  - 响应中包含 `data.likesCount`

### 评论点赞成功

- 请求：`PATCH /comments/{{comment_id}}/like`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`200`
- 检查点：
  - `data.liked` 为 `true`
  - `data.likesCount` 增加

### 重复点赞评论

- 请求：再次调用 `PATCH /comments/{{comment_id}}/like`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`400`，提示 `你已经点赞过该评论`

### 取消评论点赞成功

- 请求：`DELETE /comments/{{comment_id}}/like`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`200`
- 检查点：
  - `data.liked` 为 `false`
  - `data.likesCount` 减少

### 未点赞时取消评论点赞

- 请求：`DELETE /comments/{{comment_id}}/like`
- 请求头：`Authorization: Bearer {{user_token}}`
- 前置条件：当前用户尚未点赞该评论
- 预期：`400`，提示 `你还没有点赞该评论`

### 未登录查询评论点赞状态

- 请求：`GET /comments/{{comment_id}}/like-status`
- 不带 `Authorization`
- 预期：`401`

## 管理端查询与审核

### 管理员查询评论列表

- 请求：`GET /admin/comments?page=1&size=10&status=1&keyword=excellent`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 预期：`200`

### 普通用户查询管理端评论列表

- 请求：同样请求，使用 `{{user_token}}`
- 预期：`403`

### 管理员查询收藏列表

- 请求：`GET /admin/collections?page=1&size=10&minRating=4&maxRating=5`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 预期：`200`

### 未登录查询管理端收藏列表

- 请求：同样请求但不带认证头
- 预期：`401`

### 管理员查询用户列表

- 请求：`GET /admin/users?page=1&size=10&status=1`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 预期：`200`

### 管理员查询单个用户详情

- 请求：`GET /admin/users/{{user_id}}`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 预期：`200`

### 管理员禁用用户

- 请求：`PATCH /admin/users/{{user_id}}/status`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "status": 0
}
```
- 预期：`200`

### 用户被禁用后旧令牌失效

- 前置条件：上一条已禁用该用户
- 请求：`GET /auth/me`
- 请求头：`Authorization: Bearer {{user_token}}`
- 预期：`401`

### 被禁用用户无法登录

- 请求：`POST /auth/login`
- 使用被禁用用户的账号密码
- 预期：`403`

### 管理员重新启用用户

- 请求：`PATCH /admin/users/{{user_id}}/status`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "status": 1
}
```
- 预期：`200`

### 管理员修改用户角色

- 请求：`PATCH /admin/users/{{user_id}}/role`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "role": 1
}
```
- 预期：`200`

### 管理员重置用户密码

- 请求：`PATCH /admin/users/{{user_id}}/password/reset`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "newPassword": "11223344"
}
```
- 预期：`200`

### 管理员隐藏评论

- 请求：`PATCH /admin/comments/{{comment_id}}/status`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "status": 0
}
```
- 预期：`200`

### 管理员恢复评论显示

- 请求：同一接口
- 请求体：
```json
{
  "status": 1
}
```
- 预期：`200`

### 管理员批量隐藏评论

- 请求：`PATCH /admin/comments/status/batch`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "ids": [{{comment_id}}],
  "status": 0
}
```
- 预期：`200`

### 管理员删除任意评论

- 请求：`DELETE /admin/comments/{{comment_id}}`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 预期：`200`

### 管理员删除任意收藏

- 请求：`DELETE /admin/collections/{{collection_id}}`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 预期：`200`

### 管理员批量删除收藏

- 请求：`DELETE /admin/collections/batch`
- 请求头：`Authorization: Bearer {{admin_token}}`
- 请求体：
```json
{
  "ids": [{{collection_id}}]
}
```
- 预期：`200`
