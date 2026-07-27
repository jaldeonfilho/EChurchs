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
using Echurchs.Repository.Context;
using Echurchs.Repository.Interfaces;

namespace Echurchs.Repository.Implementation;

public class UnitOfWork : IUnitOfWork
{
    private readonly EchurchsDbContext _context;

    private IGenericRepository<Plan>? _plans;
    private IGenericRepository<PlanLimit>? _planLimits;
    private IGenericRepository<Community>? _communities;
    private IGenericRepository<CommunitySubscription>? _communitySubscriptions;
    private IGenericRepository<User>? _users;
    private IGenericRepository<RefreshToken>? _refreshTokens;
    private IGenericRepository<CommunityMembership>? _communityMemberships;
    private IGenericRepository<Friendship>? _friendships;
    private IGenericRepository<Conversation>? _conversations;
    private IGenericRepository<ConversationParticipant>? _conversationParticipants;
    private IGenericRepository<Message>? _messages;
    private IGenericRepository<GroupCategory>? _groupCategories;
    private IGenericRepository<Group>? _groups;
    private IGenericRepository<GroupMember>? _groupMembers;
    private IGenericRepository<Bulletin>? _bulletins;
    private IGenericRepository<CalendarEvent>? _calendarEvents;
    private IGenericRepository<EventRegistration>? _eventRegistrations;
    private IGenericRepository<EventCustomField>? _eventCustomFields;
    private IGenericRepository<EventCustomFieldValue>? _eventCustomFieldValues;
    private IGenericRepository<PhotoAlbum>? _photoAlbums;
    private IGenericRepository<Photo>? _photos;
    private IGenericRepository<VideoAlbum>? _videoAlbums;
    private IGenericRepository<Video>? _videos;
    private IGenericRepository<Document>? _documents;
    private IGenericRepository<FormTemplate>? _formTemplates;
    private IGenericRepository<FormField>? _formFields;
    private IGenericRepository<FormResponse>? _formResponses;
    private IGenericRepository<FormResponseValue>? _formResponseValues;
    private IGenericRepository<FinancialCategory>? _financialCategories;
    private IGenericRepository<FinancialTransaction>? _financialTransactions;
    private IGenericRepository<GivingStatement>? _givingStatements;
    private IGenericRepository<Study>? _studies;
    private IGenericRepository<StudyAttachment>? _studyAttachments;
    private IGenericRepository<Models.Entities.Teaching.Class>? _classes;
    private IGenericRepository<ClassAttachment>? _classAttachments;
    private IGenericRepository<ClassMember>? _classMembers;
    private IGenericRepository<AssetCategory>? _assetCategories;
    private IGenericRepository<Asset>? _assets;
    private IGenericRepository<ServiceSchedule>? _serviceSchedules;
    private IGenericRepository<LiveService>? _liveServices;
    private IGenericRepository<Donation>? _donations;
    private IGenericRepository<PaymentLink>? _paymentLinks;
    private IGenericRepository<PaymentGatewayConfig>? _paymentGatewayConfigs;
    private IGenericRepository<Post>? _posts;

    public UnitOfWork(EchurchsDbContext context)
    {
        _context = context;
    }

