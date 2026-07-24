using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Echurchs.Repository.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BillingCycle = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanLimits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Module = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Feature = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LimitValue = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanLimits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanLimits_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Communities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nipc = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Communities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Communities_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Friendships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequesterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddresseeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friendships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Friendships_Users_AddresseeId",
                        column: x => x.AddresseeId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Friendships_Users_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AssetCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetCategories_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Bulletins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    PublishDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bulletins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bulletins_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Bulletins_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CalendarEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MaxAttendees = table.Column<int>(type: "int", nullable: false),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CalendarEvents_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CalendarEvents_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Classes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TeacherId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Classes_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Classes_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CommunityMemberships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommunityMemberships_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CommunityMemberships_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CommunitySubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunitySubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommunitySubscriptions_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CommunitySubscriptions_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsGroup = table.Column<bool>(type: "bit", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Conversations_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Documents_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Donations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonorName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    DonorEmail = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExternalPaymentId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Donations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Donations_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Donations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FinancialCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialCategories_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormTemplates_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GivingStatements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    TotalTithes = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalOfferings = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalDonations = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DocumentUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GivingStatements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GivingStatements_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GivingStatements_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GroupCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupCategories_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PaymentGatewayConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Provider = table.Column<int>(type: "int", nullable: false),
                    PublicKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EncryptedSecretKey = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentGatewayConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentGatewayConfigs_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PaymentLinks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ExternalUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentLinks_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PhotoAlbums",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhotoAlbums", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhotoAlbums_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ServiceSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    Time = table.Column<TimeSpan>(type: "time", nullable: false),
                    Frequency = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceSchedules_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Studies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Studies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Studies_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Studies_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "VideoAlbums",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoAlbums", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoAlbums_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Assets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PurchaseValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CurrentValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assets_AssetCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "AssetCategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Assets_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EventCustomFields",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FieldType = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventCustomFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventCustomFields_CalendarEvents_EventId",
                        column: x => x.EventId,
                        principalTable: "CalendarEvents",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EventRegistrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventRegistrations_CalendarEvents_EventId",
                        column: x => x.EventId,
                        principalTable: "CalendarEvents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EventRegistrations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ClassAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassAttachments_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ClassMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassMembers_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClassMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ConversationParticipants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LeftAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConversationParticipants_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ConversationParticipants_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Messages_Users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FinancialTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    PaymentMethod = table.Column<int>(type: "int", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_FinancialCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "FinancialCategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormFields",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FieldType = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormFields_FormTemplates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormResponses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormResponses_FormTemplates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FormResponses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeaderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MaxMembers = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Groups_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Groups_GroupCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "GroupCategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Groups_Users_LeaderId",
                        column: x => x.LeaderId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Photos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlbumId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Caption = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Photos_PhotoAlbums_AlbumId",
                        column: x => x.AlbumId,
                        principalTable: "PhotoAlbums",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LiveServices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StreamUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ZoomMeetingId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ZoomMeetingPassword = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ZoomJoinUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RecordingUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiveServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiveServices_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Communities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LiveServices_ServiceSchedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "ServiceSchedules",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LiveServices_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "StudyAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudyAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudyAttachments_Studies_StudyId",
                        column: x => x.StudyId,
                        principalTable: "Studies",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Videos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlbumId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Duration = table.Column<TimeSpan>(type: "time", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Videos_VideoAlbums_AlbumId",
                        column: x => x.AlbumId,
                        principalTable: "VideoAlbums",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EventCustomFieldValues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegistrationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomFieldId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventCustomFieldValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventCustomFieldValues_EventCustomFields_CustomFieldId",
                        column: x => x.CustomFieldId,
                        principalTable: "EventCustomFields",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EventCustomFieldValues_EventRegistrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "EventRegistrations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormResponseValues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResponseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormFieldId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormResponseValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormResponseValues_FormFields_FormFieldId",
                        column: x => x.FormFieldId,
                        principalTable: "FormFields",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FormResponseValues_FormResponses_ResponseId",
                        column: x => x.ResponseId,
                        principalTable: "FormResponses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GroupMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMembers_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GroupMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Plans",
                columns: new[] { "Id", "BillingCycle", "CreatedAt", "Description", "IsActive", "Name", "Price" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Plano gratuito para igrejas pequenas", true, "Free", 0m },
                    { new Guid("22222222-2222-2222-2222-222222222222"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Plano Prata para igrejas em crescimento", true, "Prata", 19m },
                    { new Guid("33333333-3333-3333-3333-333333333333"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Plano Ouro para igrejas estabelecidas", true, "Ouro", 39m },
                    { new Guid("44444444-4444-4444-4444-444444444444"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Plano Diamante para grandes igrejas", true, "Diamante", 69m }
                });

            migrationBuilder.InsertData(
                table: "PlanLimits",
                columns: new[] { "Id", "Description", "Feature", "LimitValue", "Module", "PlanId" },
                values: new object[,]
                {
                    { new Guid("f0000001-0000-0000-0000-000000000001"), "Cadastre até 30 pessoas", "MaxMembers", 30, "Pessoas", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000002"), "3 Campos adicionais", "CustomFields", 3, "Pessoas", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000003"), "Cadastre até 5 grupos", "MaxGroups", 5, "Grupos", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000004"), "Cadastre 3 itens no quadro de avisos", "MaxBulletins", 3, "Agenda", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000005"), "Cadastre até 3 álbuns de fotos", "MaxPhotoAlbums", 3, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000006"), "Cadastre até 3 álbuns de vídeos", "MaxVideoAlbums", 3, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000007"), "Até 20 itens em cada álbum", "MaxItemsPerAlbum", 20, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000008"), "Até 3 Documentos personalizados", "MaxDocuments", 3, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000009"), "Crie até 3 formulários", "MaxForms", 3, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000010"), "Crie até 6 campos personalizados em formulários", "MaxFormFields", 6, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000011"), "500MB de armazenamento", "StorageMB", 500, "Mídias", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000012"), "Cadastre até 50 transações no mês", "MaxTransactionsPerMonth", 50, "Financeiro", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000013"), "Cadastre até 10 estudos", "MaxStudies", 10, "Ensino", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000001-0000-0000-0000-000000000014"), "Cadastre até 2 turmas", "MaxClasses", 2, "Ensino", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f0000002-0000-0000-0000-000000000001"), "Cadastre até 250 pessoas", "MaxMembers", 250, "Pessoas", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000002"), "15 Campos adicionais", "CustomFields", 15, "Pessoas", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000003"), "Cadastre até 70 grupos", "MaxGroups", 70, "Grupos", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000004"), "Cadastre 10 itens no quadro de avisos", "MaxBulletins", 10, "Agenda", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000005"), "Cadastre até 100 álbuns de fotos", "MaxPhotoAlbums", 100, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000006"), "Cadastre até 100 álbuns de vídeos", "MaxVideoAlbums", 100, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000007"), "Até 200 itens em cada álbum", "MaxItemsPerAlbum", 200, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000008"), "Até 20 Documentos personalizados", "MaxDocuments", 20, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000009"), "Crie até 10 formulários", "MaxForms", 10, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000010"), "Crie até 50 campos personalizados em formulários", "MaxFormFields", 50, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000011"), "5GB de armazenamento", "StorageMB", 5120, "Mídias", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000012"), "Cadastro ilimitado de transações no mês", "MaxTransactionsPerMonth", -1, "Financeiro", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000013"), "Cadastre até 50 estudos", "MaxStudies", 50, "Ensino", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000002-0000-0000-0000-000000000014"), "Cadastre até 30 turmas", "MaxClasses", 30, "Ensino", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("f0000003-0000-0000-0000-000000000001"), "Cadastre até 500 pessoas", "MaxMembers", 500, "Pessoas", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000002"), "20 Campos adicionais", "CustomFields", 20, "Pessoas", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000003"), "Cadastre até 100 grupos", "MaxGroups", 100, "Grupos", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000004"), "Cadastre 10 itens no quadro de avisos", "MaxBulletins", 10, "Agenda", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000005"), "Cadastre até 500 álbuns de fotos", "MaxPhotoAlbums", 500, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000006"), "Cadastre até 500 álbuns de vídeos", "MaxVideoAlbums", 500, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000007"), "Cadastro ilimitado de itens em cada álbum", "MaxItemsPerAlbum", -1, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000008"), "Até 50 Documentos personalizados", "MaxDocuments", 50, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000009"), "Crie até 20 formulários", "MaxForms", 20, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000010"), "Campos personalizados ilimitado em formulários", "MaxFormFields", -1, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000011"), "5GB de armazenamento", "StorageMB", 5120, "Mídias", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000012"), "Cadastro ilimitado de transações no mês", "MaxTransactionsPerMonth", -1, "Financeiro", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000013"), "Cadastro ilimitado de estudos", "MaxStudies", -1, "Ensino", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000003-0000-0000-0000-000000000014"), "Cadastre até 50 turmas", "MaxClasses", 50, "Ensino", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("f0000004-0000-0000-0000-000000000001"), "Cadastre até 1000 pessoas", "MaxMembers", 1000, "Pessoas", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000002"), "30 Campos adicionais", "CustomFields", 30, "Pessoas", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000003"), "Cadastro ilimitado de grupos", "MaxGroups", -1, "Grupos", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000004"), "Cadastre 10 itens no quadro de avisos", "MaxBulletins", 10, "Agenda", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000005"), "Cadastro ilimitado de álbuns de fotos", "MaxPhotoAlbums", -1, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000006"), "Cadastro ilimitado de álbuns de vídeos", "MaxVideoAlbums", -1, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000007"), "Cadastro ilimitado de itens em cada álbum", "MaxItemsPerAlbum", -1, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000008"), "Documentos personalizados ilimitado", "MaxDocuments", -1, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000009"), "Crie até 50 formulários", "MaxForms", 50, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000010"), "Campos personalizados ilimitado em formulários", "MaxFormFields", -1, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000011"), "10GB de armazenamento", "StorageMB", 10240, "Mídias", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000012"), "Cadastro ilimitado de transações no mês", "MaxTransactionsPerMonth", -1, "Financeiro", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000013"), "Cadastro ilimitado de estudos", "MaxStudies", -1, "Ensino", new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("f0000004-0000-0000-0000-000000000014"), "Cadastro ilimitado de turmas", "MaxClasses", -1, "Ensino", new Guid("44444444-4444-4444-4444-444444444444") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssetCategories_CommunityId",
                table: "AssetCategories",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_CategoryId",
                table: "Assets",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_CommunityId",
                table: "Assets",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Bulletins_AuthorId",
                table: "Bulletins",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Bulletins_CommunityId",
                table: "Bulletins",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_CommunityId",
                table: "CalendarEvents",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_CreatedBy",
                table: "CalendarEvents",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ClassAttachments_ClassId",
                table: "ClassAttachments",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_CommunityId",
                table: "Classes",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_TeacherId",
                table: "Classes",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassMembers_ClassId_UserId",
                table: "ClassMembers",
                columns: new[] { "ClassId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassMembers_UserId",
                table: "ClassMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Communities_CreatedBy",
                table: "Communities",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Communities_Slug",
                table: "Communities",
                column: "Slug",
                unique: true,
                filter: "[Slug] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityMemberships_CommunityId",
                table: "CommunityMemberships",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityMemberships_UserId",
                table: "CommunityMemberships",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunitySubscriptions_CommunityId",
                table: "CommunitySubscriptions",
                column: "CommunityId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CommunitySubscriptions_PlanId",
                table: "CommunitySubscriptions",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_ConversationId",
                table: "ConversationParticipants",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_UserId",
                table: "ConversationParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_CommunityId",
                table: "Conversations",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CommunityId",
                table: "Documents",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CreatedBy",
                table: "Documents",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CommunityId",
                table: "Donations",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_UserId",
                table: "Donations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EventCustomFields_EventId",
                table: "EventCustomFields",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventCustomFieldValues_CustomFieldId",
                table: "EventCustomFieldValues",
                column: "CustomFieldId");

            migrationBuilder.CreateIndex(
                name: "IX_EventCustomFieldValues_RegistrationId",
                table: "EventCustomFieldValues",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistrations_EventId_UserId",
                table: "EventRegistrations",
                columns: new[] { "EventId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistrations_UserId",
                table: "EventRegistrations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialCategories_CommunityId",
                table: "FinancialCategories",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_CategoryId",
                table: "FinancialTransactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_CommunityId",
                table: "FinancialTransactions",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_CreatedBy",
                table: "FinancialTransactions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_UserId",
                table: "FinancialTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FormFields_FormTemplateId",
                table: "FormFields",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_FormTemplateId",
                table: "FormResponses",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_UserId",
                table: "FormResponses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponseValues_FormFieldId",
                table: "FormResponseValues",
                column: "FormFieldId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponseValues_ResponseId",
                table: "FormResponseValues",
                column: "ResponseId");

            migrationBuilder.CreateIndex(
                name: "IX_FormTemplates_CommunityId",
                table: "FormTemplates",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_AddresseeId",
                table: "Friendships",
                column: "AddresseeId");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_RequesterId",
                table: "Friendships",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_GivingStatements_CommunityId",
                table: "GivingStatements",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_GivingStatements_UserId",
                table: "GivingStatements",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupCategories_CommunityId",
                table: "GroupCategories",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_GroupId_UserId",
                table: "GroupMembers",
                columns: new[] { "GroupId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_UserId",
                table: "GroupMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_CategoryId",
                table: "Groups",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_CommunityId",
                table: "Groups",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_LeaderId",
                table: "Groups",
                column: "LeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_LiveServices_CommunityId",
                table: "LiveServices",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_LiveServices_CreatedBy",
                table: "LiveServices",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LiveServices_ScheduleId",
                table: "LiveServices",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId",
                table: "Messages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderId",
                table: "Messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentGatewayConfigs_CommunityId",
                table: "PaymentGatewayConfigs",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentLinks_CommunityId",
                table: "PaymentLinks",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoAlbums_CommunityId",
                table: "PhotoAlbums",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_AlbumId",
                table: "Photos",
                column: "AlbumId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanLimits_PlanId",
                table: "PlanLimits",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_CommunityId",
                table: "ServiceSchedules",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Studies_AuthorId",
                table: "Studies",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Studies_CommunityId",
                table: "Studies",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyAttachments_StudyId",
                table: "StudyAttachments",
                column: "StudyId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VideoAlbums_CommunityId",
                table: "VideoAlbums",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_AlbumId",
                table: "Videos",
                column: "AlbumId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Assets");

            migrationBuilder.DropTable(
                name: "Bulletins");

            migrationBuilder.DropTable(
                name: "ClassAttachments");

            migrationBuilder.DropTable(
                name: "ClassMembers");

            migrationBuilder.DropTable(
                name: "CommunityMemberships");

            migrationBuilder.DropTable(
                name: "CommunitySubscriptions");

            migrationBuilder.DropTable(
                name: "ConversationParticipants");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Donations");

            migrationBuilder.DropTable(
                name: "EventCustomFieldValues");

            migrationBuilder.DropTable(
                name: "FinancialTransactions");

            migrationBuilder.DropTable(
                name: "FormResponseValues");

            migrationBuilder.DropTable(
                name: "Friendships");

            migrationBuilder.DropTable(
                name: "GivingStatements");

            migrationBuilder.DropTable(
                name: "GroupMembers");

            migrationBuilder.DropTable(
                name: "LiveServices");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "PaymentGatewayConfigs");

            migrationBuilder.DropTable(
                name: "PaymentLinks");

            migrationBuilder.DropTable(
                name: "Photos");

            migrationBuilder.DropTable(
                name: "PlanLimits");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "StudyAttachments");

            migrationBuilder.DropTable(
                name: "Videos");

            migrationBuilder.DropTable(
                name: "AssetCategories");

            migrationBuilder.DropTable(
                name: "Classes");

            migrationBuilder.DropTable(
                name: "EventCustomFields");

            migrationBuilder.DropTable(
                name: "EventRegistrations");

            migrationBuilder.DropTable(
                name: "FinancialCategories");

            migrationBuilder.DropTable(
                name: "FormFields");

            migrationBuilder.DropTable(
                name: "FormResponses");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "ServiceSchedules");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "PhotoAlbums");

            migrationBuilder.DropTable(
                name: "Plans");

            migrationBuilder.DropTable(
                name: "Studies");

            migrationBuilder.DropTable(
                name: "VideoAlbums");

            migrationBuilder.DropTable(
                name: "CalendarEvents");

            migrationBuilder.DropTable(
                name: "FormTemplates");

            migrationBuilder.DropTable(
                name: "GroupCategories");

            migrationBuilder.DropTable(
                name: "Communities");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
