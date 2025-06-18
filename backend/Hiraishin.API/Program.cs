using Hiraishin.Data.Context;
using Hiraishin.Domain.Interface.Services;
using Hiraishin.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var dbConfig = builder.Configuration.GetSection("Database");

var connString = builder.Configuration.GetConnectionString("DefaultConnection");
var connectionString = new NpgsqlConnectionStringBuilder
{
    Host = dbConfig["Host"],
    Port = int.Parse(dbConfig["Port"]!),
    Database = dbConfig["Database"],
    Username = dbConfig["Username"],
    Password = dbConfig["Password"]
};

builder.Services.AddDbContext<HiraishinContext>(options =>
    options.UseNpgsql(connectionString.ConnectionString));

builder.Services.AddHttpClient<ILolApiProvider, LolApiProvider>(client => 
{
    client.BaseAddress = new Uri("https://br1.api.riotgames.com");
    client.DefaultRequestHeaders.Add("X-Riot-Token", builder.Configuration["RiotGamesApi:ApiKey"]);
});

builder.Services.AddSwaggerGen(swagger =>
{
    swagger.SwaggerDoc("v1", new OpenApiInfo { Title = "Sebo", Version = "v1" });
    swagger.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description =
                "JWT Authorization Header\r\n\r\n" +
                "Informe seu token segundo o formato: 'Bearer [Token]'.\r\n\r\n" +
                "Exemplo: 'Bearer ABC123DFG456'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
    });
    swagger.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
     });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

/* using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetService<HiraishinContext>();
    context?.Database.Migrate();
}*/

app.Run();
