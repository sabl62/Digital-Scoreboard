from django.urls import path
from . import views

urlpatterns = [
    path('update/', views.update_scoreboard, name='update_scoreboard'),
    path('get/', views.get_scoreboard, name='get_scoreboard'),
    path('increment/', views.increment_score, name='increment_score'),
    path('reset/', views.reset_scoreboard, name='reset_scoreboard'),
    path('timer/', views.update_timer, name='update_timer'),
]