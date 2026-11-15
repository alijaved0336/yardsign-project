import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

django.setup() 
# Import your routing
try:
    import accounts.routing
    websocket_patterns = accounts.routing.websocket_urlpatterns
except ImportError:
    websocket_patterns = []

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_patterns)
    ),
})