using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyFitness.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddingChallenges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "EvaluationComments",
                table: "ProfessionalRequests",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(2000)",
                oldMaxLength: 2000);

            migrationBuilder.CreateTable(
                name: "Challenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    ChallengeStatus = table.Column<int>(type: "int", nullable: false),
                    ExpectedEndDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Challenges", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserChallenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false),
                    ChallengeId = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserChallengeStatus = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    LeftAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DiscontinuedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CurrentProgress = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    TargetProgress = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    LastProgressUpdateAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserChallenges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserChallenges_Challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "Challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserChallenges_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserChallengeProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserChallengeId = table.Column<Guid>(type: "char(36)", nullable: false),
                    ReferenceDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ReferencePeriod = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    ProgressValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Notes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserChallengeProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserChallengeProgresses_UserChallenges_UserChallengeId",
                        column: x => x.UserChallengeId,
                        principalTable: "UserChallenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_ChallengeStatus",
                table: "Challenges",
                column: "ChallengeStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_ExpectedEndDate",
                table: "Challenges",
                column: "ExpectedEndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_Status",
                table: "Challenges",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_Type",
                table: "Challenges",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallengeProgresses_UserChallengeId",
                table: "UserChallengeProgresses",
                column: "UserChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallengeProgresses_UserChallengeId_ReferencePeriod",
                table: "UserChallengeProgresses",
                columns: new[] { "UserChallengeId", "ReferencePeriod" });

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_ChallengeId",
                table: "UserChallenges",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_UserChallengeStatus",
                table: "UserChallenges",
                column: "UserChallengeStatus");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_UserId",
                table: "UserChallenges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_UserId_ChallengeId_UserChallengeStatus",
                table: "UserChallenges",
                columns: new[] { "UserId", "ChallengeId", "UserChallengeStatus" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserChallengeProgresses");

            migrationBuilder.DropTable(
                name: "UserChallenges");

            migrationBuilder.DropTable(
                name: "Challenges");

            migrationBuilder.AlterColumn<string>(
                name: "EvaluationComments",
                table: "ProfessionalRequests",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);
        }
    }
}
