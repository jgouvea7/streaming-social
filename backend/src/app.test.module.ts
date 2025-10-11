import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { LikesModule } from './likes/likes.module';

import { User } from './users/entities/user.entity';
import { Video } from './videos/entities/video.entity';
import { Comment } from './comments/entities/comment.entity';
import { Like } from './likes/entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, Video, Comment, Like],
      synchronize: true,
      dropSchema: true,
      logging: false,
    }),
    UsersModule,
    VideosModule,
    CommentsModule,
    AuthModule,
    LikesModule,
  ],
})
export class AppModuleIntegration {}
