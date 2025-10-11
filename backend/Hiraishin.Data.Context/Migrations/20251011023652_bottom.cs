using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hiraishin.Data.Context.Migrations
{
    /// <inheritdoc />
    public partial class bottom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Wins",
                table: "LeaderboardEntry",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Losses",
                table: "LeaderboardEntry",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivedOnBottom",
                table: "LeaderboardEntry",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArrivedOnBottom",
                table: "LeaderboardEntry");

            migrationBuilder.AlterColumn<int>(
                name: "Wins",
                table: "LeaderboardEntry",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "Losses",
                table: "LeaderboardEntry",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
