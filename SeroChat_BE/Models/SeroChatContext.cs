using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SeroChat_BE.Models;

public partial class SeroChatContext : DbContext
{
    public SeroChatContext()
    {
    }

    public SeroChatContext(DbContextOptions<SeroChatContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Blog> Blogs { get; set; }

    public virtual DbSet<BlogCategory> BlogCategories { get; set; }

    public virtual DbSet<BlogReadHistory> BlogReadHistories { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<CrisisAlertLog> CrisisAlertLogs { get; set; }

    public virtual DbSet<DailyAffirmation> DailyAffirmations { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<DoctorCertificate> DoctorCertificates { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<MoodLog> MoodLogs { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<RelaxAsset> RelaxAssets { get; set; }

    public virtual DbSet<SavedBlog> SavedBlogs { get; set; }

    public virtual DbSet<Specialty> Specialties { get; set; }

    public virtual DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

   protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    if (!optionsBuilder.IsConfigured)
    {
        var ConnectionString = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build().GetConnectionString("DefaultConnection");
        optionsBuilder.UseSqlServer(ConnectionString);
    }
    
}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>(entity =>
        {
            entity.HasKey(e => e.BlogId).HasName("PK__Blogs__2975AA2828BB7B13");

            entity.Property(e => e.BlogId).HasColumnName("blog_id");
            entity.Property(e => e.AuthorName)
                .HasMaxLength(100)
                .HasDefaultValue("SERO Team")
                .HasColumnName("author_name");
            entity.Property(e => e.BlogCatId).HasColumnName("blog_cat_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.ThumbnailUrl).HasColumnName("thumbnail_url");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.HasOne(d => d.BlogCat).WithMany(p => p.Blogs)
                .HasForeignKey(d => d.BlogCatId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Blog_Category");
        });

        modelBuilder.Entity<BlogCategory>(entity =>
        {
            entity.HasKey(e => e.BlogCatId).HasName("PK__Blog_Cat__C094FB0C1B8D3558");

            entity.ToTable("Blog_Categories");

            entity.HasIndex(e => e.CategoryName, "UQ__Blog_Cat__5189E255B360D61F").IsUnique();

            entity.Property(e => e.BlogCatId).HasColumnName("blog_cat_id");
            entity.Property(e => e.CategoryName)
                .HasMaxLength(100)
                .HasColumnName("category_name");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
        });

        modelBuilder.Entity<BlogReadHistory>(entity =>
        {
            entity.HasKey(e => e.ReadId).HasName("PK__Blog_Rea__EE06FA1B3F7A1A73");

            entity.ToTable("Blog_Read_History");

            entity.Property(e => e.ReadId).HasColumnName("read_id");
            entity.Property(e => e.BlogId).HasColumnName("blog_id");
            entity.Property(e => e.ReadAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("read_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Blog).WithMany(p => p.BlogReadHistories)
                .HasForeignKey(d => d.BlogId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ReadHistory_Blog");

            entity.HasOne(d => d.User).WithMany(p => p.BlogReadHistories)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ReadHistory_User");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.ConvId).HasName("PK__Conversa__E990F1A679A9B959");

            entity.Property(e => e.ConvId).HasColumnName("conv_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasDefaultValue("Cuộc trò chuyện mới")
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Conversations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Conv_User");
        });

        modelBuilder.Entity<CrisisAlertLog>(entity =>
        {
            entity.HasKey(e => e.AlertId).HasName("PK__Crisis_A__4B8FB03AA44F5D61");

            entity.ToTable("Crisis_Alert_Logs");

            entity.Property(e => e.AlertId).HasColumnName("alert_id");
            entity.Property(e => e.AlertTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("alert_time");
            entity.Property(e => e.IsResolved)
                .HasDefaultValue(false)
                .HasColumnName("is_resolved");
            entity.Property(e => e.MsgId).HasColumnName("msg_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Msg).WithMany(p => p.CrisisAlertLogs)
                .HasForeignKey(d => d.MsgId)
                .HasConstraintName("FK_Alert_Msg");

            entity.HasOne(d => d.User).WithMany(p => p.CrisisAlertLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Alert_User");
        });

        modelBuilder.Entity<DailyAffirmation>(entity =>
        {
            entity.HasKey(e => e.AffId).HasName("PK__Daily_Af__E38F231BDF52DEC3");

            entity.ToTable("Daily_Affirmations");

            entity.Property(e => e.AffId).HasColumnName("aff_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.DoctorId).HasName("PK__Doctors__F3993564793A1723");

            entity.Property(e => e.DoctorId).HasColumnName("doctor_id");
            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .HasColumnName("address");
            entity.Property(e => e.BioDetail).HasColumnName("bio_detail");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ExperienceYears)
                .HasDefaultValue(0)
                .HasColumnName("experience_years");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone");
            entity.Property(e => e.SpecialtyId).HasColumnName("specialty_id");
            entity.Property(e => e.ZaloUrl).HasColumnName("zalo_url");

            entity.HasOne(d => d.Specialty).WithMany(p => p.Doctors)
                .HasForeignKey(d => d.SpecialtyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Doctor_Specialty");
        });

        modelBuilder.Entity<DoctorCertificate>(entity =>
        {
            entity.HasKey(e => e.CertId).HasName("PK__Doctor_C__024B46EC3F010898");

            entity.ToTable("Doctor_Certificates");

            entity.Property(e => e.CertId).HasColumnName("cert_id");
            entity.Property(e => e.CertificateName)
                .HasMaxLength(200)
                .HasColumnName("certificate_name");
            entity.Property(e => e.DoctorId).HasColumnName("doctor_id");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("uploaded_at");

            entity.HasOne(d => d.Doctor).WithMany(p => p.DoctorCertificates)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cert_Doctor");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.MsgId).HasName("PK__Messages__9CA9728D7B2A5329");

            entity.Property(e => e.MsgId).HasColumnName("msg_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.ConvId).HasColumnName("conv_id");
            entity.Property(e => e.IsCrisisDetected)
                .HasDefaultValue(false)
                .HasColumnName("is_crisis_detected");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.SenderType)
                .HasMaxLength(10)
                .HasColumnName("sender_type");
            entity.Property(e => e.SentAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("sent_at");

            entity.HasOne(d => d.Conv).WithMany(p => p.Messages)
                .HasForeignKey(d => d.ConvId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Msg_Conv");
        });

        modelBuilder.Entity<MoodLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__Mood_Log__9E2397E025FCE819");

            entity.ToTable("Mood_Logs");

            entity.Property(e => e.LogId).HasColumnName("log_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.MoodScore).HasColumnName("mood_score");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.MoodLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Mood_User");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotifyId).HasName("PK__Notifica__DD351C96A6B13406");

            entity.Property(e => e.NotifyId).HasColumnName("notify_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notify_User");
        });

        modelBuilder.Entity<RelaxAsset>(entity =>
        {
            entity.HasKey(e => e.AssetId).HasName("PK__Relax_As__D28B561D34D7036A");

            entity.ToTable("Relax_Assets");

            entity.Property(e => e.AssetId).HasColumnName("asset_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.IsPremium)
                .HasDefaultValue(false)
                .HasColumnName("is_premium");
            entity.Property(e => e.MediaUrl).HasColumnName("media_url");
            entity.Property(e => e.ThumbnailUrl).HasColumnName("thumbnail_url");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasColumnName("title");
            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .HasColumnName("type");
        });

        modelBuilder.Entity<SavedBlog>(entity =>
        {
            entity.HasKey(e => e.SavedId).HasName("PK__Saved_Bl__04DC0EE7B2BFAD1A");

            entity.ToTable("Saved_Blogs");

            entity.HasIndex(e => new { e.UserId, e.BlogId }, "UQ_User_Blog").IsUnique();

            entity.Property(e => e.SavedId).HasColumnName("saved_id");
            entity.Property(e => e.BlogId).HasColumnName("blog_id");
            entity.Property(e => e.SavedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("saved_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Blog).WithMany(p => p.SavedBlogs)
                .HasForeignKey(d => d.BlogId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SavedBlog_Blog");

            entity.HasOne(d => d.User).WithMany(p => p.SavedBlogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SavedBlog_User");
        });

        modelBuilder.Entity<Specialty>(entity =>
        {
            entity.HasKey(e => e.SpecialtyId).HasName("PK__Specialt__B90D8D126C46113A");

            entity.HasIndex(e => e.SpecialtyName, "UQ__Specialt__9F30F79C87E1B765").IsUnique();

            entity.Property(e => e.SpecialtyId).HasColumnName("specialty_id");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.SpecialtyName)
                .HasMaxLength(100)
                .HasColumnName("specialty_name");
        });

        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.HasKey(e => e.PlanId).HasName("PK__Subscrip__BE9F8F1D24CF96D0");

            entity.ToTable("Subscription_Plans");

            entity.Property(e => e.PlanId).HasColumnName("plan_id");
            entity.Property(e => e.DailyMessageLimit)
                .HasDefaultValue(20)
                .HasColumnName("daily_message_limit");
            entity.Property(e => e.DurationDays).HasColumnName("duration_days");
            entity.Property(e => e.PlanName)
                .HasMaxLength(100)
                .HasColumnName("plan_name");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.OrderCode).HasName("PK__Transact__99D12D3EC05E3D07");

            entity.Property(e => e.OrderCode)
                .ValueGeneratedNever()
                .HasColumnName("order_code");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.PlanId).HasColumnName("plan_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("PENDING")
                .HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Plan).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.PlanId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trans_Plan");

            entity.HasOne(d => d.User).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trans_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370FEAE429E9");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E6164661CE4CB").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.AuthProvider)
                .HasMaxLength(20)
                .HasDefaultValue("LOCAL")
                .HasColumnName("auth_provider");
            entity.Property(e => e.AvatarUrl).HasColumnName("avatar_url");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Gender)
                .HasMaxLength(20)
                .HasColumnName("gender");
            entity.Property(e => e.GoogleId)
                .HasMaxLength(255)
                .HasColumnName("google_id");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.IsVerify)
                .HasDefaultValue(false)
                .HasColumnName("is_verify");
            entity.Property(e => e.Language)
                .HasMaxLength(10)
                .HasDefaultValue("vi")
                .HasColumnName("language");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("phone_number");
            entity.Property(e => e.PremiumExpiry)
                .HasColumnType("datetime")
                .HasColumnName("premium_expiry");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValue("USER")
                .HasColumnName("role");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("ACTIVE")
                .HasColumnName("status");
            entity.Property(e => e.SubscriptionStatus)
                .HasMaxLength(20)
                .HasDefaultValue("FREE")
                .HasColumnName("subscription_status");
            entity.Property(e => e.Theme)
                .HasMaxLength(20)
                .HasDefaultValue("LIGHT")
                .HasColumnName("theme");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
