using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hiraishin.Data.Context.Migrations
{
    /// <inheritdoc />
    public partial class riotapiupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AccountId",
                table: "WeeklyRanking",
                newName: "Puuid");

            migrationBuilder.RenameIndex(
                name: "IX_WeeklyRanking_AccountId_WeekStart_QueueType",
                table: "WeeklyRanking",
                newName: "IX_WeeklyRanking_Puuid_WeekStart_QueueType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Puuid",
                table: "WeeklyRanking",
                newName: "AccountId");

            migrationBuilder.RenameIndex(
                name: "IX_WeeklyRanking_Puuid_WeekStart_QueueType",
                table: "WeeklyRanking",
                newName: "IX_WeeklyRanking_AccountId_WeekStart_QueueType");
        }
    }
}
