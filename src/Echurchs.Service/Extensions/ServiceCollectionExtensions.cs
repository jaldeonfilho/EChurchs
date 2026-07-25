using Echurchs.Repository.Context;
using Echurchs.Repository.Implementation;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Implementation;
using Echurchs.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Echurchs.Service.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddEchurchsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<EchurchsDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ICommunityResolver, CommunityResolver>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICommunityService, CommunityService>();
        services.AddScoped<ICommunityModuleService, CommunityModuleService>();
        services.AddScoped<IFinancialService, FinancialService>();
        services.AddScoped<IMessagingService, MessagingService>();
        services.AddScoped<IStripeService, StripeService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IPlanLimitService, PlanLimitService>();

        return services;
    }
}
