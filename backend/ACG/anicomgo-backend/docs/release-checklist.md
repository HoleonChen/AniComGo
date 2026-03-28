# Release Checklist

## Required before frontend joint testing

- Import `docs/apifox-openapi.yaml` into Apifox.
- Run the cases in `docs/apifox-testcases.md`.
- Configure environment variables from `.env.example`.
- Initialize database using `docs/database-schema.sql`.
- Start the static asset server against `UPLOAD_SAVE_PATH`, for example:
```powershell
http-server D:\anicomgo-assets -p 9000 --cors
```
- Verify `UPLOAD_BASE_URL` matches the actual static server address.

## Required before deployment

- Replace `DB_PASSWORD` with a real password.
- Replace `JWT_SECRET` with a strong random secret.
- Disable SQL debug logging if not needed in production.
- Verify admin account exists and has `role=1`.
- Remove or ignore the `target/` directory in package artifacts.
- Ensure the backend process has write permission to `UPLOAD_SAVE_PATH`.

## Current known limitation

- Maven compile/test has not been fully verified in this environment because dependency download to Maven Central is blocked by network resolution.
- After network or mirror access is restored, run:
```powershell
mvn -gs .mvn\local-settings.xml -s .mvn\local-settings.xml -DskipTests compile
mvn -gs .mvn\local-settings.xml -s .mvn\local-settings.xml test
```
