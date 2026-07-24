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
using Echurchs.Repository.Seed;
using Microsoft.EntityFrameworkCore;

namespace Echurchs.Repository.Context;

public class EchurchsDbContext : DbContext
{
    public EchurchsDbContext(DbContextOptions<EchurchsDbContext> options) : base(options) { }

    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<PlanLimit> PlanLimits => Set<PlanLimit>();
    public DbSet<Community> Communities => Set<Community>();
    public DbSet<CommunitySubscription> CommunitySubscriptions => Set<CommunitySubscription>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<CommunityMembership> CommunityMemberships => Set<CommunityMembership>();

    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
    public DbSet<Message> Messages => Set<Message>();

    public DbSet<GroupCategory> GroupCategories => Set<GroupCategory>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<GroupMember> GroupMembers => Set<GroupMember>();

    public DbSet<Bulletin> Bulletins => Set<Bulletin>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();
    public DbSet<EventCustomField> EventCustomFields => Set<EventCustomField>();
    public DbSet<EventCustomFieldValue> EventCustomFieldValues => Set<EventCustomFieldValue>();

    public DbSet<PhotoAlbum> PhotoAlbums => Set<PhotoAlbum>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<VideoAlbum> VideoAlbums => Set<VideoAlbum>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<FormTemplate> FormTemplates => Set<FormTemplate>();
    public DbSet<FormField> FormFields => Set<FormField>();
    public DbSet<FormResponse> FormResponses => Set<FormResponse>();
    public DbSet<FormResponseValue> FormResponseValues => Set<FormResponseValue>();

    public DbSet<FinancialCategory> FinancialCategories => Set<FinancialCategory>();
    public DbSet<FinancialTransaction> FinancialTransactions => Set<FinancialTransaction>();
    public DbSet<GivingStatement> GivingStatements => Set<GivingStatement>();

    public DbSet<Study> Studies => Set<Study>();
    public DbSet<StudyAttachment> StudyAttachments => Set<StudyAttachment>();
    public DbSet<Models.Entities.Teaching.Class> Classes => Set<Models.Entities.Teaching.Class>();
    public DbSet<ClassAttachment> ClassAttachments => Set<ClassAttachment>();
    public DbSet<ClassMember> ClassMembers => Set<ClassMember>();

    public DbSet<AssetCategory> AssetCategories => Set<AssetCategory>();
    public DbSet<Asset> Assets => Set<Asset>();

