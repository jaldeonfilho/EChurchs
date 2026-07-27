using Echurchs.Models.Entities.Core;
using Echurchs.Models.Entities.Messaging;
using Echurchs.Models.Entities.Groups;
using Echurchs.Models.Entities.Agenda;
using Echurchs.Models.Entities.Media;
using Echurchs.Models.Entities.Financial;
using Echurchs.Models.Entities.Teaching;
using Echurchs.Models.Entities.Assets;
using Echurchs.Models.Entities.Live;
using Echurchs.Models.Entities.Donations;
using Echurchs.Models.Entities.Feed;

namespace Echurchs.Repository.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<Plan> Plans { get; }
    IGenericRepository<PlanLimit> PlanLimits { get; }
    IGenericRepository<Community> Communities { get; }
    IGenericRepository<CommunitySubscription> CommunitySubscriptions { get; }
    IGenericRepository<User> Users { get; }
    IGenericRepository<RefreshToken> RefreshTokens { get; }
    IGenericRepository<CommunityMembership> CommunityMemberships { get; }

    IGenericRepository<Friendship> Friendships { get; }
    IGenericRepository<Conversation> Conversations { get; }
    IGenericRepository<ConversationParticipant> ConversationParticipants { get; }
    IGenericRepository<Message> Messages { get; }

    IGenericRepository<GroupCategory> GroupCategories { get; }
    IGenericRepository<Group> Groups { get; }
    IGenericRepository<GroupMember> GroupMembers { get; }

    IGenericRepository<Bulletin> Bulletins { get; }
    IGenericRepository<CalendarEvent> CalendarEvents { get; }
    IGenericRepository<EventRegistration> EventRegistrations { get; }
    IGenericRepository<EventCustomField> EventCustomFields { get; }
    IGenericRepository<EventCustomFieldValue> EventCustomFieldValues { get; }

    IGenericRepository<PhotoAlbum> PhotoAlbums { get; }
    IGenericRepository<Photo> Photos { get; }
    IGenericRepository<VideoAlbum> VideoAlbums { get; }
    IGenericRepository<Video> Videos { get; }
    IGenericRepository<Document> Documents { get; }
    IGenericRepository<FormTemplate> FormTemplates { get; }
    IGenericRepository<FormField> FormFields { get; }
    IGenericRepository<FormResponse> FormResponses { get; }
    IGenericRepository<FormResponseValue> FormResponseValues { get; }

    IGenericRepository<FinancialCategory> FinancialCategories { get; }
    IGenericRepository<FinancialTransaction> FinancialTransactions { get; }
    IGenericRepository<GivingStatement> GivingStatements { get; }

    IGenericRepository<Study> Studies { get; }
    IGenericRepository<StudyAttachment> StudyAttachments { get; }
    IGenericRepository<Models.Entities.Teaching.Class> Classes { get; }
    IGenericRepository<ClassAttachment> ClassAttachments { get; }
    IGenericRepository<ClassMember> ClassMembers { get; }

    IGenericRepository<AssetCategory> AssetCategories { get; }
    IGenericRepository<Asset> Assets { get; }

    IGenericRepository<ServiceSchedule> ServiceSchedules { get; }
    IGenericRepository<LiveService> LiveServices { get; }

    IGenericRepository<Donation> Donations { get; }
    IGenericRepository<PaymentLink> PaymentLinks { get; }
    IGenericRepository<PaymentGatewayConfig> PaymentGatewayConfigs { get; }

    IGenericRepository<Post> Posts { get; }

    Task<int> SaveChangesAsync();
}
