import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { VideosModule } from 'src/videos/videos.module';
import { UsersModule } from 'src/users/users.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), 
    VideosModule, 
    UsersModule,
    CommentsModule
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
