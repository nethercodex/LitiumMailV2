import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, User, Calendar, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { getPlanDisplayName, getPlanPrice } from "@shared/plans";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Запрос данных пользователя напрямую для обхода кеша
  const { data: freshUser, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    refetchInterval: 5000, // Обновлять каждые 5 секунд
    refetchOnWindowFocus: true,
    staleTime: 0 // Считать данные устаревшими сразу
  });
  
  // Используем свежие данные, если они доступны
  const currentUser = freshUser || user;

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Не авторизован",
        description: "Вы не авторизованы. Перенаправляем на страницу входа...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto pulse-glow">
            <User className="text-dark h-6 w-6" />
          </div>
          <p className="text-text-muted">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'pro': return 'bg-primary/20 text-primary border-primary/30';
      case 'enterprise': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="border-b border-surface bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-surface/50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="text-dark h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-primary">LITIUM.SPACE</span>
            </div>
          </div>
          <h1 className="text-lg font-semibold text-white">Профиль пользователя</h1>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="md:col-span-2">
            <Card className="bg-surface border-surface-lighter">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <User className="w-5 h-5 text-primary" />
                  <span>Основная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-muted">Имя</label>
                    <p className="text-white font-medium">{user.firstName || 'Не указано'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">Фамилия</label>
                    <p className="text-white font-medium">{user.lastName || 'Не указано'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-muted">Имя пользователя</label>
                  <p className="text-white font-medium">@{user.username}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-muted">Email для входа в систему</label>
                  <p className="text-white font-medium">{user.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-muted">Email адрес LITIUM.SPACE</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-primary font-bold">{user.username}@litium.space</p>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Активен
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-muted">Дата регистрации</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <p className="text-white">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Не указано'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Информация о плане */}
          <div>
            <Card className="bg-surface border-surface-lighter">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Тарифный план</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className={`${getPlanColor(user.plan)} px-3 py-1 text-sm font-medium border`}>
                    {getPlanDisplayName(user.plan)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Статус аккаунта</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>

                  {user.plan === 'basic' && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary font-medium mb-2">Возможности тарифа:</p>
                      <ul className="text-xs text-text-muted space-y-1">
                        <li>• Базовая почта</li>
                        <li>• 1 GB хранилища</li>
                        <li>• Стандартная поддержка</li>
                      </ul>
                    </div>
                  )}

                  {user.plan === 'pro' && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-300 font-medium mb-2">Возможности тарифа:</p>
                      <ul className="text-xs text-text-muted space-y-1">
                        <li>• Расширенная почта</li>
                        <li>• 10 GB хранилища</li>
                        <li>• Приоритетная поддержка</li>
                        <li>• Дополнительные функции</li>
                      </ul>
                    </div>
                  )}

                  {user.plan === 'enterprise' && (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-sm text-purple-300 font-medium mb-2">Возможности тарифа:</p>
                      <ul className="text-xs text-text-muted space-y-1">
                        <li>• Корпоративная почта</li>
                        <li>• Неограниченное хранилище</li>
                        <li>• 24/7 поддержка</li>
                        <li>• Администрирование</li>
                        <li>• API доступ</li>
                      </ul>
                    </div>
                  )}
                </div>

                <Button className="w-full bg-primary text-dark hover:bg-primary/90 font-medium">
                  Улучшить тариф
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}