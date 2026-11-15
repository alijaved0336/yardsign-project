from django.db import models

class Maps(models.Model):
    class Meta:
        managed = False  # No database table is created
        verbose_name_plural = "Maps"
        verbose_name = "Maps"