    public DbSet<ServiceSchedule> ServiceSchedules => Set<ServiceSchedule>();
    public DbSet<LiveService> LiveServices => Set<LiveService>();

    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<PaymentLink> PaymentLinks => Set<PaymentLink>();
    public DbSet<PaymentGatewayConfig> PaymentGatewayConfigs => Set<PaymentGatewayConfig>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.NoAction;
        }

        modelBuilder.Entity<Plan>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<PlanLimit>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Module).HasMaxLength(100).IsRequired();
            e.Property(p => p.Feature).HasMaxLength(100).IsRequired();
            e.HasOne(p => p.Plan).WithMany(p => p.PlanLimits).HasForeignKey(p => p.PlanId);
        });

        modelBuilder.Entity<Community>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).HasMaxLength(300).IsRequired();
            e.Property(c => c.Nipc).HasMaxLength(20);
            e.Property(c => c.Slug).HasMaxLength(200);
            e.HasIndex(c => c.Slug).IsUnique();
            e.HasOne(c => c.Creator).WithMany().HasForeignKey(c => c.CreatedBy).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<CommunitySubscription>(e =>
        {
            e.HasKey(cs => cs.Id);
            e.HasOne(cs => cs.Community).WithOne(c => c.Subscription).HasForeignKey<CommunitySubscription>(cs => cs.CommunityId);
            e.HasOne(cs => cs.Plan).WithMany(p => p.CommunitySubscriptions).HasForeignKey(cs => cs.PlanId);
            e.Property(cs => cs.PaymentMethod).HasMaxLength(100);
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Name).HasMaxLength(300).IsRequired();
            e.Property(u => u.Email).HasMaxLength(300).IsRequired();
            e.Property(u => u.Phone).HasMaxLength(50);
            e.Property(u => u.Gender).HasMaxLength(50);
            e.Property(u => u.MaritalStatus).HasMaxLength(50);
            e.Property(u => u.Address).HasMaxLength(500);
            e.Property(u => u.City).HasMaxLength(200);
            e.Property(u => u.District).HasMaxLength(200);
            e.Property(u => u.PostalCode).HasMaxLength(20);
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Token).HasMaxLength(500).IsRequired();
            e.HasOne(r => r.User).WithMany(u => u.RefreshTokens).HasForeignKey(r => r.UserId);
        });

        modelBuilder.Entity<CommunityMembership>(e =>
        {
            e.HasKey(cm => cm.Id);
            e.HasOne(cm => cm.User).WithMany(u => u.Memberships).HasForeignKey(cm => cm.UserId);
            e.HasOne(cm => cm.Community).WithMany(c => c.Memberships).HasForeignKey(cm => cm.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Friendship>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasOne(f => f.Requester).WithMany(u => u.FriendshipsRequested).HasForeignKey(f => f.RequesterId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(f => f.Addressee).WithMany(u => u.FriendshipsReceived).HasForeignKey(f => f.AddresseeId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Conversation>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Title).HasMaxLength(300);
        });

        modelBuilder.Entity<ConversationParticipant>(e =>
        {
            e.HasKey(cp => cp.Id);
            e.HasOne(cp => cp.Conversation).WithMany(c => c.Participants).HasForeignKey(cp => cp.ConversationId);
            e.HasOne(cp => cp.User).WithMany().HasForeignKey(cp => cp.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Message>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Content).HasMaxLength(4000).IsRequired();
            e.HasOne(m => m.Conversation).WithMany(c => c.Messages).HasForeignKey(m => m.ConversationId);
            e.HasOne(m => m.Sender).WithMany().HasForeignKey(m => m.SenderId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<GroupCategory>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Name).HasMaxLength(200).IsRequired();
            e.HasOne(g => g.Community).WithMany().HasForeignKey(g => g.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Group>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Name).HasMaxLength(200).IsRequired();
            e.HasOne(g => g.Community).WithMany().HasForeignKey(g => g.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(g => g.Category).WithMany(c => c.Groups).HasForeignKey(g => g.CategoryId).IsRequired(false);
            e.HasOne(g => g.Leader).WithMany().HasForeignKey(g => g.LeaderId).IsRequired(false);
        });

        modelBuilder.Entity<GroupMember>(e =>
        {
            e.HasKey(gm => gm.Id);
            e.HasOne(gm => gm.Group).WithMany(g => g.Members).HasForeignKey(gm => gm.GroupId);
            e.HasOne(gm => gm.User).WithMany().HasForeignKey(gm => gm.UserId);
            e.HasIndex(gm => new { gm.GroupId, gm.UserId }).IsUnique();
        });

        modelBuilder.Entity<Bulletin>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.Title).HasMaxLength(300).IsRequired();
            e.HasOne(b => b.Community).WithMany().HasForeignKey(b => b.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(b => b.Author).WithMany().HasForeignKey(b => b.AuthorId);
        });

        modelBuilder.Entity<CalendarEvent>(e =>
        {
            e.HasKey(ce => ce.Id);
            e.Property(ce => ce.Title).HasMaxLength(300).IsRequired();
            e.Property(ce => ce.Location).HasMaxLength(500);
            e.HasOne(ce => ce.Community).WithMany().HasForeignKey(ce => ce.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(ce => ce.Creator).WithMany().HasForeignKey(ce => ce.CreatedBy);
        });

        modelBuilder.Entity<EventRegistration>(e =>
        {
            e.HasKey(er => er.Id);
            e.HasOne(er => er.Event).WithMany(ev => ev.Registrations).HasForeignKey(er => er.EventId);
            e.HasOne(er => er.User).WithMany().HasForeignKey(er => er.UserId);
            e.HasIndex(er => new { er.EventId, er.UserId }).IsUnique();
        });

        modelBuilder.Entity<EventCustomField>(e =>
        {
            e.HasKey(ecf => ecf.Id);
            e.Property(ecf => ecf.FieldName).HasMaxLength(200).IsRequired();
            e.HasOne(ecf => ecf.Event).WithMany(ev => ev.CustomFields).HasForeignKey(ecf => ecf.EventId);
        });

        modelBuilder.Entity<EventCustomFieldValue>(e =>
        {
            e.HasKey(ecfv => ecfv.Id);
            e.Property(ecfv => ecfv.Value).HasMaxLength(2000);
            e.HasOne(ecfv => ecfv.Registration).WithMany(r => r.CustomFieldValues).HasForeignKey(ecfv => ecfv.RegistrationId);
            e.HasOne(ecfv => ecfv.CustomField).WithMany().HasForeignKey(ecfv => ecfv.CustomFieldId);
        });

        modelBuilder.Entity<PhotoAlbum>(e =>
        {
            e.HasKey(pa => pa.Id);
            e.Property(pa => pa.Name).HasMaxLength(200).IsRequired();
            e.HasOne(pa => pa.Community).WithMany().HasForeignKey(pa => pa.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Photo>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Url).HasMaxLength(2000).IsRequired();
            e.HasOne(p => p.Album).WithMany(a => a.Photos).HasForeignKey(p => p.AlbumId);
        });

        modelBuilder.Entity<VideoAlbum>(e =>
        {
            e.HasKey(va => va.Id);
            e.Property(va => va.Name).HasMaxLength(200).IsRequired();
            e.HasOne(va => va.Community).WithMany().HasForeignKey(va => va.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Video>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.Url).HasMaxLength(2000).IsRequired();
            e.Property(v => v.Title).HasMaxLength(300).IsRequired();
            e.HasOne(v => v.Album).WithMany(a => a.Videos).HasForeignKey(v => v.AlbumId);
        });

        modelBuilder.Entity<Document>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.Title).HasMaxLength(300).IsRequired();
            e.Property(d => d.FileUrl).HasMaxLength(2000).IsRequired();
            e.HasOne(d => d.Community).WithMany().HasForeignKey(d => d.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(d => d.Creator).WithMany().HasForeignKey(d => d.CreatedBy);
        });

        modelBuilder.Entity<FormTemplate>(e =>
        {
            e.HasKey(ft => ft.Id);
            e.Property(ft => ft.Title).HasMaxLength(300).IsRequired();
            e.HasOne(ft => ft.Community).WithMany().HasForeignKey(ft => ft.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<FormField>(e =>
        {
            e.HasKey(ff => ff.Id);
            e.Property(ff => ff.FieldName).HasMaxLength(200).IsRequired();
            e.HasOne(ff => ff.FormTemplate).WithMany(ft => ft.Fields).HasForeignKey(ff => ff.FormTemplateId);
        });

        modelBuilder.Entity<FormResponse>(e =>
        {
            e.HasKey(fr => fr.Id);
            e.HasOne(fr => fr.FormTemplate).WithMany(ft => ft.Responses).HasForeignKey(fr => fr.FormTemplateId);
            e.HasOne(fr => fr.User).WithMany().HasForeignKey(fr => fr.UserId).IsRequired(false);
        });

        modelBuilder.Entity<FormResponseValue>(e =>
        {
            e.HasKey(frv => frv.Id);
            e.Property(frv => frv.Value).HasMaxLength(4000);
            e.HasOne(frv => frv.Response).WithMany(r => r.Values).HasForeignKey(frv => frv.ResponseId);
            e.HasOne(frv => frv.FormField).WithMany().HasForeignKey(frv => frv.FormFieldId);
        });

        modelBuilder.Entity<FinancialCategory>(e =>
        {
            e.HasKey(fc => fc.Id);
            e.Property(fc => fc.Name).HasMaxLength(200).IsRequired();
            e.HasOne(fc => fc.Community).WithMany().HasForeignKey(fc => fc.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<FinancialTransaction>(e =>
        {
            e.HasKey(ft => ft.Id);
            e.Property(ft => ft.Amount).HasPrecision(18, 2);
            e.Property(ft => ft.Description).HasMaxLength(500);
            e.HasOne(ft => ft.Community).WithMany().HasForeignKey(ft => ft.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(ft => ft.User).WithMany().HasForeignKey(ft => ft.UserId).IsRequired(false);
            e.HasOne(ft => ft.Category).WithMany(c => c.Transactions).HasForeignKey(ft => ft.CategoryId).IsRequired(false);
            e.HasOne(ft => ft.Creator).WithMany().HasForeignKey(ft => ft.CreatedBy);
        });

        modelBuilder.Entity<GivingStatement>(e =>
        {
            e.HasKey(gs => gs.Id);
            e.Property(gs => gs.TotalTithes).HasPrecision(18, 2);
            e.Property(gs => gs.TotalOfferings).HasPrecision(18, 2);
            e.Property(gs => gs.TotalDonations).HasPrecision(18, 2);
            e.HasOne(gs => gs.Community).WithMany().HasForeignKey(gs => gs.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(gs => gs.User).WithMany().HasForeignKey(gs => gs.UserId);
        });

        modelBuilder.Entity<Study>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Title).HasMaxLength(300).IsRequired();
            e.HasOne(s => s.Community).WithMany().HasForeignKey(s => s.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(s => s.Author).WithMany().HasForeignKey(s => s.AuthorId);
        });

        modelBuilder.Entity<StudyAttachment>(e =>
        {
            e.HasKey(sa => sa.Id);
            e.Property(sa => sa.FileName).HasMaxLength(300).IsRequired();
            e.Property(sa => sa.FileUrl).HasMaxLength(2000).IsRequired();
            e.HasOne(sa => sa.Study).WithMany(s => s.Attachments).HasForeignKey(sa => sa.StudyId);
        });

        modelBuilder.Entity<Models.Entities.Teaching.Class>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).HasMaxLength(300).IsRequired();
            e.HasOne(c => c.Community).WithMany().HasForeignKey(c => c.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(c => c.Teacher).WithMany().HasForeignKey(c => c.TeacherId).IsRequired(false);
        });

        modelBuilder.Entity<ClassAttachment>(e =>
        {
            e.HasKey(ca => ca.Id);
            e.Property(ca => ca.FileName).HasMaxLength(300).IsRequired();
            e.Property(ca => ca.FileUrl).HasMaxLength(2000).IsRequired();
            e.HasOne(ca => ca.Class).WithMany(c => c.Attachments).HasForeignKey(ca => ca.ClassId);
        });

        modelBuilder.Entity<ClassMember>(e =>
        {
            e.HasKey(cm => cm.Id);
            e.HasOne(cm => cm.Class).WithMany(c => c.Members).HasForeignKey(cm => cm.ClassId);
            e.HasOne(cm => cm.User).WithMany().HasForeignKey(cm => cm.UserId);
            e.HasIndex(cm => new { cm.ClassId, cm.UserId }).IsUnique();
        });

        modelBuilder.Entity<AssetCategory>(e =>
        {
            e.HasKey(ac => ac.Id);
            e.Property(ac => ac.Name).HasMaxLength(200).IsRequired();
            e.HasOne(ac => ac.Community).WithMany().HasForeignKey(ac => ac.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Asset>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Name).HasMaxLength(300).IsRequired();
            e.Property(a => a.PurchaseValue).HasPrecision(18, 2);
            e.Property(a => a.CurrentValue).HasPrecision(18, 2);
            e.HasOne(a => a.Community).WithMany().HasForeignKey(a => a.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(a => a.Category).WithMany(c => c.Assets).HasForeignKey(a => a.CategoryId);
        });

        modelBuilder.Entity<ServiceSchedule>(e =>
        {
            e.HasKey(ss => ss.Id);
            e.Property(ss => ss.Name).HasMaxLength(200).IsRequired();
            e.HasOne(ss => ss.Community).WithMany().HasForeignKey(ss => ss.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<LiveService>(e =>
        {
            e.HasKey(ls => ls.Id);
            e.Property(ls => ls.Title).HasMaxLength(300).IsRequired();
            e.Property(ls => ls.StreamUrl).HasMaxLength(2000);
            e.Property(ls => ls.ZoomMeetingId).HasMaxLength(100);
            e.Property(ls => ls.ZoomMeetingPassword).HasMaxLength(100);
            e.Property(ls => ls.ZoomJoinUrl).HasMaxLength(2000);
            e.HasOne(ls => ls.Community).WithMany().HasForeignKey(ls => ls.CommunityId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(ls => ls.Schedule).WithMany(s => s.LiveServices).HasForeignKey(ls => ls.ScheduleId).IsRequired(false);
            e.HasOne(ls => ls.Creator).WithMany().HasForeignKey(ls => ls.CreatedBy);
        });

        modelBuilder.Entity<Donation>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.DonorName).HasMaxLength(300).IsRequired();
            e.Property(d => d.DonorEmail).HasMaxLength(300);
            e.Property(d => d.Amount).HasPrecision(18, 2);
            e.Property(d => d.PaymentMethod).HasMaxLength(100).IsRequired();
            e.HasOne(d => d.Community).WithMany().HasForeignKey(d => d.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<PaymentLink>(e =>
        {
            e.HasKey(pl => pl.Id);
            e.Property(pl => pl.Title).HasMaxLength(300).IsRequired();
            e.Property(pl => pl.Amount).HasPrecision(18, 2);
            e.Property(pl => pl.ExternalUrl).HasMaxLength(2000).IsRequired();
            e.HasOne(pl => pl.Community).WithMany().HasForeignKey(pl => pl.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<PaymentGatewayConfig>(e =>
        {
            e.HasKey(pgc => pgc.Id);
            e.Property(pgc => pgc.PublicKey).HasMaxLength(500).IsRequired();
            e.Property(pgc => pgc.EncryptedSecretKey).HasMaxLength(2000).IsRequired();
            e.HasOne(pgc => pgc.Community).WithMany().HasForeignKey(pgc => pgc.CommunityId).OnDelete(DeleteBehavior.NoAction);
        });

        Seed.PlanSeedData.Seed(modelBuilder);
    }
}
