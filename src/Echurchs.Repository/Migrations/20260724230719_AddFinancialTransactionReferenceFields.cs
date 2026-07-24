using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Echurchs.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialTransactionReferenceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "FinancialTransactions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExpenseCategory",
                table: "FinancialTransactions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "FinancialTransactions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ReferenceMonth",
                table: "FinancialTransactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReferenceYear",
                table: "FinancialTransactions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "FinancialTransactions");

            migrationBuilder.DropColumn(
                name: "ExpenseCategory",
                table: "FinancialTransactions");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "FinancialTransactions");

            migrationBuilder.DropColumn(
                name: "ReferenceMonth",
                table: "FinancialTransactions");

            migrationBuilder.DropColumn(
                name: "ReferenceYear",
                table: "FinancialTransactions");
        }
    }
}
