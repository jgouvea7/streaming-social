import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { VideosService } from 'src/videos/videos.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private videoService: VideosService
  ){}

  async create(videoID: string, userID: string, createCommentDto: CreateCommentDto) {
    const video = await this.videoService.findVideoByID(videoID);
    if (!video) {
      throw new NotFoundException("Vídeo não encontrado");
    }

    const comment = this.commentRepository.create({
      video,
      user: { id: userID },
      comment: createCommentDto.comment,
    });

    await this.commentRepository.save(comment);

    return {
      message: "Comentário publicado com sucesso",
      id: comment.id,
    };
  }

  async findCommentById(commentID: string) {
    const comment = await this.commentRepository.findOneBy({ id: commentID });
    if (!comment) {
      throw new NotFoundException("Comentário não encontrado")
    }

    return comment
  }

  async updateCommentById(commentID: string, userID: string ,updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentID },
      relations: ['user']
    })

    if (!comment) {
      throw new NotFoundException("Comentário não encontrado")
    }

    if ( comment.user.id !== userID) {
      throw new ForbiddenException('Você não tem permissão para editar este comentario');
    }

    const { likeCount,...data} = updateCommentDto

    Object.assign(comment, data)
    comment.edited = true
    await this.commentRepository.save(comment)
    
    return {
      message: "Comentario alterado com sucesso"
    }
  }

  async updateLikeComment(commentID: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOneBy({ id: commentID })
    if (!comment) {
      throw new NotFoundException("Comentário não encontrado")
    }

    Object.assign(comment, updateCommentDto)

    await this.commentRepository.save(comment) 

    return
  }

  

  async remove(commentID: string) {
    const comment = await this.commentRepository.findOneBy({ id: commentID })
    if (!comment) {
      throw new NotFoundException("Comentário não encontrado")
    }

    await this.commentRepository.delete(comment.id)

    return {
      message: "Comentário deletado com sucesso"
    }

  }
}
