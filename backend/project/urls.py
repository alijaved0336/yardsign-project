"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from maps.views import MapsView
from django.contrib.auth.views import LogoutView

from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.urls import get_resolver
from django.views.generic import RedirectView

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_root(request):
    resolver = get_resolver() 
    api_patterns = []
    for url_pattern in resolver.url_patterns:
        if hasattr(url_pattern, 'url_patterns') and url_pattern.pattern._route == 'api/':
            for sub_pattern in url_pattern.url_patterns:
                api_patterns.append(str(sub_pattern.pattern))
    
    return Response({"endpoints": api_patterns})

urlpatterns = [
    path('admin/maps/', MapsView.as_view(), name = 'admin_maps'),
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('api/', api_root),
    path('', include('accounts.urls')),
    path('api/', include('accounts.urls')), 
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path('logout/', LogoutView.as_view(), name='logout'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)