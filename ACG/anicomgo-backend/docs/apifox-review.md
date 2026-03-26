# Apifox Review Notes

## Should update existing manual APIs

- Replace `/favorites` with `/collections`.
- Remove `userId` from comment-create and collection-create request bodies.
- Mark `POST /comments`, `PUT /comments/{id}`, `DELETE /comments/{id}`, `POST /collections`, `DELETE /collections/{id}` as JWT-protected.
- Mark `POST /animes`, `PUT /animes/{id}`, `DELETE /animes/{id}` as admin-only.
- Mark `PUT /users/me` as JWT-protected.
- Mark `PATCH /users/me/password` as JWT-protected.
- Mark `POST /upload` as JWT-protected.
- Mark `GET /admin/comments` and `GET /admin/collections` as admin-only.
- Mark `GET /admin/users`, `PATCH /admin/users/{id}/status`, `PATCH /admin/comments/{id}/status`, `DELETE /admin/collections/{id}` as admin-only.
- Mark `GET /admin/users/{id}`, `PATCH /admin/users/{id}/role`, `PATCH /admin/users/{id}/password/reset`, `PATCH /admin/comments/status/batch`, `DELETE /admin/comments/{id}`, `DELETE /admin/collections/batch` as admin-only.
- Add `Authorization: Bearer <token>` header for all protected APIs.
- Add `401` and `403` failure cases to protected APIs.
- Add `404` cases for anime/comment/collection detail and write operations.
- Add `400` cases for validation failures such as invalid page, status, rating, or progress.

## New APIs to add

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /users/me`
- `GET /admin/comments`
- `GET /admin/collections`
- `GET /collections/anime/{animeId}`
- `PATCH /collections/anime/{animeId}/progress`
- `GET /comments/{id}/like-status`
- `PATCH /comments/{id}/like`
- `DELETE /comments/{id}/like`
- `PATCH /users/me/password`
- `GET /admin/users`
- `PATCH /admin/users/{id}/status`
- `PATCH /admin/comments/{id}/status`
- `DELETE /admin/collections/{id}`
- `GET /admin/users/{id}`
- `PATCH /admin/users/{id}/role`
- `PATCH /admin/users/{id}/password/reset`
- `PATCH /admin/comments/status/batch`
- `DELETE /admin/comments/{id}`
- `DELETE /admin/collections/batch`
- `POST /upload`

## Request body corrections

- `POST /comments`
  - Required: `animeId`, `content`
  - Optional: `parentId`
  - Forbidden field: `userId`
- `PUT /comments/{id}`
  - Required: `content`
- `POST /collections`
  - Required: `animeId`
  - Optional: `progress`, `rating`
  - Forbidden field: `userId`
- `PATCH /collections/anime/{animeId}/progress`
  - Required: `progress`
- `POST /animes` and `PUT /animes/{id}`
  - Required: `title`, `status`
  - Optional: `posterUrl`, `tags`, `studios`, `rating`, `totalEpisodes`, `releaseDate`, `description`
- `PUT /users/me`
  - Required: `username`
  - Optional: `avatarUrl`, `bio`
- `POST /upload`
  - Required: `file`
  - Optional: `type`
  - Supported `type`: `common`, `avatar`, `poster`
- `PATCH /users/me/password`
  - Required: `oldPassword`, `newPassword`
- `PATCH /admin/users/{id}/password/reset`
  - Required: `newPassword`
- `PATCH /admin/comments/status/batch`
  - Required: `ids`, `status`
- `DELETE /admin/collections/batch`
  - Required body: `ids`

## Business rule updates

- Users must collect an anime before creating a comment on it.
- Only the comment owner or an admin can update/delete a comment.
- Only the collection owner or an admin can delete a collection.
- Collection progress cannot exceed anime total episodes when total episodes is set.
- Duplicate collections for the same `userId + animeId` should be treated as invalid.
- Anime detail responses should include `tags` and `studios` when the database has these fields.
- Anime detail responses should include `rating` when the database has this field.
- Users should be able to query and update their own collection progress by anime ID.
- Users should be able to like comments, cancel likes, and query their current like status.
- Admin-only operations should be grouped separately in Apifox, currently: `POST /animes`, `PUT /animes/{id}`, `DELETE /animes/{id}`.
- Admin moderation query group should include `GET /admin/comments` and `GET /admin/collections`.
- User status management should include disable and enable flows, and disabled users should lose effective access even with old JWTs.
- Comment moderation should include hide/show using `status=0/1`.
- Admin collection management should include deleting any collection through the admin route.
- Admin user management should include role adjustment and password reset flows.
- Comment moderation should include deleting any comment and batch hide/show operations.
- Collection moderation should include batch deletion for cleanup operations.
- Frontend should prefer `POST /upload` for avatar and poster files, then write the returned full URL into `avatarUrl` or `posterUrl`.
- `POST /users/me/avatar` should be marked as deprecated compatibility API rather than the primary upload entry.
