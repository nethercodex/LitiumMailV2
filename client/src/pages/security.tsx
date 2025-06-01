import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Mail, Shield, Lock, Key, Phone, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Security() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
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
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto pulse-glow">
            <Shield className="text-dark h-6 w-6" />
          </div>
          <p className="text-text-muted">Загрузка настроек безопасности...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
          <h1 className="text-lg font-semibold text-white">Безопасность</h1>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Смена пароля */}
          <div className="lg:col-span-2">
            <Card className="bg-surface border-surface-lighter">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>Смена пароля</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white text-sm">Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Введите текущий пароль"
                      className="bg-black/50 border border-[#b9ff6a]/30 text-white placeholder:text-white/50 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-white/50" />
                      ) : (
                        <Eye className="h-4 w-4 text-white/50" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white text-sm">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Создайте новый пароль"
                      className="bg-black/50 border border-[#b9ff6a]/30 text-white placeholder:text-white/50 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-white/50" />
                      ) : (
                        <Eye className="h-4 w-4 text-white/50" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white text-sm">Подтвердите новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Повторите новый пароль"
                      className="bg-black/50 border border-[#b9ff6a]/30 text-white placeholder:text-white/50 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-white/50" />
                      ) : (
                        <Eye className="h-4 w-4 text-white/50" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium mb-2">Требования к паролю:</p>
                  <ul className="text-xs text-text-muted space-y-1">
                    <li>• Минимум 8 символов</li>
                    <li>• Содержит заглавные и строчные буквы</li>
                    <li>• Содержит цифры</li>
                    <li>• Содержит специальные символы</li>
                  </ul>
                </div>

                <Button className="w-full bg-primary text-dark hover:bg-primary/90 font-medium">
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