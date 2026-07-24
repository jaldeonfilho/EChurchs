using Echurchs.Models.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace Echurchs.Repository.Seed;

public static class PlanSeedData
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        var freePlanId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var silverPlanId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var goldPlanId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var diamondPlanId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<Plan>().HasData(
            new Plan { Id = freePlanId, Name = "Free", Price = 0, Description = "Plano gratuito para igrejas pequenas", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Plan { Id = silverPlanId, Name = "Prata", Price = 19, Description = "Plano Prata para igrejas em crescimento", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Plan { Id = goldPlanId, Name = "Ouro", Price = 39, Description = "Plano Ouro para igrejas estabelecidas", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Plan { Id = diamondPlanId, Name = "Diamante", Price = 69, Description = "Plano Diamante para grandes igrejas", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        var allLimits = BuildFreeLimits(freePlanId)
            .Concat(BuildSilverLimits(silverPlanId))
            .Concat(BuildGoldLimits(goldPlanId))
            .Concat(BuildDiamondLimits(diamondPlanId))
            .ToList();

        modelBuilder.Entity<PlanLimit>().HasData(allLimits);
    }

    private static List<PlanLimit> BuildFreeLimits(Guid planId)
    {
        return new List<PlanLimit>
        {
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000001"), PlanId = planId, Module = "Pessoas", Feature = "MaxMembers", LimitValue = 30, Description = "Cadastre até 30 pessoas" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000002"), PlanId = planId, Module = "Pessoas", Feature = "CustomFields", LimitValue = 3, Description = "3 Campos adicionais" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000003"), PlanId = planId, Module = "Grupos", Feature = "MaxGroups", LimitValue = 5, Description = "Cadastre até 5 grupos" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000004"), PlanId = planId, Module = "Agenda", Feature = "MaxBulletins", LimitValue = 3, Description = "Cadastre 3 itens no quadro de avisos" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000005"), PlanId = planId, Module = "Mídias", Feature = "MaxPhotoAlbums", LimitValue = 3, Description = "Cadastre até 3 álbuns de fotos" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000006"), PlanId = planId, Module = "Mídias", Feature = "MaxVideoAlbums", LimitValue = 3, Description = "Cadastre até 3 álbuns de vídeos" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000007"), PlanId = planId, Module = "Mídias", Feature = "MaxItemsPerAlbum", LimitValue = 20, Description = "Até 20 itens em cada álbum" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000008"), PlanId = planId, Module = "Mídias", Feature = "MaxDocuments", LimitValue = 3, Description = "Até 3 Documentos personalizados" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000009"), PlanId = planId, Module = "Mídias", Feature = "MaxForms", LimitValue = 3, Description = "Crie até 3 formulários" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000010"), PlanId = planId, Module = "Mídias", Feature = "MaxFormFields", LimitValue = 6, Description = "Crie até 6 campos personalizados em formulários" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000011"), PlanId = planId, Module = "Mídias", Feature = "StorageMB", LimitValue = 500, Description = "500MB de armazenamento" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000012"), PlanId = planId, Module = "Financeiro", Feature = "MaxTransactionsPerMonth", LimitValue = 50, Description = "Cadastre até 50 transações no mês" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000013"), PlanId = planId, Module = "Ensino", Feature = "MaxStudies", LimitValue = 10, Description = "Cadastre até 10 estudos" },
            new() { Id = Guid.Parse("f0000001-0000-0000-0000-000000000014"), PlanId = planId, Module = "Ensino", Feature = "MaxClasses", LimitValue = 2, Description = "Cadastre até 2 turmas" },
        };
    }

    private static List<PlanLimit> BuildSilverLimits(Guid planId)
    {
        return new List<PlanLimit>
        {
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000001"), PlanId = planId, Module = "Pessoas", Feature = "MaxMembers", LimitValue = 250, Description = "Cadastre até 250 pessoas" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000002"), PlanId = planId, Module = "Pessoas", Feature = "CustomFields", LimitValue = 15, Description = "15 Campos adicionais" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000003"), PlanId = planId, Module = "Grupos", Feature = "MaxGroups", LimitValue = 70, Description = "Cadastre até 70 grupos" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000004"), PlanId = planId, Module = "Agenda", Feature = "MaxBulletins", LimitValue = 10, Description = "Cadastre 10 itens no quadro de avisos" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000005"), PlanId = planId, Module = "Mídias", Feature = "MaxPhotoAlbums", LimitValue = 100, Description = "Cadastre até 100 álbuns de fotos" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000006"), PlanId = planId, Module = "Mídias", Feature = "MaxVideoAlbums", LimitValue = 100, Description = "Cadastre até 100 álbuns de vídeos" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000007"), PlanId = planId, Module = "Mídias", Feature = "MaxItemsPerAlbum", LimitValue = 200, Description = "Até 200 itens em cada álbum" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000008"), PlanId = planId, Module = "Mídias", Feature = "MaxDocuments", LimitValue = 20, Description = "Até 20 Documentos personalizados" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000009"), PlanId = planId, Module = "Mídias", Feature = "MaxForms", LimitValue = 10, Description = "Crie até 10 formulários" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000010"), PlanId = planId, Module = "Mídias", Feature = "MaxFormFields", LimitValue = 50, Description = "Crie até 50 campos personalizados em formulários" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000011"), PlanId = planId, Module = "Mídias", Feature = "StorageMB", LimitValue = 5120, Description = "5GB de armazenamento" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000012"), PlanId = planId, Module = "Financeiro", Feature = "MaxTransactionsPerMonth", LimitValue = -1, Description = "Cadastro ilimitado de transações no mês" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000013"), PlanId = planId, Module = "Ensino", Feature = "MaxStudies", LimitValue = 50, Description = "Cadastre até 50 estudos" },
            new() { Id = Guid.Parse("f0000002-0000-0000-0000-000000000014"), PlanId = planId, Module = "Ensino", Feature = "MaxClasses", LimitValue = 30, Description = "Cadastre até 30 turmas" },
        };
    }

    private static List<PlanLimit> BuildGoldLimits(Guid planId)
    {
        return new List<PlanLimit>
        {
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000001"), PlanId = planId, Module = "Pessoas", Feature = "MaxMembers", LimitValue = 500, Description = "Cadastre até 500 pessoas" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000002"), PlanId = planId, Module = "Pessoas", Feature = "CustomFields", LimitValue = 20, Description = "20 Campos adicionais" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000003"), PlanId = planId, Module = "Grupos", Feature = "MaxGroups", LimitValue = 100, Description = "Cadastre até 100 grupos" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000004"), PlanId = planId, Module = "Agenda", Feature = "MaxBulletins", LimitValue = 10, Description = "Cadastre 10 itens no quadro de avisos" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000005"), PlanId = planId, Module = "Mídias", Feature = "MaxPhotoAlbums", LimitValue = 500, Description = "Cadastre até 500 álbuns de fotos" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000006"), PlanId = planId, Module = "Mídias", Feature = "MaxVideoAlbums", LimitValue = 500, Description = "Cadastre até 500 álbuns de vídeos" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000007"), PlanId = planId, Module = "Mídias", Feature = "MaxItemsPerAlbum", LimitValue = -1, Description = "Cadastro ilimitado de itens em cada álbum" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000008"), PlanId = planId, Module = "Mídias", Feature = "MaxDocuments", LimitValue = 50, Description = "Até 50 Documentos personalizados" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000009"), PlanId = planId, Module = "Mídias", Feature = "MaxForms", LimitValue = 20, Description = "Crie até 20 formulários" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000010"), PlanId = planId, Module = "Mídias", Feature = "MaxFormFields", LimitValue = -1, Description = "Campos personalizados ilimitado em formulários" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000011"), PlanId = planId, Module = "Mídias", Feature = "StorageMB", LimitValue = 5120, Description = "5GB de armazenamento" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000012"), PlanId = planId, Module = "Financeiro", Feature = "MaxTransactionsPerMonth", LimitValue = -1, Description = "Cadastro ilimitado de transações no mês" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000013"), PlanId = planId, Module = "Ensino", Feature = "MaxStudies", LimitValue = -1, Description = "Cadastro ilimitado de estudos" },
            new() { Id = Guid.Parse("f0000003-0000-0000-0000-000000000014"), PlanId = planId, Module = "Ensino", Feature = "MaxClasses", LimitValue = 50, Description = "Cadastre até 50 turmas" },
        };
    }

    private static List<PlanLimit> BuildDiamondLimits(Guid planId)
    {
        return new List<PlanLimit>
        {
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000001"), PlanId = planId, Module = "Pessoas", Feature = "MaxMembers", LimitValue = 1000, Description = "Cadastre até 1000 pessoas" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000002"), PlanId = planId, Module = "Pessoas", Feature = "CustomFields", LimitValue = 30, Description = "30 Campos adicionais" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000003"), PlanId = planId, Module = "Grupos", Feature = "MaxGroups", LimitValue = -1, Description = "Cadastro ilimitado de grupos" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000004"), PlanId = planId, Module = "Agenda", Feature = "MaxBulletins", LimitValue = 10, Description = "Cadastre 10 itens no quadro de avisos" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000005"), PlanId = planId, Module = "Mídias", Feature = "MaxPhotoAlbums", LimitValue = -1, Description = "Cadastro ilimitado de álbuns de fotos" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000006"), PlanId = planId, Module = "Mídias", Feature = "MaxVideoAlbums", LimitValue = -1, Description = "Cadastro ilimitado de álbuns de vídeos" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000007"), PlanId = planId, Module = "Mídias", Feature = "MaxItemsPerAlbum", LimitValue = -1, Description = "Cadastro ilimitado de itens em cada álbum" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000008"), PlanId = planId, Module = "Mídias", Feature = "MaxDocuments", LimitValue = -1, Description = "Documentos personalizados ilimitado" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000009"), PlanId = planId, Module = "Mídias", Feature = "MaxForms", LimitValue = 50, Description = "Crie até 50 formulários" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000010"), PlanId = planId, Module = "Mídias", Feature = "MaxFormFields", LimitValue = -1, Description = "Campos personalizados ilimitado em formulários" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000011"), PlanId = planId, Module = "Mídias", Feature = "StorageMB", LimitValue = 10240, Description = "10GB de armazenamento" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000012"), PlanId = planId, Module = "Financeiro", Feature = "MaxTransactionsPerMonth", LimitValue = -1, Description = "Cadastro ilimitado de transações no mês" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000013"), PlanId = planId, Module = "Ensino", Feature = "MaxStudies", LimitValue = -1, Description = "Cadastro ilimitado de estudos" },
            new() { Id = Guid.Parse("f0000004-0000-0000-0000-000000000014"), PlanId = planId, Module = "Ensino", Feature = "MaxClasses", LimitValue = -1, Description = "Cadastro ilimitado de turmas" },
        };
    }
}
