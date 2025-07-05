using Hangfire;
using Hangfire.PostgreSql;
using Hiraishin.Data.Context;
using Hiraishin.Domain.Interface.Services;
using Hiraishin.Jobs;
using Hiraishin.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Npgsql;
using Serilog;
using Serilog.Settings.Configuration;
using UAParser;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration, new ConfigurationReaderOptions() { SectionName = "Logging" })
    .ReadFrom.Services(services));

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

builder.Services.AddHttpClient<IHiraishinService, HiraishinService>(client =>
{
    client.DefaultRequestHeaders.Add("X-Riot-Token", builder.Configuration["RiotGamesApi:ApiKey"]);
});

builder.Services.AddHangfire(x =>
{
    x.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseSerilogLogProvider()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(options => { options.UseNpgsqlConnection(connectionString.ConnectionString); },
            new PostgreSqlStorageOptions { UseSlidingInvisibilityTimeout = true });
});

builder.Services.AddHangfireServer(options =>
{
    options.SchedulePollingInterval = TimeSpan.FromHours(1);
});

builder.Services.AddSwaggerGen(swagger =>
{
    swagger.SwaggerDoc("v1", new OpenApiInfo { Title = "Hiraishin", Version = "v1" });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<BadRequestExceptionHandler>();
builder.Services.AddExceptionHandler<NotFoundExceptionHandler>();
builder.Services.AddExceptionHandler<TooManyRequestsExceptionHandler>();

builder.Services.AddControllers().AddNewtonsoftJson(options =>
     options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors(x =>
    {
        x.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "swagger/{documentName}/swagger.json";
        c.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
        {
            var scheme = app.Environment.IsStaging() ? "https" : httpReq.Scheme;
            swaggerDoc.Servers = new List<OpenApiServer>
                { new() { Url = $"{scheme}://{httpReq.Host.Value}{"/api"}" } };
        });
    });
    app.UseSwaggerUI();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (context, httpContext) =>
    {
        var parsedUserAgent = Parser.GetDefault()?.Parse(httpContext.Request.Headers.UserAgent);
        context.Set("Browser", parsedUserAgent?.UA.Family);
        context.Set("Device", parsedUserAgent?.Device.ToString());
        context.Set("OS", parsedUserAgent?.OS.ToString());
    };
});

app.UsePathBase("/api");
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseExceptionHandler();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetService<HiraishinContext>();
    context?.Database.Migrate();
}

app.UseHangfireDashboard();
app.MapHangfireDashboard();

RecurringJob.AddOrUpdate<LeaderboardEntryJob>(
    "leaderboard-entry-job",
    x => x.Run(null!, CancellationToken.None),
    Cron.Daily(),
    new RecurringJobOptions
    {
        TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo"),
    });

app.Run();
