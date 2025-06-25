using Hiraishin.Data.Context.Mapping;
using Hiraishin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hiraishin.Data.Context;
public class HiraishinContext : DbContext
{
    public HiraishinContext(DbContextOptions<HiraishinContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        Mapping.LeaderboardEntryMap.Map(modelBuilder);
    }
    public DbSet<LeaderboardEntry> LeaderboardEntry { get; set; }
}