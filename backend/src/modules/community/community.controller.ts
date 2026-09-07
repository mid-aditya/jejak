import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommunityService } from './community.service';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // Categories
  @Get('categories')
  async getCategories() {
    return this.communityService.getCategories();
  }

  // Threads
  @Get('threads')
  async getThreads(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.communityService.getThreads(categoryId, search);
  }

  @Get('threads/:id')
  async getThread(@Param('id') id: string) {
    return this.communityService.getThreadById(id);
  }

  @Post('threads')
  async createThread(
    @Body() dto: { title: string; content: string; categoryId: string },
    @Request() req: any,
  ) {
    return this.communityService.createThread({
      ...dto,
      authorId: req.user.id,
    });
  }

  @Post('threads/:id/report')
  async reportThread(@Param('id') id: string) {
    await this.communityService.reportThread(id);
    return { message: 'Thread berhasil dilaporkan' };
  }

  @Delete('threads/:id')
  async deleteThread(@Param('id') id: string, @Request() req: any) {
    await this.communityService.deleteThread(id);
    return { message: 'Thread berhasil dihapus' };
  }

  // Posts
  @Get('threads/:threadId/posts')
  async getPosts(@Param('threadId') threadId: string) {
    return this.communityService.getPosts(threadId);
  }

  @Post('posts')
  async createPost(
    @Body() dto: { content: string; threadId: string },
    @Request() req: any,
  ) {
    return this.communityService.createPost({
      ...dto,
      authorId: req.user.id,
    });
  }

  @Post('posts/:id/report')
  async reportPost(@Param('id') id: string) {
    await this.communityService.reportPost(id);
    return { message: 'Post berhasil dilaporkan' };
  }
}
