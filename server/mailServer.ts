import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { storage } from './storage';
import nodemailer from 'nodemailer';

export class LitiumMailServer {
  private smtpServer: SMTPServer;
  private isRunning = false;
  private config = {
    port: 25,
    secure: false,
    authRequired: true,
    maxClients: 100,
    maxConnections: 100
  };

  constructor() {
    this.smtpServer = new SMTPServer({
      // Требуется аутентификация
      authRequired: this.config.authRequired,
      
      // Разрешить небезопасные соединения (для разработки)
      secure: this.config.secure,
      
      // Аутентификация пользователей
      onAuth: this.handleAuth.bind(this),
      
      // Обработка входящих писем
      onData: this.handleData.bind(this),
      
      // Валидация отправителя
      onMailFrom: this.handleMailFrom.bind(this),
      
      // Валидация получателя
      onRcptTo: this.handleRcptTo.bind(this),
      
      // Настройки сервера
      banner: 'LITIUM.SPACE Mail Server',
      hostname: 'mail.litium.space',
      
      // Ограничения
      size: 10 * 1024 * 1024, // 10MB максимальный размер письма
      
      // Логирование
      logger: console,
    });
  }

  // Аутентификация пользователей
  private async handleAuth(auth: any, session: any, callback: any) {
    try {
      // Извлекаем username из email адреса
      const username = auth.username.split('@')[0];
      
      // Проверяем пользователя в базе данных
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return callback(new Error('Authentication failed - user not found'));
      }

      // Проверяем пароль
      const isValid = await storage.validateUser(username, auth.password);
      
      if (!isValid) {
        return callback(new Error('Authentication failed - invalid password'));
      }

      // Сохраняем информацию о пользователе в сессии
      session.user = user;
      callback(null, { user: auth.username });
    } catch (error) {
      console.error('Auth error:', error);
      callback(new Error('Authentication failed'));
    }
  }

  // Валидация отправителя
  private async handleMailFrom(address: any, session: any, callback: any) {
    try {
      // Проверяем, что отправитель аутентифицирован
      if (!session.user) {
        return callback(new Error('Authentication required'));
      }

      // Проверяем, что отправитель соответствует аутентифицированному пользователю
      const senderUsername = address.address.split('@')[0];
      if (senderUsername !== session.user.username) {
        return callback(new Error('Sender address does not match authenticated user'));
      }

      callback();
    } catch (error) {
      console.error('MailFrom error:', error);
      callback(new Error('Invalid sender'));
    }
  }

  // Валидация получателя
  private async handleRcptTo(address: any, session: any, callback: any) {
    try {
      const recipientEmail = address.address;
      const domain = recipientEmail.split('@')[1];

      // Если письмо для нашего домена, проверяем существование пользователя
      if (domain === 'litium.space') {
        const username = recipientEmail.split('@')[0];
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return callback(new Error('User not found'));
        }
      }
      
      // Разрешаем отправку для внешних доменов (relay)
      callback();
    } catch (error) {
      console.error('RcptTo error:', error);
      callback(new Error('Invalid recipient'));
    }
  }

  // Обработка входящих писем
  private async handleData(stream: any, session: any, callback: any) {
    try {
      // Парсим входящее письмо
      const parsed = await simpleParser(stream);
      
      // Извлекаем данные письма
      const emailData = {
        fromUserId: session.user.id,
        toEmail: parsed.to?.text || '',
        subject: parsed.subject || 'Без темы',
        body: parsed.html || parsed.text || '',
        sentAt: new Date(),
      };

      // Сохраняем письмо в базу данных
      await storage.sendEmail(session.user.id, emailData);
      
      console.log(`Email saved: ${emailData.subject} from ${session.user.username}`);
      callback();
    } catch (error) {
      console.error('Data handling error:', error);
      callback(new Error('Failed to process email'));
    }
  }

  // Запуск SMTP сервера
  public async start(port: number = 25): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.smtpServer.listen(port, () => {
          this.isRunning = true;
          console.log(`LITIUM Mail Server running on port ${port}`);
          resolve();
        });
      } catch (error) {
        console.error('Failed to start mail server:', error);
        reject(error);
      }
    });
  }

  // Остановка сервера
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isRunning) {
        this.smtpServer.close(() => {
          this.isRunning = false;
          console.log('LITIUM Mail Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Отправка писем через собственный SMTP
  public async sendEmail(from: string, to: string, subject: string, body: string): Promise<void> {
    try {
      // Создаем транспорт для отправки через наш собственный SMTP
      const transporter = nodemailer.createTransporter({
        host: 'localhost',
        port: 25,
        secure: false,
        auth: false, // Локальная отправка без аутентификации
      });

      await transporter.sendMail({
        from,
        to,
        subject,
        html: body,
      });

      console.log(`Email sent: ${subject} from ${from} to ${to}`);
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  // Получение статуса сервера
  public getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.config.port,
      config: this.config,
    };
  }
}

// Создаем глобальный экземпляр почтового сервера
export const mailServer = new LitiumMailServer();