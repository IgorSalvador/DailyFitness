using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyFitness.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddingProfessionalRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProfessionalRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false),
                    Biography = table.Column<string>(type: "varchar(6000)", maxLength: 6000, nullable: false),
                    Specialization = table.Column<string>(type: "longtext", nullable: false),
                    Skills = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false),
                    ProfessionalRequestStatus = table.Column<int>(type: "int", nullable: false),
                    EvaluatedOn = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    EvaluatorId = table.Column<Guid>(type: "char(36)", nullable: true),
                    EvaluationComments = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalRequests_Users_EvaluatorId",
                        column: x => x.EvaluatorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProfessionalRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalRequests_EvaluatorId",
                table: "ProfessionalRequests",
                column: "EvaluatorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalRequests_UserId",
                table: "ProfessionalRequests",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfessionalRequests");
        }
    }
}
