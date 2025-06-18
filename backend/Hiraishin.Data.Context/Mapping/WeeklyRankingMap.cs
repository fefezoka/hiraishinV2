using Hiraishin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hiraishin.Data.Context.Mapping
{
    public class WeeklyRankingMap()
    {
        public static void Map(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<WeeklyRanking>()
                .HasIndex(r => new { r.AccountId, r.WeekStart, r.QueueType })
                .IsUnique();
        }
    }
}
