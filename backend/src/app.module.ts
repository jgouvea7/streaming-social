import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { VideosModule } from './videos/videos.module';
import { Video } from './videos/entities/video.entity';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/entities/comment.entity';
import { AuthModule } from './auth/auth.module';
import { LikesModule } from './likes/likes.module';
import { Like } from './likes/entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'jonnathas1524',
      database: 'streaming_test',
      entities: [User, Video, Comment, Like],
      synchronize: true
    })
    ,UsersModule, VideosModule, CommentsModule, AuthModule, LikesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
