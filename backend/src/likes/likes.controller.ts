import { Controller, Post, Body, Param, UseGuards, Req, Get,} from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/v1/')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}


  @Post('videos/:id/like')
  @UseGuards(AuthGuard)
  async toggleVideoLike(@Req() req, @Param('id') videoId: string) {
    const userId = req.user.sub;
    return this.likesService.videoLike(userId, videoId);
  }


  @Post('comments/:id/like')
  @UseGuards(AuthGuard)
  async toggleCommentLike(@Req() req, @Param('id') commentId: string) {
    const userId = req.user.sub;
    return this.likesService.commentLike(userId, commentId);
  }

}

