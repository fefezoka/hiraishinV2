using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hiraishin.Data.Context.Migrations
{
    /// <inheritdoc />
    public partial class removeremake : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GameEndedInEarlySurrender",
                table: "Match");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "GameEndedInEarlySurrender",
                table: "Match",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
