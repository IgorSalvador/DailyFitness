using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyFitness.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddingDietPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DietPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: false),
                    Objective = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Instructions = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true),
                    MinimumDurationDays = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "char(36)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietPlans_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DietMeals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    DietPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false),
                    Period = table.Column<int>(type: "int", nullable: false),
                    Instructions = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietMeals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietMeals_DietPlans_DietPlanId",
                        column: x => x.DietPlanId,
                        principalTable: "DietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserDietPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false),
                    DietPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserDietPlanStatus = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CancelledAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CancellationReason = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDietPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDietPlans_DietPlans_DietPlanId",
                        column: x => x.DietPlanId,
                        principalTable: "DietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserDietPlans_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DietMealItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    DietMealId = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false),
                    Instructions = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(10,3)", precision: 10, scale: 3, nullable: false),
                    Unit = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false),
                    Calories = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Protein = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Carbohydrates = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Fat = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietMealItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietMealItems_DietMeals_DietMealId",
                        column: x => x.DietMealId,
                        principalTable: "DietMeals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserDietMealDailyLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserDietPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    DietMealId = table.Column<Guid>(type: "char(36)", nullable: false),
                    LogDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalItems = table.Column<int>(type: "int", nullable: false),
                    CompletedItems = table.Column<int>(type: "int", nullable: false),
                    CompletionPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDietMealDailyLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDietMealDailyLogs_DietMeals_DietMealId",
                        column: x => x.DietMealId,
                        principalTable: "DietMeals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserDietMealDailyLogs_UserDietPlans_UserDietPlanId",
                        column: x => x.UserDietPlanId,
                        principalTable: "UserDietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserDietProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserDietPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    DietMealId = table.Column<Guid>(type: "char(36)", nullable: false),
                    DietMealItemId = table.Column<Guid>(type: "char(36)", nullable: false),
                    ProgressDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDietProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDietProgresses_DietMealItems_DietMealItemId",
                        column: x => x.DietMealItemId,
                        principalTable: "DietMealItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserDietProgresses_DietMeals_DietMealId",
                        column: x => x.DietMealId,
                        principalTable: "DietMeals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserDietProgresses_UserDietPlans_UserDietPlanId",
                        column: x => x.UserDietPlanId,
                        principalTable: "UserDietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_DietMealItems_DietMealId",
                table: "DietMealItems",
                column: "DietMealId");

            migrationBuilder.CreateIndex(
                name: "IX_DietMeals_DietPlanId",
                table: "DietMeals",
                column: "DietPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_DietMeals_Period",
                table: "DietMeals",
                column: "Period");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_CreatedByUserId",
                table: "DietPlans",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_Level",
                table: "DietPlans",
                column: "Level");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_Objective",
                table: "DietPlans",
                column: "Objective");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_Status",
                table: "DietPlans",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietMealDailyLogs_DietMealId",
                table: "UserDietMealDailyLogs",
                column: "DietMealId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietMealDailyLogs_UserDietPlanId_DietMealId_LogDate",
                table: "UserDietMealDailyLogs",
                columns: new[] { "UserDietPlanId", "DietMealId", "LogDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDietPlans_DietPlanId",
                table: "UserDietPlans",
                column: "DietPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietPlans_UserDietPlanStatus",
                table: "UserDietPlans",
                column: "UserDietPlanStatus");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietPlans_UserId",
                table: "UserDietPlans",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietProgresses_DietMealId",
                table: "UserDietProgresses",
                column: "DietMealId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietProgresses_DietMealItemId",
                table: "UserDietProgresses",
                column: "DietMealItemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietProgresses_UserDietPlanId_DietMealItemId_ProgressDate",
                table: "UserDietProgresses",
                columns: new[] { "UserDietPlanId", "DietMealItemId", "ProgressDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserDietMealDailyLogs");

            migrationBuilder.DropTable(
                name: "UserDietProgresses");

            migrationBuilder.DropTable(
                name: "DietMealItems");

            migrationBuilder.DropTable(
                name: "UserDietPlans");

            migrationBuilder.DropTable(
                name: "DietMeals");

            migrationBuilder.DropTable(
                name: "DietPlans");
        }
    }
}