    public IGenericRepository<Plan> Plans => _plans ??= new GenericRepository<Plan>(_context);
    public IGenericRepository<PlanLimit> PlanLimits => _planLimits ??= new GenericRepository<PlanLimit>(_context);
    public IGenericRepository<Community> Communities => _communities ??= new GenericRepository<Community>(_context);
    public IGenericRepository<CommunitySubscription> CommunitySubscriptions => _communitySubscriptions ??= new GenericRepository<CommunitySubscription>(_context);
    public IGenericRepository<User> Users => _users ??= new GenericRepository<User>(_context);
    public IGenericRepository<RefreshToken> RefreshTokens => _refreshTokens ??= new GenericRepository<RefreshToken>(_context);
    public IGenericRepository<CommunityMembership> CommunityMemberships => _communityMemberships ??= new GenericRepository<CommunityMembership>(_context);
    public IGenericRepository<Friendship> Friendships => _friendships ??= new GenericRepository<Friendship>(_context);
    public IGenericRepository<Conversation> Conversations => _conversations ??= new GenericRepository<Conversation>(_context);
    public IGenericRepository<ConversationParticipant> ConversationParticipants => _conversationParticipants ??= new GenericRepository<ConversationParticipant>(_context);
    public IGenericRepository<Message> Messages => _messages ??= new GenericRepository<Message>(_context);
    public IGenericRepository<GroupCategory> GroupCategories => _groupCategories ??= new GenericRepository<GroupCategory>(_context);
    public IGenericRepository<Group> Groups => _groups ??= new GenericRepository<Group>(_context);
    public IGenericRepository<GroupMember> GroupMembers => _groupMembers ??= new GenericRepository<GroupMember>(_context);
    public IGenericRepository<Bulletin> Bulletins => _bulletins ??= new GenericRepository<Bulletin>(_context);
    public IGenericRepository<CalendarEvent> CalendarEvents => _calendarEvents ??= new GenericRepository<CalendarEvent>(_context);
    public IGenericRepository<EventRegistration> EventRegistrations => _eventRegistrations ??= new GenericRepository<EventRegistration>(_context);
    public IGenericRepository<EventCustomField> EventCustomFields => _eventCustomFields ??= new GenericRepository<EventCustomField>(_context);
    public IGenericRepository<EventCustomFieldValue> EventCustomFieldValues => _eventCustomFieldValues ??= new GenericRepository<EventCustomFieldValue>(_context);
    public IGenericRepository<PhotoAlbum> PhotoAlbums => _photoAlbums ??= new GenericRepository<PhotoAlbum>(_context);
    public IGenericRepository<Photo> Photos => _photos ??= new GenericRepository<Photo>(_context);
    public IGenericRepository<VideoAlbum> VideoAlbums => _videoAlbums ??= new GenericRepository<VideoAlbum>(_context);
    public IGenericRepository<Video> Videos => _videos ??= new GenericRepository<Video>(_context);
    public IGenericRepository<Document> Documents => _documents ??= new GenericRepository<Document>(_context);
    public IGenericRepository<FormTemplate> FormTemplates => _formTemplates ??= new GenericRepository<FormTemplate>(_context);
    public IGenericRepository<FormField> FormFields => _formFields ??= new GenericRepository<FormField>(_context);
    public IGenericRepository<FormResponse> FormResponses => _formResponses ??= new GenericRepository<FormResponse>(_context);
    public IGenericRepository<FormResponseValue> FormResponseValues => _formResponseValues ??= new GenericRepository<FormResponseValue>(_context);
    public IGenericRepository<FinancialCategory> FinancialCategories => _financialCategories ??= new GenericRepository<FinancialCategory>(_context);
    public IGenericRepository<FinancialTransaction> FinancialTransactions => _financialTransactions ??= new GenericRepository<FinancialTransaction>(_context);
    public IGenericRepository<GivingStatement> GivingStatements => _givingStatements ??= new GenericRepository<GivingStatement>(_context);
    public IGenericRepository<Study> Studies => _studies ??= new GenericRepository<Study>(_context);
    public IGenericRepository<StudyAttachment> StudyAttachments => _studyAttachments ??= new GenericRepository<StudyAttachment>(_context);
    public IGenericRepository<Models.Entities.Teaching.Class> Classes => _classes ??= new GenericRepository<Models.Entities.Teaching.Class>(_context);
    public IGenericRepository<ClassAttachment> ClassAttachments => _classAttachments ??= new GenericRepository<ClassAttachment>(_context);
    public IGenericRepository<ClassMember> ClassMembers => _classMembers ??= new GenericRepository<ClassMember>(_context);
    public IGenericRepository<AssetCategory> AssetCategories => _assetCategories ??= new GenericRepository<AssetCategory>(_context);
    public IGenericRepository<Asset> Assets => _assets ??= new GenericRepository<Asset>(_context);
    public IGenericRepository<ServiceSchedule> ServiceSchedules => _serviceSchedules ??= new GenericRepository<ServiceSchedule>(_context);
    public IGenericRepository<LiveService> LiveServices => _liveServices ??= new GenericRepository<LiveService>(_context);
    public IGenericRepository<Donation> Donations => _donations ??= new GenericRepository<Donation>(_context);
    public IGenericRepository<PaymentLink> PaymentLinks => _paymentLinks ??= new GenericRepository<PaymentLink>(_context);
    public IGenericRepository<PaymentGatewayConfig> PaymentGatewayConfigs => _paymentGatewayConfigs ??= new GenericRepository<PaymentGatewayConfig>(_context);
    public IGenericRepository<Post> Posts => _posts ??= new GenericRepository<Post>(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
