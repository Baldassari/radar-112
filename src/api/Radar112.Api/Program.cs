using Wolverine;
using Wolverine.Http;

const string DevClient = "DevClient";

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseWolverine();
builder.Services.AddWolverineHttp();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy(DevClient, policy => policy
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors(DevClient);

app.MapOpenApi();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Os endpoints do contrato (docs/api/openapi.yaml) ficam por implementar
// nesta fase — ver README do projeto.
app.MapWolverineEndpoints();

app.Run();
