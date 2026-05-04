using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyFitness.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddingCreatedByToChallenges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Challenges",
                type: "char(36)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_CreatedBy",
                table: "Challenges",
                column: "CreatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Challenges_Users_CreatedBy",
                table: "Challenges",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Challenges_Users_CreatedBy",
                table: "Challenges");

            migrationBuilder.DropIndex(
                name: "IX_Challenges_CreatedBy",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Challenges");
        }
    }
}
