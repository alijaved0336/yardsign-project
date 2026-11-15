from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

class MapsView(LoginRequiredMixin, TemplateView):
    template_name = "map_dashboard/index.html"
    login_url = '/admin/' 
    redirect_field_name = 'next'