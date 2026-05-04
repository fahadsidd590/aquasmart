using System.Text;
using AquaSmart.Api.Configuration;
using AquaSmart.Api.Repositories;
using AquaSmart.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection(MongoDbSettings.SectionName));
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<BootstrapSettings>(
    builder.Configuration.GetSection(BootstrapSettings.SectionName));

builder.Services.AddSingleton<ISensorReadingRepository, SensorReadingRepository>();
builder.Services.AddSingleton<ISettingsRepository, SettingsRepository>();
builder.Services.AddSingleton<IControlActionRepository, ControlActionRepository>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IWaterFilterRepository, WaterFilterRepository>();
builder.Services.AddSingleton<IFilterHistoryRepository, FilterHistoryRepository>();
builder.Services.AddSingleton<IAreaSensorStateRepository, AreaSensorStateRepository>();
builder.Services.AddSingleton<ITokenService, JwtTokenService>();

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
                  ?? new JwtSettings();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Default JWT inbound mapping renames the "role" claim; RoleClaimType would not match → 403 on admin routes.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "AquaSmart API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT: enter `Bearer {token}`",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Pure HTTP (LAN / mobile dev) breaks when this redirects to HTTPS. Keep HTTPS in Production only.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    service = "AquaSmart IoT API",
    version = "1.0.0",
    endpoints = new[]
    {
        "POST /api/system/bootstrap",
        "POST /api/auth/register",
        "POST /api/auth/login",
        "GET /api/me/filters",
        "GET /api/me/filter-alert",
        "GET /api/me/filter-history",
        "GET /api/admin/dashboard",
        "GET /api/admin/users",
        "POST /api/admin/users",
        "PUT /api/admin/users/{id}",
        "GET /api/admin/filters",
        "POST /api/admin/filters",
        "PUT /api/admin/filters/{id}",
        "GET /api/admin/filters/{id}/history",
        "POST /api/area-sensor-state",
        "GET /api/area-sensor-state/current",
        "GET /swagger"
    }
}));

app.Run();
