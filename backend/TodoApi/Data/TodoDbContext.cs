using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Data;

public class TodoDbContext : DbContext
{
    public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options)
    {
    }

    public DbSet<Organization> Organizations { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<TodoState> TodoStates { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Models.Task> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Organization configuration
        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.IsDeleted);
            entity.HasIndex(e => e.IsActive);

            // Self-referential relationship for DeletedBy
            entity.HasOne(e => e.DeletedBy)
                  .WithMany()
                  .HasForeignKey(e => e.DeletedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Role configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Preferences).HasColumnType("TEXT"); // JSON stored as TEXT in SQLite
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.RoleId);
            entity.HasIndex(e => e.IsDeleted);
            entity.HasIndex(e => e.IsActive);

            // Relationships
            entity.HasOne(e => e.Organization)
                  .WithMany(o => o.Users)
                  .HasForeignKey(e => e.OrganizationId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(e => e.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DeletedBy)
                  .WithMany()
                  .HasForeignKey(e => e.DeletedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // TodoState configuration
        modelBuilder.Entity<TodoState>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(7);
            entity.Property(e => e.Icon).HasMaxLength(50);
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.Order);
            entity.HasIndex(e => e.IsDeleted);
            entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();

            // Relationships
            entity.HasOne(e => e.Organization)
                  .WithMany(o => o.TodoStates)
                  .HasForeignKey(e => e.OrganizationId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DeletedBy)
                  .WithMany()
                  .HasForeignKey(e => e.DeletedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Project configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.CreatedById);
            entity.HasIndex(e => e.IsDeleted);
            entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();

            // Relationships
            entity.HasOne(e => e.Organization)
                  .WithMany()
                  .HasForeignKey(e => e.OrganizationId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedBy)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedById)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.UpdatedBy)
                  .WithMany()
                  .HasForeignKey(e => e.UpdatedById)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DeletedBy)
                  .WithMany()
                  .HasForeignKey(e => e.DeletedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Task configuration
        modelBuilder.Entity<Models.Task>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.HasIndex(e => e.TodoStateId);
            entity.HasIndex(e => e.CreatedById);
            entity.HasIndex(e => e.AssignedToId);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.ParentTaskId);
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Order);
            entity.HasIndex(e => e.IsDeleted);
            entity.HasIndex(e => new { e.OrganizationId, e.TodoStateId });
            entity.HasIndex(e => new { e.OrganizationId, e.IsDeleted });
            entity.HasIndex(e => new { e.OrganizationId, e.ProjectId });

            // Relationships
            entity.HasOne(e => e.TodoState)
                  .WithMany(s => s.Tasks)
                  .HasForeignKey(e => e.TodoStateId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedBy)
                  .WithMany(u => u.CreatedTasks)
                  .HasForeignKey(e => e.CreatedById)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.AssignedTo)
                  .WithMany(u => u.AssignedTasks)
                  .HasForeignKey(e => e.AssignedToId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.UpdatedBy)
                  .WithMany()
                  .HasForeignKey(e => e.UpdatedById)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DeletedBy)
                  .WithMany()
                  .HasForeignKey(e => e.DeletedById)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Organization)
                  .WithMany(o => o.Tasks)
                  .HasForeignKey(e => e.OrganizationId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Project)
                  .WithMany(p => p.Tasks)
                  .HasForeignKey(e => e.ProjectId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ParentTask)
                  .WithMany(t => t.Subtasks)
                  .HasForeignKey(e => e.ParentTaskId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

