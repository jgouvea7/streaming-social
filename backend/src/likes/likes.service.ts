import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { VideosService } from 'src/videos/videos.service';
import { CommentsService } from 'src/comments/comments.service';


@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    private userService: UsersService,
    private videoService: VideosService,
    private commentService: CommentsService
  ){}

  async videoLike(userID: string, videoID: string) {
    const user = await this.userService.findOneByID(userID);
    const video = await this.videoService.findVideoByID(videoID);

    if (!video) throw new NotFoundException('Vídeo não encontrado');
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userID }, video: { id: videoID } },
      relations: ['user', 'video'],
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);

      video.likeCount = Math.max(video.likeCount - 1, 0);
      await this.videoService.updateLikeVideo(video.id, { likeCount: video.likeCount });

      return
    }

    const like = this.likeRepository.create({ user, video });
    await this.likeRepository.save(like);


    video.likeCount += 1;
    await this.videoService.updateLikeVideo(video.id, { likeCount: video.likeCount });

    return

  }

  async commentLike(userID: string, commentID: string) {
    const user = await this.userService.findOneByID(userID);
    const comment = await this.commentService.findCommentById(commentID);

    if (!comment) throw new NotFoundException('Comentario não encontrado');
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userID }, comment: { id: commentID } },
      relations: ['user', 'comment'],
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);

      comment.likeCount = Math.max(comment.likeCount - 1, 0);
      await this.commentService.updateLikeComment(comment.id, { likeCount: comment.likeCount });

      return
    }

    const like = this.likeRepository.create({ user, comment });
    await this.likeRepository.save(like);


    comment.likeCount += 1;
    await this.commentService.updateLikeComment(comment.id, { likeCount: comment.likeCount });

    return

  }

}
