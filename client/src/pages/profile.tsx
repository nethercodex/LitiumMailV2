import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Mail, User, Package, CheckCircle, XCircle, Settings, Edit } from "lucide-react";
import { format, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { getPlanDisplayName } from "@shared/plans";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Неавторизован",
        description: "Вы вышли из системы. Выполняется вход...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Real-time user data fetching
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    refetchInterval: 1000, // Обновляем каждую секунду
    enabled: isAuthenticated
  });

  const changePlanMutation = useMutation({
    mutationFn: async (newPlan: string) => {
      await apiRequest(`/api/users/${user?.id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan: newPlan }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Тарифный план изменен",
        description: "Ваш тарифный план успешно обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить тарифный план",
        variant: "destructive",
      });
    }
  });

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-[#b9ff6a] text-lg">Загрузка профиля...</div>
      </div>
    );
  }

  if (!user || !profileData) {
    return null;
  }

  // Generate initials for avatar
  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const userInitials = getInitials(profileData?.firstName, profileData?.lastName, profileData?.username);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Avatar */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-[#b9ff6a] shadow-2xl">
                <AvatarImage src={profileData?.profileImageUrl || ''} alt={profileData?.username} />
                <AvatarFallback className="text-3xl font-bold bg-[#b9ff6a] text-black">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full bg-[#b9ff6a] text-black hover:bg-[#a8e659] w-10 h-10 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left space-y-3">
              <div>
                <h1 className="text-4xl font-bold text-white">
                  {profileData?.firstName && profileData?.lastName 
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : profileData?.username
                  }
                </h1>
                <p className="text-xl text-[#b9ff6a] font-mono">@{profileData?.username}</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Badge variant="secondary" className="bg-[#b9ff6a] text-black font-medium px-3 py-1">
                  {getPlanDisplayName(profileData?.plan || 'basic')}
                </Badge>
                <Badge variant={profileData?.isActive ? "default" : "destructive"} className="px-3 py-1">
                  {profileData?.isActive ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Активен</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Неактивен</>
                  )}
                </Badge>
              </div>

              <div className="text-gray-400">
                <p className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  {profileData?.username}@litium.space
                </p>
                {profileData?.createdAt && (
                  <p className="flex items-center gap-2 justify-center md:justify-start mt-1">
                    <CalendarDays className="h-4 w-4" />
                    С нами с {format(new Date(profileData.createdAt), 'MMMM yyyy', { locale: ru })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Личная информация
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Основные данные вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Имя</label>
                      <div className="text-white font-medium">{profileData?.firstName || 'Не указано'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Фамилия</label>
                      <div className="text-white font-medium">{profileData?.lastName || 'Не указано'}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Имя пользователя</label>
                      <div className="text-white font-mono font-medium">{profileData?.username}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Контактный Email</label>
                      <div className="text-white font-medium">{profileData?.email}</div>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div>
                  <label className="text-sm text-gray-400">LITIUM Email адрес</label>
                  <div className="text-[#b9ff6a] font-mono font-medium text-lg">
                    {profileData?.username}@litium.space
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="bg-[#b9ff6a] text-black hover:bg-[#a8e659]">
                    <Settings className="h-4 w-4 mr-2" />
                    Редактировать профиль
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Статистика использования
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Ваша активность в системе LITIUM.SPACE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-gray-800">
                    <div className="text-3xl font-bold text-[#b9ff6a] mb-1">0</div>
                    <div className="text-sm text-gray-400">Отправлено писем</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-800">
                    <div className="text-3xl font-bold text-[#b9ff6a] mb-1">0</div>
                    <div className="text-sm text-gray-400">Получено писем</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-800">
                    <div className="text-3xl font-bold text-[#b9ff6a] mb-1">100%</div>
                    <div className="text-sm text-gray-400">Время работы</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Information - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Подписка
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Управление тарифным планом
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-gray-800">
                  <div className="text-lg font-bold text-[#b9ff6a] mb-1">
                    {getPlanDisplayName(profileData?.plan || 'basic')}
                  </div>
                  <div className="text-sm text-gray-400">Текущий план</div>
                </div>
                
                {/* Plan Selection */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm">Изменить план:</h4>
                  {['basic', 'pro', 'enterprise'].map((plan) => (
                    <Button
                      key={plan}
                      variant={profileData?.plan === plan ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-between ${
                        profileData?.plan === plan 
                          ? 'bg-[#b9ff6a] text-black hover:bg-[#a8e659]' 
                          : 'border-gray-700 text-white hover:bg-gray-800'
                      }`}
                      onClick={() => changePlanMutation.mutate(plan)}
                      disabled={changePlanMutation.isPending || profileData?.plan === plan}
                    >
                      <span>{getPlanDisplayName(plan)}</span>
                      {profileData?.plan === plan && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                  ))}
                </div>

                <Separator className="bg-gray-800" />

                <div className="text-center text-sm text-gray-400">
                  {profileData?.createdAt && isValid(new Date(profileData.createdAt)) && (
                    <>
                      Дата регистрации:<br />
                      <span className="text-white">
                        {format(new Date(profileData.createdAt), 'dd MMMM yyyy', { locale: ru })}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}