import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/v1/')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('comments/:id')
  @UseGuards(AuthGuard)
  create(
  @Param('id') videoID: string,
  @Request() req,
  @Body() createCommentDto: CreateCommentDto,
  ) {
    const userID = req.user.sub;
    return this.commentsService.create(videoID, userID, createCommentDto);
  }


  @Patch('comments/:id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string, 
    @Request() req,
    @Body() updateCommentDto: UpdateCommentDto) {
      const userID = req.user.sub
      return this.commentsService.updateCommentById(id, userID, updateCommentDto);
  }

  @Delete('comments/:commentID')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
