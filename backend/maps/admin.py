from django.contrib import admin
from django.urls import reverse
from django.http import HttpResponseRedirect
from .maps import Maps

@admin.register(Maps)
class MapsAdmin(admin.ModelAdmin):
    def changelist_view(self, request, extra_context = None):
        return HttpResponseRedirect(reverse('admin_maps'))