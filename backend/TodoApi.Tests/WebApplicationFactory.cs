using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TodoApi.Data;

namespace TodoApi.Tests;

public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the real database
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<TodoDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Add in-memory database for testing
            services.AddDbContext<TodoDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid().ToString());
            });

            // Build the service provider
            var sp = services.BuildServiceProvider();

            // Create a scope to get a DbContext instance
            using (var scope = sp.CreateScope())
            {
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<TodoDbContext>();

                // Ensure the database is created
                db.Database.EnsureCreated();

                // Seed the database (skip logging in tests)
                try
                {
                    DataSeeder.SeedAsync(db).GetAwaiter().GetResult();
                }
                catch
                {
                    // Ignore seeding errors in tests if database already seeded
                }
            }
        });

        builder.UseEnvironment("Testing");
    }
}

