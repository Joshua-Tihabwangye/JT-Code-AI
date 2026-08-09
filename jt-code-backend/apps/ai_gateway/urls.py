from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.ai_gateway.views import (
    ProviderViewSet,
    ModelViewSet,
    ModelPolicyViewSet,
    ModelRunViewSet,
    PromptViewSet,
    EvaluationViewSet,
    CompletionView,
    EmbeddingView,
    AIModelsView,
)

router = DefaultRouter()
router.register(r'providers', ProviderViewSet, basename='provider')
router.register(r'models', ModelViewSet, basename='model')
router.register(r'policies', ModelPolicyViewSet, basename='policy')
router.register(r'runs', ModelRunViewSet, basename='run')
router.register(r'prompts', PromptViewSet, basename='prompt')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')

urlpatterns = [
    path('', include(router.urls)),
    path('completion/', CompletionView.as_view(), name='completion'),
    path('embeddings/', EmbeddingView.as_view(), name='embeddings'),
    path('available-models/', AIModelsView.as_view(), name='available-models'),
]