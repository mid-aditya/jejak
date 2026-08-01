import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const dialect = configService.get('DB_DIALECT', 'mysql');

  if (dialect === 'sqlite') {
    return {
      type: 'better-sqlite3',
      database: configService.get('DB_STORAGE', './data/jejak.sqlite'),
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    };
  }

  // MySQL / MariaDB for production
  return {
    type: 'mysql',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get('DB_USERNAME', 'root'),
    password: configService.get('DB_PASSWORD', ''),
    database: configService.get('DB_DATABASE', 'jejak'),
    charset: 'utf8mb4',
    autoLoadEntities: true,
    synchronize: true,
    logging: configService.get('NODE_ENV') === 'development',
    migrationsRun: false,
    migrationsTableName: 'migrations',
  };
};
