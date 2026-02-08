# Environment Variables Guide

## Overview
This application uses ASP.NET Core's configuration system which automatically loads environment variables. Environment variables override values in `appsettings.json`.

## Configuration Priority (Highest to Lowest)
1. **Environment Variables** (highest priority)
2. `appsettings.{Environment}.json` (e.g., `appsettings.Production.json`)
3. `appsettings.json` (base configuration)

## Setting Environment Variables

### Development (Local)

**Option 1: Export in terminal**
```bash
export JwtSettings__SecretKey="your-secret-key-here"
export ConnectionStrings__DefaultConnection="Data Source=dev.db"
dotnet run
```

**Option 2: Add to shell profile (~/.zshrc or ~/.bashrc)**
```bash
# Add these lines
export JwtSettings__SecretKey="your-dev-secret-key"
export ASPNETCORE_ENVIRONMENT="Development"
```

**Option 3: Use .env file (requires dotnet user-secrets or third-party package)**
```bash
# Install dotnet user-secrets
dotnet user-secrets init
dotnet user-secrets set "JwtSettings:SecretKey" "your-secret-key"
```

### Production

**Option 1: System Environment Variables**
```bash
# Set in your deployment environment
export JwtSettings__SecretKey="production-secret-key"
export ConnectionStrings__DefaultConnection="Data Source=/var/app/todo.db"
```

**Option 2: Docker**
```dockerfile
ENV JwtSettings__SecretKey="production-secret-key"
ENV ConnectionStrings__DefaultConnection="Data Source=/app/todo.db"
```

**Option 3: Systemd Service**
```ini
[Service]
Environment="JwtSettings__SecretKey=production-secret-key"
Environment="ConnectionStrings__DefaultConnection=Data Source=/var/app/todo.db"
```

## Naming Convention

Use **double underscores** (`__`) for nested configuration sections:

| JSON Path | Environment Variable |
|-----------|---------------------|
| `JwtSettings:SecretKey` | `JwtSettings__SecretKey` |
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings__DefaultConnection` |
| `JwtSettings:ExpirationMinutes` | `JwtSettings__ExpirationMinutes` |

## Important Environment Variables

### Required for Production
- `JwtSettings__SecretKey` - JWT signing key (MUST be set in production)
- `ConnectionStrings__DefaultConnection` - Database connection string

### Optional
- `ASPNETCORE_ENVIRONMENT` - Set to `Production`, `Development`, or `Staging`
- `JwtSettings__Issuer` - JWT issuer (defaults to "TodoApi")
- `JwtSettings__Audience` - JWT audience (defaults to "TodoApiUsers")
- `JwtSettings__ExpirationMinutes` - Token expiration (defaults to 30)

## Example: Setting JWT Secret for Production

```bash
# Generate a secure random key (32+ characters)
# On macOS/Linux:
openssl rand -base64 32

# Set as environment variable
export JwtSettings__SecretKey="$(openssl rand -base64 32)"

# Verify it's set
echo $JwtSettings__SecretKey

# Run the application
dotnet run
```

## Accessing in Code

Environment variables are automatically available through `IConfiguration`:

```csharp
// In Program.cs or any service
var secretKey = builder.Configuration["JwtSettings:SecretKey"];
// or
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];
```

## Security Best Practices

1. **Never commit secrets to git** - Use environment variables or secrets management
2. **Use different secrets per environment** - Dev, Staging, Production
3. **Rotate secrets regularly** - Especially JWT keys
4. **Use secrets management services** in production:
   - Azure Key Vault
   - AWS Secrets Manager
   - HashiCorp Vault
   - Kubernetes Secrets

## Checking Current Configuration

You can verify which values are being used by checking the configuration at runtime:

```csharp
// Add to Program.cs temporarily for debugging
var jwtSecret = builder.Configuration["JwtSettings:SecretKey"];
Console.WriteLine($"JWT Secret (first 10 chars): {jwtSecret?.Substring(0, Math.Min(10, jwtSecret?.Length ?? 0))}...");
```

