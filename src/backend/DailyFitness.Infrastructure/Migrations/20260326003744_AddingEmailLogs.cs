using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyFitness.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddingEmailLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Log_Emails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    EmailType = table.Column<int>(type: "int", nullable: false),
                    Subject = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Recipients = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false),
                    Body = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: false),
                    IsSuccess = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ErrorMessage = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Log_Emails", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Log_Emails");
        }
    }
}
