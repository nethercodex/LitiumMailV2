import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Mail, Shield, Lock, Key, Phone, ArrowLeft, Eye, EyeOff, AlertTriangle, CheckCircle, LogOut, User, Monitor, Globe, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import type { UserSession } from "@shared/schema";

interface SecurityStatus {
  securityScore: number;
  twoFactorEnabled: boolean;
  phoneVerified: boolean;
  activeSessions: number;
  lastPasswordChange: string;
  securityAlerts: string[];
}

export default function Security() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Загружаем общие настройки для отображения названия сайта
  const { data: generalSettings } = useQuery({
    queryKey: ["/api/admin/settings/general"],
    retry: false,
  });

  // Load user sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<UserSession[]>({
    queryKey: ["/api/sessions"],
    enabled: !!user,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
    },
  });

  // Load security status
  const { data: securityStatus, isLoading: securityLoading } = useQuery<SecurityStatus>({
    queryKey: ["/api/security/status"],
    enabled: !!user,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Пароль изменен",
        description: "Ваш пароль успешно обновлен",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/security/status"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить пароль",
        variant: "destructive",
      });
    },
  });

  // Session management mutation
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest("DELETE", `/api/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/status"] });
      toast({
        title: "Сессия завершена",
        description: "Сессия успешно завершена",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось завершить сессию",
        variant: "destructive",
      });
    },
  });

  // Terminate all sessions
  const terminateAllSessionsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/sessions/terminate-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/status"] });
      toast({
        title: "Все сессии завершены",
        description: "Все активные сессии успешно завершены",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось завершить все сессии",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Новые пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 8 символов",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Неизвестный';
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#b9ff6a]';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return 'Высокий';
    if (score >= 60) return 'Средний';
    return 'Низкий';
  };

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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-[#b9ff6a]/20 animate-pulse">
            <Shield className="text-black h-8 w-8" />
          </div>
          <p className="text-gray-400 text-lg">Загрузка настроек безопасности...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-black/40 backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                <Mail className="text-black h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] bg-clip-text text-transparent">
                {generalSettings?.siteName || 'LITIUM.SPACE'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-[#b9ff6a]" />
            <h1 className="text-xl font-semibold text-white">Безопасность</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Смена пароля */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                    <Lock className="w-5 h-5 text-black" />
                  </div>
                  <span>Смена пароля</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="currentPassword" className="text-gray-200 text-sm font-medium">Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Введите текущий пароль"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-12 h-12 backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="newPassword" className="text-gray-200 text-sm font-medium">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Создайте новый пароль"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-12 h-12 backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-gray-200 text-sm font-medium">Подтвердите новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Повторите новый пароль"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-12 h-12 backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-[#b9ff6a]/10 to-[#a8e659]/10 border border-[#b9ff6a]/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-[#b9ff6a]" />
                    <p className="text-sm text-[#b9ff6a] font-medium">Требования к паролю:</p>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-1.5">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Минимум 8 символов</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Содержит заглавные и строчные буквы</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Содержит цифры</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Содержит специальные символы</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#97d548] font-semibold h-12 rounded-xl shadow-lg shadow-[#b9ff6a]/20 transition-all duration-200 disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? "Обновление..." : "Обновить пароль"}
                </Button>
              </CardContent>
            </Card>

            {/* Активные сессии */}
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20 mt-8">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 text-white text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                      <Monitor className="w-5 h-5 text-black" />
                    </div>
                    <span>Активные сессии</span>
                  </CardTitle>
                  {sessions.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => terminateAllSessionsMutation.mutate()}
                      disabled={terminateAllSessionsMutation.isPending}
                      className="bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30"
                    >
                      {terminateAllSessionsMutation.isPending ? "Завершение..." : "Завершить все"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Загрузка сессий...</div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Активных сессий не найдено</div>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-900/40 border border-gray-700/40 rounded-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                          {getDeviceIcon(session.userAgent || '')}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {getBrowserName(session.userAgent || '')} • {session.ipAddress || 'Неизвестный IP'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Последняя активность: {new Date(session.lastActivity || '').toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.isActive && (
                          <Badge className="bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/30">
                            Текущая
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => terminateSessionMutation.mutate(session.id)}
                          disabled={terminateSessionMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Статус безопасности */}
          <div className="space-y-8">
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                    <Key className="w-5 h-5 text-black" />
                  </div>
                  <span>Статус безопасности</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {securityLoading ? (
                  <div className="text-center py-4">
                    <div className="text-gray-400">Загрузка...</div>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${getSecurityScoreColor(securityStatus?.securityScore || 0)}`}>
                        {securityStatus?.securityScore || 0}%
                      </div>
                      <p className="text-gray-300 text-lg font-medium">
                        Уровень безопасности: {getSecurityScoreLabel(securityStatus?.securityScore || 0)}
                      </p>
                    </div>

                    <Separator className="bg-gray-700/40" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Двухфакторная аутентификация</span>
                        <Badge variant={securityStatus?.twoFactorEnabled ? "default" : "outline"} 
                               className={securityStatus?.twoFactorEnabled ? "bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/30" : "bg-orange-500/20 text-orange-300 border-orange-500/40"}>
                          {securityStatus?.twoFactorEnabled ? "Включена" : "Отключена"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Номер телефона</span>
                        <Badge variant={securityStatus?.phoneVerified ? "default" : "outline"}
                               className={securityStatus?.phoneVerified ? "bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/30" : "bg-orange-500/20 text-orange-300 border-orange-500/40"}>
                          {securityStatus?.phoneVerified ? "Подтвержден" : "Не привязан"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Активные сессии</span>
                        <Badge variant="outline" className="bg-gray-700/20 text-gray-300 border-gray-600/40">
                          {securityStatus?.activeSessions || 0}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Последнее изменение пароля</span>
                        <span className="text-sm text-gray-400">
                          {securityStatus?.lastPasswordChange ? 
                            new Date(securityStatus.lastPasswordChange).toLocaleDateString('ru-RU') : 
                            'Никогда'
                          }
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Привязка номера телефона */}
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <span>Номер телефона</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl backdrop-blur-sm">
                  <div>
                    <p className="text-white font-medium">Привязка номера телефона</p>
                    <p className="text-sm text-gray-300">Добавьте номер для восстановления доступа</p>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/40 px-3 py-1">
                    Не привязан
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-gray-200 text-sm font-medium">Номер телефона</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (900) 123-45-67"
                    className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 h-12 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#97d548] font-semibold h-12 rounded-xl shadow-lg shadow-[#b9ff6a]/20 transition-all duration-200">
                  Привязать номер
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}