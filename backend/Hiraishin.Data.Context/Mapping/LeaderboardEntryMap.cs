using Hiraishin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hiraishin.Data.Context.Mapping
{
    public class LeaderboardEntryMap()
    {
        public static void Map(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LeaderboardEntry>()
                .HasIndex(r => new { r.Puuid, r.WeekStart, r.QueueType })
                .IsUnique();
        }
    }
}
