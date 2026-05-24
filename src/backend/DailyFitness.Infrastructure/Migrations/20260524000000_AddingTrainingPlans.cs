using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyFitness.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddingTrainingPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrainingPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: false),
                    Objective = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Instructions = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: true),
                    MinimumDurationDays = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "char(36)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingPlans_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TrainingWorkouts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    TrainingPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true),
                    Instructions = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingWorkouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingWorkouts_TrainingPlans_TrainingPlanId",
                        column: x => x.TrainingPlanId,
                        principalTable: "TrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TrainingWorkoutItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    TrainingWorkoutId = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true),
                    Instructions = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: true),
                    Sets = table.Column<int>(type: "int", nullable: true),
                    Repetitions = table.Column<int>(type: "int", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingWorkoutItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingWorkoutItems_TrainingWorkouts_TrainingWorkoutId",
                        column: x => x.TrainingWorkoutId,
                        principalTable: "TrainingWorkouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserTrainingPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false),
                    TrainingPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserTrainingPlanStatus = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CancelledAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CancellationReason = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTrainingPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTrainingPlans_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTrainingPlans_TrainingPlans_TrainingPlanId",
                        column: x => x.TrainingPlanId,
                        principalTable: "TrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserTrainingProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserTrainingPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    TrainingWorkoutId = table.Column<Guid>(type: "char(36)", nullable: false),
                    TrainingWorkoutItemId = table.Column<Guid>(type: "char(36)", nullable: false),
                    ProgressDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTrainingProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTrainingProgresses_UserTrainingPlans_UserTrainingPlanId",
                        column: x => x.UserTrainingPlanId,
                        principalTable: "UserTrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTrainingProgresses_TrainingWorkouts_TrainingWorkoutId",
                        column: x => x.TrainingWorkoutId,
                        principalTable: "TrainingWorkouts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserTrainingProgresses_TrainingWorkoutItems_TrainingWorkoutItemId",
                        column: x => x.TrainingWorkoutItemId,
                        principalTable: "TrainingWorkoutItems",
                        principalColumn: "Id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserTrainingWorkoutDailyLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    UserTrainingPlanId = table.Column<Guid>(type: "char(36)", nullable: false),
                    TrainingWorkoutId = table.Column<Guid>(type: "char(36)", nullable: false),
                    ProgressDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    IsFinished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTrainingWorkoutDailyLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTrainingWorkoutDailyLogs_UserTrainingPlans_UserTrainingPlanId",
                        column: x => x.UserTrainingPlanId,
                        principalTable: "UserTrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTrainingWorkoutDailyLogs_TrainingWorkouts_TrainingWorkoutId",
                        column: x => x.TrainingWorkoutId,
                        principalTable: "TrainingWorkouts",
                        principalColumn: "Id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            // Índices TrainingPlans
            migrationBuilder.CreateIndex(name: "IX_TrainingPlans_Objective", table: "TrainingPlans", column: "Objective");
            migrationBuilder.CreateIndex(name: "IX_TrainingPlans_Level", table: "TrainingPlans", column: "Level");
            migrationBuilder.CreateIndex(name: "IX_TrainingPlans_Status", table: "TrainingPlans", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_TrainingPlans_CreatedByUserId", table: "TrainingPlans", column: "CreatedByUserId");

            // Índices TrainingWorkouts
            migrationBuilder.CreateIndex(name: "IX_TrainingWorkouts_TrainingPlanId", table: "TrainingWorkouts", column: "TrainingPlanId");
            migrationBuilder.CreateIndex(name: "IX_TrainingWorkouts_TrainingPlanId_Order", table: "TrainingWorkouts", columns: new[] { "TrainingPlanId", "Order" });

            // Índices TrainingWorkoutItems
            migrationBuilder.CreateIndex(name: "IX_TrainingWorkoutItems_TrainingWorkoutId", table: "TrainingWorkoutItems", column: "TrainingWorkoutId");
            migrationBuilder.CreateIndex(name: "IX_TrainingWorkoutItems_TrainingWorkoutId_Order", table: "TrainingWorkoutItems", columns: new[] { "TrainingWorkoutId", "Order" });

            // Índices UserTrainingPlans
            migrationBuilder.CreateIndex(name: "IX_UserTrainingPlans_UserId", table: "UserTrainingPlans", column: "UserId");
            migrationBuilder.CreateIndex(name: "IX_UserTrainingPlans_TrainingPlanId", table: "UserTrainingPlans", column: "TrainingPlanId");
            migrationBuilder.CreateIndex(name: "IX_UserTrainingPlans_UserTrainingPlanStatus", table: "UserTrainingPlans", column: "UserTrainingPlanStatus");
            migrationBuilder.CreateIndex(name: "IX_UserTrainingPlans_UserId_UserTrainingPlanStatus", table: "UserTrainingPlans", columns: new[] { "UserId", "UserTrainingPlanStatus" });

            // Índices UserTrainingProgresses
            migrationBuilder.CreateIndex(name: "IX_UserTrainingProgresses_UserTrainingPlanId", table: "UserTrainingProgresses", column: "UserTrainingPlanId");
            migrationBuilder.CreateIndex(name: "IX_UserTrainingProgresses_TrainingWorkoutId", table: "UserTrainingProgresses", column: "TrainingWorkoutId");
            // Unique: impede duplicidade de item no mesmo dia para o mesmo plano
            migrationBuilder.CreateIndex(
                name: "IX_UserTrainingProgresses_PlanItemDate",
                table: "UserTrainingProgresses",
                columns: new[] { "UserTrainingPlanId", "TrainingWorkoutItemId", "ProgressDate" },
                unique: true);

            // Índices UserTrainingWorkoutDailyLogs
            migrationBuilder.CreateIndex(name: "IX_UserTrainingWorkoutDailyLogs_UserTrainingPlanId", table: "UserTrainingWorkoutDailyLogs", column: "UserTrainingPlanId");
            migrationBuilder.CreateIndex(
                name: "IX_UserTrainingWorkoutDailyLogs_PlanWorkoutDate",
                table: "UserTrainingWorkoutDailyLogs",
                columns: new[] { "UserTrainingPlanId", "TrainingWorkoutId", "ProgressDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "UserTrainingWorkoutDailyLogs");
            migrationBuilder.DropTable(name: "UserTrainingProgresses");
            migrationBuilder.DropTable(name: "UserTrainingPlans");
            migrationBuilder.DropTable(name: "TrainingWorkoutItems");
            migrationBuilder.DropTable(name: "TrainingWorkouts");
            migrationBuilder.DropTable(name: "TrainingPlans");
        }
    }
}
