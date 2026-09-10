from django.db import models


class SMTLine(models.Model):
    """SMT line model."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SMTMachine(models.Model):
    """SMT machine model."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    line = models.ForeignKey(SMTLine, on_delete=models.CASCADE, related_name='machines')
    machine_type = models.CharField(max_length=50)  # printer, mounter, reflow, etc.
    status = models.CharField(max_length=20, default='idle')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SMTProduction(models.Model):
    """SMT production data."""
    line = models.ForeignKey(SMTLine, on_delete=models.CASCADE)
    machine = models.ForeignKey(SMTMachine, on_delete=models.CASCADE)
    product_code = models.CharField(max_length=50)
    pcb_count = models.IntegerField(default=0)
    component_count = models.IntegerField(default=0)
    defect_count = models.IntegerField(default=0)
    date = models.DateField()
    shift = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.line.name} - {self.date}"


class SMTDowntime(models.Model):
    """SMT downtime tracking."""
    line = models.ForeignKey(SMTLine, on_delete=models.CASCADE)
    machine = models.ForeignKey(SMTMachine, on_delete=models.CASCADE)
    reason = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    duration_minutes = models.IntegerField(default=0)
    date = models.DateField()

    def __str__(self):
        return f"{self.line.name} - {self.reason}"


class SMTDefect(models.Model):
    """SMT defect tracking."""
    line = models.ForeignKey(SMTLine, on_delete=models.CASCADE)
    machine = models.ForeignKey(SMTMachine, on_delete=models.CASCADE)
    defect_type = models.CharField(max_length=100)
    quantity = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.line.name} - {self.defect_type}"
