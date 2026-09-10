from django.db import models


class DashboardWidget(models.Model):
    """Model for dashboard widgets configuration."""
    WIDGET_TYPES = [
        ('kpi', 'KPI Card'),
        ('chart', 'Chart'),
        ('table', 'Table'),
        ('trend', 'Trend'),
    ]
    name = models.CharField(max_length=100)
    widget_type = models.CharField(max_length=20, choices=WIDGET_TYPES)
    data_source = models.CharField(max_length=200)
    refresh_interval = models.IntegerField(default=60)  # seconds
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class DashboardLayout(models.Model):
    """Model for storing user dashboard layouts."""
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    layout_config = models.JSONField(default=dict)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"
