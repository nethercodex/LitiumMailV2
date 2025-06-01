import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Mail, Shield, Lock, Key, Phone, ArrowLeft, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

export default function Security() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              <span className="text-xl font-bold bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] bg-clip-text text-transparent">LITIUM.SPACE</span>
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

                <Button className="w-full bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#97d548] font-semibold h-12 rounded-xl shadow-lg shadow-[#b9ff6a]/20 transition-all duration-200">
                  Обновить пароль
                </Button>
              </CardContent>
            </Card>

            {/* Привязка номера телефона */}
            <Card className="bg-surface border-surface-lighter mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>Номер телефона</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Привязка номера телефона</p>
                    <p className="text-sm text-text-muted">Добавьте номер для восстановления доступа</p>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                    Не привязан
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white text-sm">Номер телефона</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (900) 123-45-67"
                    className="bg-black/50 border border-[#b9ff6a]/30 text-white placeholder:text-white/50 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20"
                  />
                </div>

                <Button className="w-full bg-primary text-dark hover:bg-primary/90 font-medium">
                  Привязать номер
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Статус безопасности */}
          <div>
            <Card className="bg-surface border-surface-lighter">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Key className="w-5 h-5 text-primary" />
                  <span>Статус безопасности</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Пароль</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      Установлен
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Email</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      Подтвержден
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Телефон</span>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                      Не привязан
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">2FA</span>
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                      Отключена
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-orange-300 font-medium mb-2">Рекомендации:</p>
                  <ul className="text-xs text-text-muted space-y-1">
                    <li>• Привяжите номер телефона</li>
                    <li>• Включите двухфакторную аутентификацию</li>
                    <li>• Регулярно меняйте пароль</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Сессии */}
            <Card className="bg-surface border-surface-lighter mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Активные сессии</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-black/30 rounded-lg border border-surface-lighter">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Текущий браузер</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                        Активна
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted">Chrome • Россия, Москва</p>
                    <p className="text-xs text-text-muted">Сегодня в 14:35</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Завершить все сессии
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}