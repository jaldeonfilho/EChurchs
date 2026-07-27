namespace Echurchs.Models.Enums
{
    public enum CommunityRole
    {
        Admin = 0,
        FinancialManager = 1,
        Leader = 2,
        Member = 3
    }

    public enum MembershipStatus
    {
        Pending = 0,
        Active = 1,
        Rejected = 2,
        Left = 3
    }

    public enum FriendshipStatus
    {
        Pending = 0,
        Accepted = 1,
        Rejected = 2,
        Blocked = 3
    }

    public enum PlanType
    {
        Free = 0,
        Silver = 1,
        Gold = 2,
        Diamond = 3
    }

    public enum BillingCycle
    {
        Monthly = 0,
        Yearly = 1
    }

    public enum SubscriptionStatus
    {
        Active = 0,
        PastDue = 1,
        Cancelled = 2,
        Trial = 3
    }

    public enum FieldType
    {
        Text = 0,
        Number = 1,
        Date = 2,
        Select = 3,
        MultiSelect = 4,
        Email = 5,
        Phone = 6,
        Textarea = 7,
        Checkbox = 8,
        File = 9
    }

    public enum TransactionType
    {
        Tithe = 0,
        Offering = 1,
        Expense = 2,
        Donation = 3,
        Other = 4
    }

    public enum TransactionCategoryType
    {
        Income = 0,
        Expense = 1
    }

    public enum PaymentMethod
    {
        Cash = 0,
        MBWay = 1,
        BankTransfer = 2,
        CreditCard = 3,
        Multibanco = 4
    }

    public enum AssetStatus
    {
        Active = 0,
        Sold = 1,
        Discarded = 2,
        UnderMaintenance = 3
    }

    public enum LiveServiceStatus
    {
        Scheduled = 0,
        Live = 1,
        Ended = 2,
        Cancelled = 3
    }

    public enum ClassStatus
    {
        Active = 0,
        Completed = 1,
        Dropped = 2
    }

    public enum RegistrationStatus
    {
        Registered = 0,
        Cancelled = 1,
        Waitlisted = 2
    }

    public enum DayOfWeek
    {
        Sunday = 0,
        Monday = 1,
        Tuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6
    }

    public enum Frequency
    {
        Weekly = 0,
        Biweekly = 1,
        Monthly = 2
    }

    public enum GroupMemberRole
    {
        Leader = 0,
        CoLeader = 1,
        Member = 2
    }

    public enum PaymentGatewayProvider
    {
        Stripe = 0,
        SIBS = 1,
        Easypay = 2
    }

    public enum DonationStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = 2,
        Refunded = 3
    }

    public enum BulletinStatus
    {
        Draft = 0,
        Published = 1,
        Archived = 2
    }

    public enum PostType
    {
        Live = 0,
        Media = 1,
        Event = 2
    }
}
