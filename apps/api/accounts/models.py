from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from mpowered_api.base_models import BaseModel, SoftDeleteModel


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, phone_number, display_name, pin = None, **extra):
        if not phone_number:
            raise ValueError("A user needs a phone number")
        user = self.model(phone_number = phone_number, display_name = display_name, **extra)
        user.set_password(pin)
        user.save(using = self._db)
        return user

    def create_superuser(self, phone_number, display_name, pin=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("is_active", True)

        if extra.get("is_staff") is not True:
            raise ValueError("A superuser must have is_staff = True.")

        if extra.get("is_superuser") is not True:
            raise ValueError("A superuser must have is_superuser = True.")

        return self.create_user(phone_number, display_name, pin, **extra)



class User(AbstractBaseUser, PermissionsMixin, BaseModel, SoftDeleteModel):
    phone_number = models.CharField(max_length = 20)
    display_name = models.CharField(max_length = 120)
    email = models.EmailField(blank = True, null = True)
    is_active = models.BooleanField(default = True)
    is_staff = models.BooleanField(default = False)

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["display_name"]

    objects = UserManager()

    class Meta:
        db_table = "app_user"
        constraints = [ models.UniqueConstraint(fields = ["phone_number"], condition = models.Q(deleted_at__isnull = True), name = "user_phone_live")]



class PatientProfile(BaseModel, SoftDeleteModel):

    class AssignedGender(models.TextChoices):
        FEMALE = "female", "Female"
        MALE = "male", "Male"
        INTERSEX = "intersex", "Intersex"
        UNDISCLOSED = "undisclosed", "Prefer not to say"

    user = models.OneToOneField(User, on_delete = models.PROTECT, related_name = "patient_profile")
    has_diagnosis = models.BooleanField(default = False)
    other_conditions = models.TextField(blank = True)
    pain_types = models.ManyToManyField("reference.PainType", blank = True, related_name = "patient_profiles")
    assigned_gender_at_birth = models.CharField(max_length = 40, choices = AssignedGender.choices, blank = True)
    birth_year = models.SmallIntegerField(null = True, blank = True, validators = [MinValueValidator(1900), MaxValueValidator(2100)])

    class Meta:
        db_table = "patient_profile"



class UserSettings(BaseModel):
    user = models.OneToOneField(User, on_delete = models.CASCADE, related_name = "settings")
    high_contrast = models.BooleanField(default = False)
    offline_backup = models.BooleanField(default = True)
    microphone_access = models.BooleanField(default = False)
    notifications_enabled = models.BooleanField(default = True)
    text_size_percent = models.PositiveSmallIntegerField(default=100, validators=[MinValueValidator(100), MaxValueValidator(400)],)

    class Meta:
        db_table = "user_settings"



class SupportLink(BaseModel):

    class Status(models.TextChoices):
        INVITED = "invited"
        ACTIVE = "active"
        REVOKED = "revoked"

    patient_profile = models.ForeignKey(PatientProfile, on_delete = models.PROTECT, related_name = "support_links")
    patient_user = models.ForeignKey(User, on_delete = models.PROTECT, related_name = "+")
    supporter_user = models.ForeignKey(User, on_delete = models.PROTECT, related_name = "supporting")
    status = models.CharField(max_length = 10, choices = Status.choices, default = Status.INVITED)
    invited_at = models.DateTimeField(auto_now_add = True)
    accepted_at = models.DateTimeField(null = True, blank = True)
    revoked_at = models.DateTimeField(null = True, blank = True)

    class Meta:
        db_table = "support_link"
        constraints = [
            # Stops user from supporting themself
            models.CheckConstraint(condition=~models.Q(patient_user = models.F("supporter_user")), name = "no_self_support"),
            # Stops the same person being added twice
            models.UniqueConstraint(fields = ["patient_profile", "supporter_user"], name = "one_link_per_pair"),
        ]
        indexes = [
            # People I support
            models.Index(fields = ["supporter_user", "status"], name = "support_by_supporter_idx"),
            # My Support people
            models.Index(fields = ["patient_profile"], name = "support_by_patient_idx"),
        ]



class TermsAndPrivacy(BaseModel):

    class Document(models.TextChoices):
        TERMS = "terms", "Terms of Service"
        PRIVACY = "privacy", "Privacy Policy"

    user = models.ForeignKey(
        User, on_delete = models.PROTECT, related_name = "terms_and_privacy"
    )
    document_type = models.CharField(max_length = 20, choices = Document.choices)
    document_version = models.CharField(max_length = 40)
    accepted_at = models.DateTimeField(auto_now_add = True)

    class Meta:
        db_table = "terms_and_privacy"
        constraints = [
            models.UniqueConstraint(
                fields = ["user", "document_type", "document_version"],
                name = "one_consent_per_document_version",
            )
        ]
