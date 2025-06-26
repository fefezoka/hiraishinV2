using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hiraishin.Data.Context.Migrations
{
    /// <inheritdoc />
    public partial class leaderboardarrivedontop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivedOnTop",
                table: "LeaderboardEntry",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArrivedOnTop",
                table: "LeaderboardEntry");
        }
    }
}
