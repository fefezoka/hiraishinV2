using Hiraishin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hiraishin.Data.Context.Mapping
{
    public class LeaderboardEntryMap()
    {
        public static void Map(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LeaderboardEntry>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<LeaderboardEntry>()
                .HasIndex(r => new { r.Puuid, r.Day, r.QueueType })
                .IsUnique();

            modelBuilder.Entity<LeaderboardEntry>()
                .HasMany(x => x.Matches)
                .WithOne(x => x.LeaderboardEntry)
                .HasForeignKey(x => x.LeaderboardEntryId);
        }
    }
}
