using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Echurchs.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeBillingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BillingCycle",
                table: "Plans");

            migrationBuilder.AddColumn<decimal>(
                name: "PriceYearly",
                table: "Plans",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripePriceIdMonthly",
                table: "Plans",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripePriceIdYearly",
                table: "Plans",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeProductId",
                table: "Plans",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BillingCycle",
                table: "CommunitySubscriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "CancelAtPeriodEnd",
                table: "CommunitySubscriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "CurrentPeriodEnd",
                table: "CommunitySubscriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "CommunitySubscriptions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "CommunitySubscriptions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000001"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Cadastre até 15 pessoas", 15 });

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000003"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Cadastre até 2 grupos", 2 });

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000004"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Cadastre 2 itens no quadro de avisos", 2 });

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000008"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Até 10 Documentos personalizados", 10 });

            migrationBuilder.InsertData(
                table: "PlanLimits",
                columns: new[] { "Id", "Description", "Feature", "LimitValue", "Module", "PlanId" },
                values: new object[,]
                {
                    { new Guid("f0000001-0000-0000-0000-000000000015"), "Cadastre até 2 eventos", "MaxEvents", 2, "Eventos", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000016"), "1 culto ao vivo por vez", "MaxConcurrentLiveServices", 1, "Live", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000017"), "Até 5 fotos no total", "MaxPhotos", 5, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000018"), "Até 2 vídeos no total", "MaxVideos", 2, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000002-0000-0000-0000-000000000015"), "Cadastre até 15 eventos", "MaxEvents", 15, "Eventos", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000016"), "2 cultos ao vivo em simultâneo", "MaxConcurrentLiveServices", 2, "Live", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000017"), "Até 100 fotos no total", "MaxPhotos", 100, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000018"), "Até 30 vídeos no total", "MaxVideos", 30, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000003-0000-0000-0000-000000000015"), "Cadastre até 40 eventos", "MaxEvents", 40, "Eventos", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000016"), "3 cultos ao vivo em simultâneo", "MaxConcurrentLiveServices", 3, "Live", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000017"), "Até 300 fotos no total", "MaxPhotos", 300, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000018"), "Até 100 vídeos no total", "MaxVideos", 100, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000004-0000-0000-0000-000000000015"), "Cadastro ilimitado de eventos", "MaxEvents", -1, "Eventos", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000016"), "Cultos ao vivo em simultâneo ilimitados", "MaxConcurrentLiveServices", -1, "Live", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000017"), "Fotos ilimitadas", "MaxPhotos", -1, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000018"), "Vídeos ilimitados", "MaxVideos", -1, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") }
                });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "PriceYearly", "StripePriceIdMonthly", "StripePriceIdYearly", "StripeProductId" },
                values: new object[] { 0m, null, null, null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "PriceYearly", "StripePriceIdMonthly", "StripePriceIdYearly", "StripeProductId" },
                values: new object[] { 190m, null, null, null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "PriceYearly", "StripePriceIdMonthly", "StripePriceIdYearly", "StripeProductId" },
                values: new object[] { 390m, null, null, null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "PriceYearly", "StripePriceIdMonthly", "StripePriceIdYearly", "StripeProductId" },
                values: new object[] { 690m, null, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000002-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000002-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000002-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000002-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000003-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000003-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000003-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000003-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000004-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000004-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000004-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000004-0000-0000-0000-000000000018"));

            migrationBuilder.DropColumn(
                name: "PriceYearly",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "StripePriceIdMonthly",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "StripePriceIdYearly",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "StripeProductId",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "BillingCycle",
                table: "CommunitySubscriptions");

            migrationBuilder.DropColumn(
                name: "CancelAtPeriodEnd",
                table: "CommunitySubscriptions");

            migrationBuilder.DropColumn(
                name: "CurrentPeriodEnd",
                table: "CommunitySubscriptions");

            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "CommunitySubscriptions");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "CommunitySubscriptions");

            migrationBuilder.AddColumn<int>(
                name: "BillingCycle",
                table: "Plans",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000001"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Cadastre até 30 pessoas", 30 });

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000003"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Cadastre até 5 grupos", 5 });

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000004"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Cadastre 3 itens no quadro de avisos", 3 });

            migrationBuilder.UpdateData(
                table: "PlanLimits",
                keyColumn: "Id",
                keyValue: new Guid("f0000001-0000-0000-0000-000000000008"),
                columns: new[] { "Description", "LimitValue" },
                values: new object[] { "Até 3 Documentos personalizados", 3 });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "BillingCycle",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "BillingCycle",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "BillingCycle",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "BillingCycle",
                value: 0);
        }
    }
}
