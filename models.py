from django.db import models


class AssemblyLine(models.Model):
    """Assembly line model."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class AssemblyMachine(models.Model):
    """Assembly machine model."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    line = models.ForeignKey(AssemblyLine, on_delete=models.CASCADE, related_name='machines')
    status = models.CharField(max_length=20, default='idle')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class AssemblyProduction(models.Model):
    """Assembly production data."""
    line = models.ForeignKey(AssemblyLine, on_delete=models.CASCADE)
    machine = models.ForeignKey(AssemblyMachine, on_delete=models.CASCADE)
    product_code = models.CharField(max_length=50)
    target_quantity = models.IntegerField(default=0)
    actual_quantity = models.IntegerField(default=0)
    defect_quantity = models.IntegerField(default=0)
    date = models.DateField()
    shift = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.line.name} - {self.date}"


class AssemblyDowntime(models.Model):
    """Assembly downtime tracking."""
    line = models.ForeignKey(AssemblyLine, on_delete=models.CASCADE)
    machine = models.ForeignKey(AssemblyMachine, on_delete=models.CASCADE)
    reason = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    duration_minutes = models.IntegerField(default=0)
    date = models.DateField()

    def __str__(self):
        return f"{self.line.name} - {self.reason}"


class AssemblyDefect(models.Model):
    """Assembly defect tracking."""
    line = models.ForeignKey(AssemblyLine, on_delete=models.CASCADE)
    machine = models.ForeignKey(AssemblyMachine, on_delete=models.CASCADE)
    defect_type = models.CharField(max_length=100)
    quantity = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.line.name} - {self.defect_type}"
