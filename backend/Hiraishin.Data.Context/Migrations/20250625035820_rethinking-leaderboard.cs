using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Hiraishin.Data.Context.Migrations
{
    /// <inheritdoc />
    public partial class rethinkingleaderboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WeeklyRanking");

            migrationBuilder.CreateTable(
                name: "LeaderboardEntry",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Puuid = table.Column<string>(type: "text", nullable: false),
                    WeekStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    QueueType = table.Column<string>(type: "text", nullable: false),
                    Tier = table.Column<string>(type: "text", nullable: false),
                    Rank = table.Column<string>(type: "text", nullable: false),
                    LeaguePoints = table.Column<int>(type: "integer", nullable: false),
                    TotalLP = table.Column<int>(type: "integer", nullable: false),
                    Index = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaderboardEntry", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeaderboardEntry_Puuid_WeekStart_QueueType",
                table: "LeaderboardEntry",
                columns: new[] { "Puuid", "WeekStart", "QueueType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeaderboardEntry");

            migrationBuilder.CreateTable(
                name: "WeeklyRanking",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Index = table.Column<int>(type: "integer", nullable: false),
                    LeaguePoints = table.Column<int>(type: "integer", nullable: false),
                    Puuid = table.Column<string>(type: "text", nullable: false),
                    QueueType = table.Column<string>(type: "text", nullable: false),
                    Rank = table.Column<string>(type: "text", nullable: false),
                    Tier = table.Column<string>(type: "text", nullable: false),
                    TotalLP = table.Column<int>(type: "integer", nullable: false),
                    WeekStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyRanking", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyRanking_Puuid_WeekStart_QueueType",
                table: "WeeklyRanking",
                columns: new[] { "Puuid", "WeekStart", "QueueType" },
                unique: true);
        }
    }
}
