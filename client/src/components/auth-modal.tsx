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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-[#b9ff6a]/20 shadow-2xl">
        <DialogHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-[#b9ff6a] rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-black" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#b9ff6a]">
              LITIUM.SPACE
            </DialogTitle>
          </div>
          <p className="text-white/70 text-center text-sm">Современная почтовая система нового поколения</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-[#b9ff6a]/30 rounded-xl p-2 mb-4">
            <TabsTrigger 
              value="login" 
              className="rounded-lg text-white/70 font-semibold transition-all duration-300 data-[state=active]:bg-[#b9ff6a] data-[state=active]:text-black data-[state=active]:shadow-lg hover:text-white"
            >
              Вход в систему
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="rounded-lg text-white/70 font-semibold transition-all duration-300 data-[state=active]:bg-[#b9ff6a] data-[state=active]:text-black data-[state=active]:shadow-lg hover:text-white"
            >
              Создать аккаунт
            </TabsTrigger>
          </TabsList>

          {/* Форма входа */}
          <TabsContent value="login">
            <div className="max-w-md mx-auto">
              <Card className="bg-black border border-[#b9ff6a]/20 shadow-2xl shadow-[#b9ff6a]/10">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-[#b9ff6a] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white mb-1">Вход в систему</CardTitle>
                  <CardDescription className="text-white/60 text-sm">
                    Войдите в свой аккаунт LITIUM.SPACE
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white flex items-center gap-2 text-sm font-medium">
                        <div className="w-6 h-6 bg-[#b9ff6a]/10 rounded-lg flex items-center justify-center border border-[#b9ff6a]/30">
                          <User className="w-3 h-3 text-[#b9ff6a]" />
                        </div>
                        Имя пользователя
                      </Label>
                      <Input
                        id="username"
                        placeholder="Введите имя пользователя"
                        {...loginForm.register("username")}
                        className="h-10 bg-black/50 border border-[#b9ff6a]/30 text-white placeholder:text-white/50 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 rounded-lg transition-all duration-300"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-400 flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">!</span>
                          </div>
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white flex items-center gap-2 text-sm font-medium">
                        <div className="w-6 h-6 bg-[#b9ff6a]/10 rounded-lg flex items-center justify-center border border-[#b9ff6a]/30">
                          <Lock className="w-3 h-3 text-[#b9ff6a]" />
                        </div>
                        Пароль
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Введите пароль"
                        {...loginForm.register("password")}
                        className="h-10 bg-black/50 border border-[#b9ff6a]/30 text-white placeholder:text-white/50 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 rounded-lg transition-all duration-300"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-400 flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">!</span>
                          </div>
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-10 bg-[#b9ff6a] hover:bg-[#b9ff6a]/90 text-black font-bold text-sm rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Входим...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Войти в систему
                        </div>
                      )}
                    </Button>
                  </form>
                  
                  <div className="text-center pt-4">
                    <p className="text-gray-400 text-sm">
                      Нет аккаунта? 
                      <button 
                        onClick={() => setActiveTab("register")}
                        className="text-[#b9ff6a] hover:text-[#8ed653] font-semibold ml-2 transition-colors duration-300"
                      >
                        Создать бесплатно
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Форма регистрации */}
          <TabsContent value="register">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Форма регистрации */}
              <div className="xl:col-span-3">
                <Card className="bg-black border border-[#b9ff6a]/20 shadow-2xl shadow-[#b9ff6a]/10">
                  <CardHeader className="text-center pb-3">
                    <div className="w-12 h-12 bg-[#b9ff6a] rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-6 h-6 text-black" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white mb-1">Создать аккаунт</CardTitle>
                    <CardDescription className="text-white/60 text-sm">
                      Присоединяйтесь к LITIUM.SPACE сегодня
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-white text-sm font-medium">Имя</Label>
                          <Input
                            id="firstName"
                            placeholder="Иван"
                            {...registerForm.register("firstName")}
                            className="h-9 bg-black/50 border border-[#b9ff6a]/30 text-white placeholder:text-white/50 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 rounded-lg transition-all duration-300"
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-400 flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">!</span>
                              </div>
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="lastName" className="text-white text-sm font-medium">Фамилия</Label>
                          <Input
                            id="lastName"
                            placeholder="Иванов"
                            {...registerForm.register("lastName")}
                            className="h-12 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 rounded-xl transition-all duration-300"
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-400 flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">!</span>
                              </div>
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-white flex items-center gap-3 text-sm font-medium">
                          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-[#b9ff6a]" />
                          </div>
                          Имя пользователя
                        </Label>
                        <Input
                          id="username"
                          placeholder="username"
                          {...registerForm.register("username")}
                          className="h-12 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 rounded-xl transition-all duration-300"
                        />
                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/30 p-3 rounded-lg border border-gray-700">
                          <Mail className="w-4 h-4 text-[#b9ff6a]" />
                          Ваш email будет: <span className="text-[#b9ff6a] font-semibold">{registerForm.watch("username") || "username"}@litium.space</span>
                        </div>
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-400 flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">!</span>
                            </div>
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-white flex items-center gap-3 text-sm font-medium">
                          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-[#b9ff6a]" />
                          </div>
                          Email для связи
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ivan@example.com"
                          {...registerForm.register("email")}
                          className="h-12 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 rounded-xl transition-all duration-300"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-400 flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">!</span>
                            </div>
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-white flex items-center gap-3 text-sm font-medium">
                          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                            <Lock className="w-4 h-4 text-[#b9ff6a]" />
                          </div>
                          Пароль
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Создайте надежный пароль"
                          {...registerForm.register("password")}
                          className="h-12 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 rounded-xl transition-all duration-300"
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-400 flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">!</span>
                            </div>
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-[#b9ff6a] to-[#8ed653] hover:from-[#a8e85c] hover:to-[#7dd142] text-black font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Создаем аккаунт...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Создать аккаунт бесплатно
                          </div>
                        )}
                      </Button>
                    </form>
                    
                    <div className="text-center pt-4">
                      <p className="text-gray-400 text-sm">
                        Уже есть аккаунт? 
                        <button 
                          onClick={() => setActiveTab("login")}
                          className="text-[#b9ff6a] hover:text-[#8ed653] font-semibold ml-2 transition-colors duration-300"
                        >
                          Войти
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Тарифные планы */}
              <div className="xl:col-span-2 space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">Выберите тариф</h3>
                  <p className="text-gray-400 text-lg">Начните бесплатно, обновляйтесь по мере роста</p>
                </div>

                <div className="space-y-4">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`relative cursor-pointer transition-all duration-300 border-2 transform hover:scale-105 ${
                        registerForm.watch("plan") === plan.id 
                          ? "border-[#b9ff6a] bg-gradient-to-br from-gray-900 to-black shadow-2xl shadow-[#b9ff6a]/20" 
                          : "border-gray-700 bg-gradient-to-br from-gray-900 to-black hover:border-gray-600 hover:shadow-xl"
                      }`}
                      onClick={() => registerForm.setValue("plan", plan.id as "basic" | "pro" | "enterprise")}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 -right-3">
                          <Badge className="bg-gradient-to-r from-[#b9ff6a] to-[#8ed653] text-black px-3 py-1 text-xs font-bold shadow-lg">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            ПОПУЛЯРНЫЙ
                          </Badge>
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${plan.popular ? 'bg-gradient-to-r from-[#b9ff6a] to-[#8ed653]' : 'bg-gray-800'} text-black`}>
                              {plan.icon}
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-white mb-1">{plan.name}</h4>
                              <p className="text-sm text-gray-400">{plan.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${plan.popular ? 'text-[#b9ff6a]' : 'text-white'}`}>
                              {plan.price}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <div className="w-5 h-5 bg-[#b9ff6a] rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-3 h-3 text-black" />
                              </div>
                              <span className="text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        {registerForm.watch("plan") === plan.id && (
                          <div className="mt-4 p-3 bg-[#b9ff6a]/10 border border-[#b9ff6a]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#b9ff6a] text-sm font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              Выбранный план
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">
                    💡 Все планы включают 30-дневную гарантию возврата средств
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}