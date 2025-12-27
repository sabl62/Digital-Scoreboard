from django.urls import path
from backend.myapp import views

urlpatterns = [
    path('get/', views.get_scoreboard_data, name='get_scoreboard'),
    path('update/', views.update_scoreboard, name='update_scoreboard'),
    path('reset/', views.reset_scoreboard, name='reset_scoreboard'),
    path('tick/', views.increment_time, name='increment_time'),
    path('name/', views.player_name, name = 'player_name'),
]