import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Crown, Mail, Lock, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerSchema, loginSchema, type RegisterData, type LoginData } from "@shared/schema";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Формы
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      plan: "basic",
    },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Мутации
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Ошибка регистрации");
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Добро пожаловать!",
        description: "Аккаунт успешно создан",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Ошибка входа");
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Добро пожаловать!",
        description: "Вход выполнен успешно",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Бесплатно",
      description: "Для личного использования",
      features: ["1 GB хранилища", "50 писем в день", "Базовая поддержка"],
      icon: <Mail className="w-6 h-6" />,
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "₽499/мес",
      description: "Для профессионалов",
      features: ["10 GB хранилища", "Безлимитные письма", "Приоритетная поддержка", "Расширенная безопасность"],
      icon: <Users className="w-6 h-6" />,
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "₽1999/мес",
      description: "Для команд и бизнеса",
      features: ["100 GB хранилища", "Безлимитные письма", "24/7 поддержка", "API доступ", "Аналитика"],
      icon: <Crown className="w-6 h-6" />,
      popular: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Добро пожаловать в LITIUM.SPACE
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#b9ff6a] data-[state=active]:text-black">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-[#b9ff6a] data-[state=active]:text-black">
              Регистрация
            </TabsTrigger>
          </TabsList>

          {/* Форма входа */}
          <TabsContent value="login">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Вход в аккаунт</CardTitle>
                <CardDescription className="text-gray-400">
                  Введите данные для входа в систему
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Имя пользователя
                    </Label>
                    <Input
                      id="username"
                      placeholder="username"
                      {...loginForm.register("username")}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#b9ff6a]"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Пароль
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#b9ff6a]"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#b9ff6a] hover:bg-[#a8e85c] text-black font-semibold"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Форма регистрации */}
          <TabsContent value="register">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Форма регистрации */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Создать аккаунт</CardTitle>
                  <CardDescription className="text-gray-400">
                    Заполните форму для регистрации
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">Имя</Label>
                        <Input
                          id="firstName"
                          placeholder="Иван"
                          {...registerForm.register("firstName")}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#b9ff6a]"
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-400">{registerForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">Фамилия</Label>
                        <Input
                          id="lastName"
                          placeholder="Иванов"
                          {...registerForm.register("lastName")}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#b9ff6a]"
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-400">{registerForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Имя пользователя
                      </Label>
                      <Input
                        id="username"
                        placeholder="username"
                        {...registerForm.register("username")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#b9ff6a]"
                      />
                      <p className="text-xs text-gray-400">Ваш email будет: username@litium.space</p>
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-400">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email для связи
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ivan@example.com"
                        {...registerForm.register("email")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#b9ff6a]"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-400">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Пароль
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...registerForm.register("password")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#b9ff6a]"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-400">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#b9ff6a] hover:bg-[#a8e85c] text-black font-semibold"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Создание..." : "Создать аккаунт"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Тарифные планы */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Выберите тарифный план</h3>
                  <p className="text-gray-400">Начните с бесплатного плана и обновите при необходимости</p>
                </div>

                <div className="space-y-3">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`relative cursor-pointer transition-all border-2 ${
                        registerForm.watch("plan") === plan.id 
                          ? "border-[#b9ff6a] bg-gray-800" 
                          : "border-gray-700 bg-gray-800 hover:border-gray-600"
                      }`}
                      onClick={() => registerForm.setValue("plan", plan.id as "basic" | "pro" | "enterprise")}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-4 bg-[#b9ff6a] text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Популярный
                        </Badge>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#b9ff6a] rounded-lg text-black">
                              {plan.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{plan.name}</h4>
                              <p className="text-sm text-gray-400">{plan.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#b9ff6a]">{plan.price}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-[#b9ff6a]" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}