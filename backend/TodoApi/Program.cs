using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TodoApi.Data;
using TodoApi.Middleware;
using TodoApi.Services;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        // Enums are serialized as numbers by default (0, 1, 2) which matches frontend
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "Todo API", 
        Version = "v1",
        Description = "A simple to-do task management API with authentication"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure Entity Framework with SQLite
builder.Services.AddDbContext<TodoDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=todo.db"));

// Register services
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITodoStateService, TodoStateService>();
builder.Services.AddScoped<IUserContextService, UserContextService>();
builder.Services.AddHttpContextAccessor();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!ChangeThisInProduction!";
var issuer = jwtSettings["Issuer"] ?? "TodoApi";
var audience = jwtSettings["Audience"] ?? "TodoApiUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero // Remove delay of token expiration
    };
});

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use custom exception handling middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowReactApp");

// Authentication & Authorization (order matters!)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed database with initial data
using (var scope = app.Services.CreateScope())
{
    try
    {
        // #region agent log
        var logPath = "/Users/aavila/code/interviews/.cursor/debug.log";
        var logEntry = new { location = "Program.cs:62", message = "Before creating scope and seeding", data = new { }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), runId = "initial", hypothesisId = "A,B,C,D,E" };
        File.AppendAllText(logPath, JsonSerializer.Serialize(logEntry) + "\n");
        // #endregion

        var dbContext = scope.ServiceProvider.GetRequiredService<TodoDbContext>();

        // #region agent log
        var logEntry2 = new { location = "Program.cs:68", message = "DbContext obtained", data = new { connectionString = dbContext.Database.GetConnectionString() }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), runId = "initial", hypothesisId = "A,B" };
        File.AppendAllText(logPath, JsonSerializer.Serialize(logEntry2) + "\n");
        // #endregion

        await DataSeeder.SeedAsync(dbContext);

        // #region agent log
        var logEntry3 = new { location = "Program.cs:73", message = "Seeding completed successfully", data = new { }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), runId = "initial", hypothesisId = "A" };
        File.AppendAllText(logPath, JsonSerializer.Serialize(logEntry3) + "\n");
        // #endregion
    }
    catch (Exception ex)
    {
        // #region agent log
        var logPath = "/Users/aavila/code/interviews/.cursor/debug.log";
        var logEntry = new { location = "Program.cs:78", message = "Exception during seeding", data = new { error = ex.Message, type = ex.GetType().Name, stackTrace = ex.StackTrace }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), runId = "initial", hypothesisId = "A,B,C,D,E" };
        File.AppendAllText(logPath, JsonSerializer.Serialize(logEntry) + "\n");
        // #endregion
        throw;
    }
}

app.Run();

// Make Program class accessible for testing
public partial class Program { }

