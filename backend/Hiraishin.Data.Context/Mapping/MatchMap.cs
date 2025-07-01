using Hiraishin.Domain.Dto.Hiraishin;
using Microsoft.EntityFrameworkCore;

namespace Hiraishin.Data.Context.Mapping
{
    public class MatchMap()
    {
        public static void Map(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Match>().HasKey(x => x.Id);

            modelBuilder.Entity<Match>()
                .HasOne(x => x.LeaderboardEntry)
                .WithMany(x => x.Matches)
                .HasForeignKey(x => x.LeaderboardEntryId);
        }
    }
}
