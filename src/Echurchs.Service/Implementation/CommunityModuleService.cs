using Echurchs.Models.Dtos.Request;
using Echurchs.Models.Dtos.Response;
using Echurchs.Models.Dtos.Shared;
using Echurchs.Repository.Interfaces;
using Echurchs.Service.Interfaces;

namespace Echurchs.Service.Implementation;

public class CommunityModuleService : ICommunityModuleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPlanLimitService _planLimitService;

    private static readonly Dictionary<string, (string Module, string Feature)> _limitMap = new()
    {
        ["groups"] = ("Grupos", "MaxGroups"),
        ["events"] = ("Eventos", "MaxEvents"),
        ["bulletins"] = ("Agenda", "MaxBulletins"),
        ["documents"] = ("Mídias", "MaxDocuments"),
        ["photos"] = ("Mídias", "MaxPhotos"),
        ["videos"] = ("Mídias", "MaxVideos"),
    };

    public CommunityModuleService(IUnitOfWork unitOfWork, IPlanLimitService planLimitService)
    {
        _unitOfWork = unitOfWork;
        _planLimitService = planLimitService;
    }

    public async Task<ApiResponseDto<List<GenericModuleResponseDto>>> GetAllAsync(Guid communityId, string module)
    {
        var result = new List<GenericModuleResponseDto>();

        switch (module.ToLower())
        {
            case "groups":
                var groups = (await _unitOfWork.Groups.FindAsync(g => g.CommunityId == communityId)).ToList();
                result = groups.Select(g => new GenericModuleResponseDto
                {
                    Id = g.Id, Name = g.Name, Description = g.Description,
                    CategoryId = g.CategoryId, CategoryName = g.Category?.Name,
                    IsActive = g.IsActive, CreatedAt = g.CreatedAt
                }).ToList();
                break;
            case "events":
                var events = (await _unitOfWork.CalendarEvents.FindAsync(e => e.CommunityId == communityId)).ToList();
                result = events.Select(e => new GenericModuleResponseDto
                {
                    Id = e.Id, Title = e.Title, Description = e.Description,
                    StartDate = e.StartDate, EndDate = e.EndDate, Location = e.Location,
                    IsActive = true, CreatedAt = e.CreatedAt
                }).ToList();
                break;
            case "bulletins":
                var bulletins = (await _unitOfWork.Bulletins.FindAsync(b => b.CommunityId == communityId)).ToList();
                result = bulletins.Select(b => new GenericModuleResponseDto
                {
                    Id = b.Id, Title = b.Title, Content = b.Content,
                    IsActive = b.Status == Models.Enums.BulletinStatus.Published, CreatedAt = b.CreatedAt
                }).ToList();
                break;
            case "documents":
                var docs = (await _unitOfWork.Documents.FindAsync(d => d.CommunityId == communityId)).ToList();
                result = docs.Select(d => new GenericModuleResponseDto
                {
                    Id = d.Id, Title = d.Title, FileUrl = d.FileUrl,
                    IsActive = true, CreatedAt = d.CreatedAt
                }).ToList();
                break;
            case "studies":
                var studies = (await _unitOfWork.Studies.FindAsync(s => s.CommunityId == communityId)).ToList();
                result = studies.Select(s => new GenericModuleResponseDto
                {
                    Id = s.Id, Title = s.Title, Description = s.Description, Content = s.Content,
                    IsActive = s.IsPublished, CreatedAt = s.CreatedAt
                }).ToList();
                break;
            case "classes":
                var classes = (await _unitOfWork.Classes.FindAsync(c => c.CommunityId == communityId)).ToList();
                result = classes.Select(c => new GenericModuleResponseDto
                {
                    Id = c.Id, Name = c.Name, Description = c.Description,
                    StartDate = c.StartDate, EndDate = c.EndDate,
                    IsActive = c.IsActive, CreatedAt = c.CreatedAt
                }).ToList();
                break;
            case "live-services":
                var live = (await _unitOfWork.LiveServices.FindAsync(l => l.CommunityId == communityId)).ToList();
                result = live.Select(l => new GenericModuleResponseDto
                {
                    Id = l.Id, Title = l.Title, Description = l.Description,
                    Location = l.StreamUrl, FileUrl = l.RecordingUrl,
                    IsActive = l.Status != Models.Enums.LiveServiceStatus.Cancelled, CreatedAt = l.CreatedAt,
                    StartDate = l.ScheduledDate,
                    Metadata = new Dictionary<string, string>
                    {
                        { "zoomMeetingId", l.ZoomMeetingId ?? "" },
                        { "zoomJoinUrl", l.ZoomJoinUrl ?? "" },
                        { "status", l.Status.ToString() }
                    }
                }).ToList();
                break;
            case "schedules":
                var schedules = (await _unitOfWork.ServiceSchedules.FindAsync(s => s.CommunityId == communityId)).ToList();
                result = schedules.Select(s => new GenericModuleResponseDto
                {
                    Id = s.Id, Name = s.Name,
                    IsActive = s.IsActive, CreatedAt = s.CreatedAt,
                    Metadata = new Dictionary<string, string>
                    {
                        { "dayOfWeek", s.DayOfWeek.ToString() },
                        { "time", s.Time.ToString() },
                        { "frequency", s.Frequency.ToString() }
                    }
                }).ToList();
                break;
            case "photo-albums":
                var pa = (await _unitOfWork.PhotoAlbums.FindAsync(a => a.CommunityId == communityId)).ToList();
                result = pa.Select(a => new GenericModuleResponseDto
                {
                    Id = a.Id, Name = a.Name, Description = a.Description,
                    IsActive = true, CreatedAt = a.CreatedAt
                }).ToList();
                break;
            case "video-albums":
                var va = (await _unitOfWork.VideoAlbums.FindAsync(a => a.CommunityId == communityId)).ToList();
                result = va.Select(a => new GenericModuleResponseDto
                {
                    Id = a.Id, Name = a.Name, Description = a.Description,
                    IsActive = true, CreatedAt = a.CreatedAt
                }).ToList();
                break;
            case "videos":
                var vaIds = (await _unitOfWork.VideoAlbums.FindAsync(a => a.CommunityId == communityId)).Select(a => a.Id).ToList();
                var vids = (await _unitOfWork.Videos.FindAsync(v => vaIds.Contains(v.AlbumId))).ToList();
                result = vids.Select(v => new GenericModuleResponseDto
                {
                    Id = v.Id, Title = v.Title, Description = v.Description,
                    Location = v.Url, FileUrl = v.ThumbnailUrl,
                    IsActive = true, CreatedAt = v.CreatedAt
                }).ToList();
                break;
            case "photos":
                var paIds = (await _unitOfWork.PhotoAlbums.FindAsync(a => a.CommunityId == communityId)).Select(a => a.Id).ToList();
                var phs = (await _unitOfWork.Photos.FindAsync(p => paIds.Contains(p.AlbumId))).ToList();
                result = phs.Select(p => new GenericModuleResponseDto
                {
                    Id = p.Id, Title = p.Caption, FileUrl = p.Url, ImageUrl = p.ThumbnailUrl,
                    IsActive = true, CreatedAt = p.CreatedAt
                }).ToList();
                break;
            case "donations":
                var donations = (await _unitOfWork.Donations.FindAsync(d => d.CommunityId == communityId)).ToList();
                result = donations.Select(d => new GenericModuleResponseDto
                {
                    Id = d.Id, Title = d.DonorName, Amount = d.Amount,
                    IsActive = d.Status == Models.Enums.DonationStatus.Completed, CreatedAt = d.CreatedAt,
                    Metadata = new Dictionary<string, string>
                    {
                        { "paymentMethod", d.PaymentMethod },
                        { "status", d.Status.ToString() }
                    }
                }).ToList();
                break;
            case "payment-links":
                var pl = (await _unitOfWork.PaymentLinks.FindAsync(p => p.CommunityId == communityId)).ToList();
                result = pl.Select(p => new GenericModuleResponseDto
                {
                    Id = p.Id, Title = p.Title, Amount = p.Amount, FileUrl = p.ExternalUrl,
                    IsActive = p.IsActive, CreatedAt = p.CreatedAt
                }).ToList();
                break;
            case "group-categories":
                var gc = (await _unitOfWork.GroupCategories.FindAsync(c => c.CommunityId == communityId)).ToList();
                result = gc.Select(c => new GenericModuleResponseDto
                {
                    Id = c.Id, Name = c.Name, Description = c.Description,
                    IsActive = true
                }).ToList();
                break;
            case "financial-categories":
                var fc = (await _unitOfWork.FinancialCategories.FindAsync(c => c.CommunityId == communityId)).ToList();
                result = fc.Select(c => new GenericModuleResponseDto
                {
                    Id = c.Id, Name = c.Name,
                    IsActive = true,
                    Metadata = new Dictionary<string, string> { { "type", c.Type.ToString() } }
                }).ToList();
                break;
        }

        return ApiResponseDto<List<GenericModuleResponseDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponseDto<GenericModuleResponseDto>> GetByIdAsync(Guid id, string module)
    {
        object? entity = module.ToLower() switch
        {
            "groups" => await _unitOfWork.Groups.GetByIdAsync(id),
            "events" => await _unitOfWork.CalendarEvents.GetByIdAsync(id),
            "bulletins" => await _unitOfWork.Bulletins.GetByIdAsync(id),
            "documents" => await _unitOfWork.Documents.GetByIdAsync(id),
            "studies" => await _unitOfWork.Studies.GetByIdAsync(id),
            "classes" => await _unitOfWork.Classes.GetByIdAsync(id),
            "live-services" => await _unitOfWork.LiveServices.GetByIdAsync(id),
            "schedules" => await _unitOfWork.ServiceSchedules.GetByIdAsync(id),
            "donations" => await _unitOfWork.Donations.GetByIdAsync(id),
            "payment-links" => await _unitOfWork.PaymentLinks.GetByIdAsync(id),
            _ => null
        };

        if (entity == null)
            return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Item não encontrado");

        return ApiResponseDto<GenericModuleResponseDto>.SuccessResponse(MapToResponse(entity));
    }

    public async Task<ApiResponseDto<GenericModuleResponseDto>> CreateAsync(GenericModuleRequestDto request, Guid communityId, Guid userId, string module)
    {
        if (_limitMap.TryGetValue(module.ToLower(), out var limitKey))
        {
            var check = await _planLimitService.CheckLimitAsync(communityId, limitKey.Module, limitKey.Feature);
            if (!check.Allowed)
                return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse(
                    $"Limite do plano {check.PlanName} atingido ({check.CurrentUsage}/{check.LimitValue}). Faça upgrade para continuar.",
                    errorCode: "PLAN_LIMIT_EXCEEDED");
        }

        switch (module.ToLower())
        {
            case "groups":
                var group = new Models.Entities.Groups.Group
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Name = request.Name ?? "", Description = request.Description,
                    CategoryId = request.CategoryId, LeaderId = userId
                };
                await _unitOfWork.Groups.AddAsync(group);
                break;
            case "events":
                var evt = new Models.Entities.Agenda.CalendarEvent
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Title = request.Title ?? request.Name ?? "", Description = request.Description,
                    StartDate = request.StartDate ?? DateTime.UtcNow,
                    EndDate = request.EndDate ?? DateTime.UtcNow.AddHours(1),
                    Location = request.Location, CreatedBy = userId
                };
                await _unitOfWork.CalendarEvents.AddAsync(evt);
                break;
            case "bulletins":
                var bulletin = new Models.Entities.Agenda.Bulletin
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Title = request.Title ?? "", Content = request.Content ?? "",
                    AuthorId = userId, PublishDate = DateTime.UtcNow,
                    Status = Models.Enums.BulletinStatus.Published
                };
                await _unitOfWork.Bulletins.AddAsync(bulletin);
                break;
            case "studies":
                var study = new Models.Entities.Teaching.Study
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Title = request.Title ?? "", Description = request.Description,
                    Content = request.Content, AuthorId = userId
                };
                await _unitOfWork.Studies.AddAsync(study);
                break;
            case "documents":
                var doc = new Models.Entities.Media.Document
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Title = request.Title ?? "", FileUrl = request.FileUrl ?? "",
                    CreatedBy = userId
                };
                await _unitOfWork.Documents.AddAsync(doc);
                break;
            case "classes":
                var cls = new Models.Entities.Teaching.Class
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Name = request.Name ?? "", Description = request.Description,
                    TeacherId = userId, StartDate = request.StartDate, EndDate = request.EndDate
                };
                await _unitOfWork.Classes.AddAsync(cls);
                break;
            case "photo-albums":
                var photoAlbum = new Models.Entities.Media.PhotoAlbum
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Name = request.Name ?? "", Description = request.Description
                };
                await _unitOfWork.PhotoAlbums.AddAsync(photoAlbum);
                break;
            case "video-albums":
                var videoAlbum = new Models.Entities.Media.VideoAlbum
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Name = request.Name ?? "", Description = request.Description
                };
                await _unitOfWork.VideoAlbums.AddAsync(videoAlbum);
                break;
            case "payment-links":
                var paymentLink = new Models.Entities.Donations.PaymentLink
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Title = request.Title ?? request.Name ?? "", Amount = request.Amount,
                    ExternalUrl = request.FileUrl ?? request.Location ?? ""
                };
                await _unitOfWork.PaymentLinks.AddAsync(paymentLink);
                break;
            case "group-categories":
                var groupCat = new Models.Entities.Groups.GroupCategory
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Name = request.Name ?? "", Description = request.Description
                };
                await _unitOfWork.GroupCategories.AddAsync(groupCat);
                break;
            case "financial-categories":
                var finCat = new Models.Entities.Financial.FinancialCategory
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Name = request.Name ?? "",
                    Type = Enum.TryParse<Models.Enums.TransactionCategoryType>(request.Metadata?.GetValueOrDefault("type"), out var tt2) ? tt2 : Models.Enums.TransactionCategoryType.Income
                };
                await _unitOfWork.FinancialCategories.AddAsync(finCat);
                break;
            case "live-services":
                var liveService = new Models.Entities.Live.LiveService
                {
                    Id = Guid.NewGuid(), CommunityId = communityId,
                    Title = request.Title ?? request.Name ?? "", Description = request.Description,
                    ScheduledDate = request.StartDate ?? DateTime.UtcNow,
                    Status = Models.Enums.LiveServiceStatus.Scheduled,
                    StreamUrl = request.Location,
                    CreatedBy = userId
                };
                await _unitOfWork.LiveServices.AddAsync(liveService);
                break;
            case "videos":
                var defaultVideoAlbum = (await _unitOfWork.VideoAlbums.FindAsync(a => a.CommunityId == communityId)).FirstOrDefault();
                if (defaultVideoAlbum == null)
                {
                    defaultVideoAlbum = new Models.Entities.Media.VideoAlbum
                    {
                        Id = Guid.NewGuid(), CommunityId = communityId, Name = "Vídeos"
                    };
                    await _unitOfWork.VideoAlbums.AddAsync(defaultVideoAlbum);
                    await _unitOfWork.SaveChangesAsync();
                }
                var video = new Models.Entities.Media.Video
                {
                    Id = Guid.NewGuid(), AlbumId = defaultVideoAlbum.Id,
                    Title = request.Title ?? request.Name ?? "", Description = request.Description,
                    Url = request.Location ?? request.FileUrl ?? ""
                };
                await _unitOfWork.Videos.AddAsync(video);
                break;
            case "photos":
                var defaultPhotoAlbum = (await _unitOfWork.PhotoAlbums.FindAsync(a => a.CommunityId == communityId)).FirstOrDefault();
                if (defaultPhotoAlbum == null)
                {
                    defaultPhotoAlbum = new Models.Entities.Media.PhotoAlbum
                    {
                        Id = Guid.NewGuid(), CommunityId = communityId, Name = "Fotos"
                    };
                    await _unitOfWork.PhotoAlbums.AddAsync(defaultPhotoAlbum);
                    await _unitOfWork.SaveChangesAsync();
                }
                var photo = new Models.Entities.Media.Photo
                {
                    Id = Guid.NewGuid(), AlbumId = defaultPhotoAlbum.Id,
                    Url = request.FileUrl ?? request.Location ?? "",
                    Caption = request.Name ?? request.Title ?? ""
                };
                await _unitOfWork.Photos.AddAsync(photo);
                break;
            default:
                return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Módulo não suportado para criação");
        }

        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<GenericModuleResponseDto>.SuccessResponse(new GenericModuleResponseDto { Id = Guid.NewGuid(), Name = request.Name, Title = request.Title });
    }

    public async Task<ApiResponseDto<GenericModuleResponseDto>> UpdateAsync(Guid id, GenericModuleRequestDto request, Guid communityId, string module)
    {
        switch (module.ToLower())
        {
            case "groups":
                var group = await _unitOfWork.Groups.GetByIdAsync(id);
                if (group == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Grupo não encontrado");
                group.Name = request.Name ?? group.Name;
                group.Description = request.Description ?? group.Description;
                group.CategoryId = request.CategoryId ?? group.CategoryId;
                break;
            case "events":
                var evt = await _unitOfWork.CalendarEvents.GetByIdAsync(id);
                if (evt == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Evento não encontrado");
                evt.Title = request.Title ?? evt.Title;
                evt.Description = request.Description ?? evt.Description;
                evt.StartDate = request.StartDate ?? evt.StartDate;
                evt.EndDate = request.EndDate ?? evt.EndDate;
                evt.Location = request.Location ?? evt.Location;
                break;
            case "bulletins":
                var bulletin = await _unitOfWork.Bulletins.GetByIdAsync(id);
                if (bulletin == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Aviso não encontrado");
                bulletin.Title = request.Title ?? bulletin.Title;
                bulletin.Content = request.Content ?? bulletin.Content;
                break;
            case "studies":
                var study = await _unitOfWork.Studies.GetByIdAsync(id);
                if (study == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Estudo não encontrado");
                study.Title = request.Title ?? study.Title;
                study.Description = request.Description ?? study.Description;
                study.Content = request.Content ?? study.Content;
                break;
            case "documents":
                var doc = await _unitOfWork.Documents.GetByIdAsync(id);
                if (doc == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Documento não encontrado");
                doc.Title = request.Title ?? doc.Title;
                doc.FileUrl = request.FileUrl ?? doc.FileUrl;
                break;
            case "classes":
                var cls = await _unitOfWork.Classes.GetByIdAsync(id);
                if (cls == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Turma não encontrada");
                cls.Name = request.Name ?? cls.Name;
                cls.Description = request.Description ?? cls.Description;
                cls.StartDate = request.StartDate ?? cls.StartDate;
                cls.EndDate = request.EndDate ?? cls.EndDate;
                break;
            case "photo-albums":
                var pa = await _unitOfWork.PhotoAlbums.GetByIdAsync(id);
                if (pa == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Álbum não encontrado");
                pa.Name = request.Name ?? pa.Name;
                pa.Description = request.Description ?? pa.Description;
                break;
            case "video-albums":
                var va = await _unitOfWork.VideoAlbums.GetByIdAsync(id);
                if (va == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Álbum não encontrado");
                va.Name = request.Name ?? va.Name;
                va.Description = request.Description ?? va.Description;
                break;
            case "videos":
                var vid = await _unitOfWork.Videos.GetByIdAsync(id);
                if (vid == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Vídeo não encontrado");
                vid.Title = request.Title ?? vid.Title;
                vid.Description = request.Description ?? vid.Description;
                vid.Url = request.Location ?? request.FileUrl ?? vid.Url;
                break;
            case "photos":
                var ph = await _unitOfWork.Photos.GetByIdAsync(id);
                if (ph == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Foto não encontrada");
                ph.Url = request.FileUrl ?? request.Location ?? ph.Url;
                ph.Caption = request.Name ?? request.Title ?? ph.Caption;
                break;
            case "payment-links":
                var pl = await _unitOfWork.PaymentLinks.GetByIdAsync(id);
                if (pl == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Link não encontrado");
                pl.Title = request.Title ?? pl.Title;
                pl.Amount = request.Amount ?? pl.Amount;
                pl.ExternalUrl = request.FileUrl ?? request.Location ?? pl.ExternalUrl;
                break;
            case "live-services":
                var ls = await _unitOfWork.LiveServices.GetByIdAsync(id);
                if (ls == null) return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Transmissão não encontrada");
                ls.Title = request.Title ?? ls.Title;
                ls.Description = request.Description ?? ls.Description;
                ls.ScheduledDate = request.StartDate ?? ls.ScheduledDate;
                ls.StreamUrl = request.Location ?? request.FileUrl ?? ls.StreamUrl;
                if (request.Metadata != null && request.Metadata.TryGetValue("status", out var newStatusStr)
                    && Enum.TryParse<Models.Enums.LiveServiceStatus>(newStatusStr, out var newStatus))
                {
                    if (newStatus == Models.Enums.LiveServiceStatus.Live && ls.Status != Models.Enums.LiveServiceStatus.Live)
                    {
                        var liveCheck = await _planLimitService.CheckLimitAsync(communityId, "Live", "MaxConcurrentLiveServices");
                        if (!liveCheck.Allowed)
                            return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse(
                                $"Limite do plano {liveCheck.PlanName} atingido ({liveCheck.CurrentUsage}/{liveCheck.LimitValue}). Faça upgrade para continuar.",
                                errorCode: "PLAN_LIMIT_EXCEEDED");
                    }
                    ls.Status = newStatus;
                }
                break;
            default:
                return ApiResponseDto<GenericModuleResponseDto>.ErrorResponse("Módulo não suportado para atualização");
        }

        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<GenericModuleResponseDto>.SuccessResponse(new GenericModuleResponseDto { Id = id, Name = request.Name, Title = request.Title });
    }

    public async Task<ApiResponseDto<bool>> DeleteAsync(Guid id, string module)
    {
        bool exists;
        switch (module.ToLower())
        {
            case "groups":
                exists = await _unitOfWork.Groups.ExistsAsync(g => g.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Grupo não encontrado");
                await _unitOfWork.Groups.DeleteAsync(id);
                break;
            case "events":
                exists = await _unitOfWork.CalendarEvents.ExistsAsync(e => e.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Evento não encontrado");
                await _unitOfWork.CalendarEvents.DeleteAsync(id);
                break;
            case "bulletins":
                exists = await _unitOfWork.Bulletins.ExistsAsync(b => b.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Aviso não encontrado");
                await _unitOfWork.Bulletins.DeleteAsync(id);
                break;
            case "studies":
                exists = await _unitOfWork.Studies.ExistsAsync(s => s.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Estudo não encontrado");
                await _unitOfWork.Studies.DeleteAsync(id);
                break;
            case "documents":
                exists = await _unitOfWork.Documents.ExistsAsync(d => d.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Documento não encontrado");
                await _unitOfWork.Documents.DeleteAsync(id);
                break;
            case "classes":
                exists = await _unitOfWork.Classes.ExistsAsync(c => c.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Turma não encontrada");
                await _unitOfWork.Classes.DeleteAsync(id);
                break;
            case "photo-albums":
                exists = await _unitOfWork.PhotoAlbums.ExistsAsync(a => a.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Álbum não encontrado");
                await _unitOfWork.PhotoAlbums.DeleteAsync(id);
                break;
            case "video-albums":
                exists = await _unitOfWork.VideoAlbums.ExistsAsync(a => a.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Álbum não encontrado");
                await _unitOfWork.VideoAlbums.DeleteAsync(id);
                break;
            case "videos":
                exists = await _unitOfWork.Videos.ExistsAsync(v => v.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Vídeo não encontrado");
                await _unitOfWork.Videos.DeleteAsync(id);
                break;
            case "photos":
                exists = await _unitOfWork.Photos.ExistsAsync(p => p.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Foto não encontrada");
                await _unitOfWork.Photos.DeleteAsync(id);
                break;
            case "payment-links":
                exists = await _unitOfWork.PaymentLinks.ExistsAsync(p => p.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Link não encontrado");
                await _unitOfWork.PaymentLinks.DeleteAsync(id);
                break;
            case "live-services":
                exists = await _unitOfWork.LiveServices.ExistsAsync(l => l.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Transmissão não encontrada");
                await _unitOfWork.LiveServices.DeleteAsync(id);
                break;
            case "schedules":
                exists = await _unitOfWork.ServiceSchedules.ExistsAsync(s => s.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Agenda não encontrada");
                await _unitOfWork.ServiceSchedules.DeleteAsync(id);
                break;
            case "group-categories":
                exists = await _unitOfWork.GroupCategories.ExistsAsync(c => c.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Categoria não encontrada");
                await _unitOfWork.GroupCategories.DeleteAsync(id);
                break;
            case "financial-categories":
                exists = await _unitOfWork.FinancialCategories.ExistsAsync(c => c.Id == id);
                if (!exists) return ApiResponseDto<bool>.ErrorResponse("Categoria não encontrada");
                await _unitOfWork.FinancialCategories.DeleteAsync(id);
                break;
            default:
                return ApiResponseDto<bool>.ErrorResponse("Módulo não suportado para exclusão");
        }

        await _unitOfWork.SaveChangesAsync();
        return ApiResponseDto<bool>.SuccessResponse(true);
    }

    private static GenericModuleResponseDto MapToResponse(object entity)
    {
        return entity switch
        {
            Models.Entities.Groups.Group g => new GenericModuleResponseDto { Id = g.Id, Name = g.Name, Description = g.Description, CategoryId = g.CategoryId, CategoryName = g.Category?.Name, IsActive = g.IsActive, CreatedAt = g.CreatedAt },
            Models.Entities.Agenda.CalendarEvent e => new GenericModuleResponseDto { Id = e.Id, Title = e.Title, Description = e.Description, StartDate = e.StartDate, EndDate = e.EndDate, Location = e.Location, IsActive = true, CreatedAt = e.CreatedAt },
            Models.Entities.Agenda.Bulletin b => new GenericModuleResponseDto { Id = b.Id, Title = b.Title, Content = b.Content, IsActive = b.Status == Models.Enums.BulletinStatus.Published, CreatedAt = b.CreatedAt },
            Models.Entities.Media.Document d => new GenericModuleResponseDto { Id = d.Id, Title = d.Title, FileUrl = d.FileUrl, IsActive = true, CreatedAt = d.CreatedAt },
            Models.Entities.Teaching.Study s => new GenericModuleResponseDto { Id = s.Id, Title = s.Title, Description = s.Description, Content = s.Content, IsActive = s.IsPublished, CreatedAt = s.CreatedAt },
            Models.Entities.Teaching.Class c => new GenericModuleResponseDto { Id = c.Id, Name = c.Name, Description = c.Description, IsActive = c.IsActive, CreatedAt = c.CreatedAt },
            Models.Entities.Live.LiveService l => new GenericModuleResponseDto { Id = l.Id, Title = l.Title, Description = l.Description, Location = l.StreamUrl, IsActive = true, CreatedAt = l.CreatedAt, StartDate = l.ScheduledDate },
            Models.Entities.Live.ServiceSchedule ss => new GenericModuleResponseDto { Id = ss.Id, Name = ss.Name, IsActive = ss.IsActive, CreatedAt = ss.CreatedAt },
            Models.Entities.Donations.Donation d => new GenericModuleResponseDto { Id = d.Id, Title = d.DonorName, Amount = d.Amount, IsActive = d.Status == Models.Enums.DonationStatus.Completed, CreatedAt = d.CreatedAt },
            Models.Entities.Donations.PaymentLink p => new GenericModuleResponseDto { Id = p.Id, Title = p.Title, Amount = p.Amount, IsActive = p.IsActive, CreatedAt = p.CreatedAt },
            Models.Entities.Media.PhotoAlbum pa => new GenericModuleResponseDto { Id = pa.Id, Name = pa.Name, Description = pa.Description, IsActive = true, CreatedAt = pa.CreatedAt },
            Models.Entities.Media.VideoAlbum va => new GenericModuleResponseDto { Id = va.Id, Name = va.Name, Description = va.Description, IsActive = true, CreatedAt = va.CreatedAt },
            Models.Entities.Groups.GroupCategory gc => new GenericModuleResponseDto { Id = gc.Id, Name = gc.Name, Description = gc.Description, IsActive = true },
            Models.Entities.Financial.FinancialCategory fc => new GenericModuleResponseDto { Id = fc.Id, Name = fc.Name, IsActive = true },
            _ => new GenericModuleResponseDto()
        };
    }
}
