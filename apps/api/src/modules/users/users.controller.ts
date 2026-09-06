import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.service';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.view', 'roles.manage')
  async findAll(@CurrentUser() user: AuthUser) {
    const data = await this.usersService.findAll(user.organizationId);
    return { success: true, data };
  }

  @Get('branches')
  @RequirePermissions('users.view')
  async getBranches(@CurrentUser() user: AuthUser) {
    const data = await this.usersService.getBranches(user.organizationId);
    return { success: true, data };
  }

  @Get('organizations')
  async getOrganizations() {
    const data = await this.usersService.getOrganizations();
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('users.view', 'roles.manage')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.usersService.findById(id, user.organizationId);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('users.create', 'roles.manage')
  async create(
    @Body() input: CreateUserDto,
    @CurrentUser() actor: AuthUser,
    @Query('branchId') branchId?: string,
  ) {
    const data = await this.usersService.create(
      actor.organizationId,
      branchId || 'default',
      actor.id,
      input,
    );
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('users.update', 'roles.manage')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateUserDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.update(
      id,
      actor.organizationId,
      actor.id,
      input,
    );
    return { success: true, data };
  }

  @Post(':id/deactivate')
  @RequirePermissions('users.deactivate', 'roles.manage')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.deactivate(
      id,
      actor.organizationId,
      actor.id,
    );
    return { success: true, data };
  }

  @Post(':id/activate')
  @RequirePermissions('users.activate', 'roles.manage')
  async activate(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.activate(
      id,
      actor.organizationId,
      actor.id,
    );
    return { success: true, data };
  }

  @Post(':id/change-password')
  @RequirePermissions('users.change_password')
  async changePassword(
    @Param('id') id: string,
    @Body() input: ChangePasswordDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.changePassword(
      id,
      actor.organizationId,
      actor.id,
      input,
    );
    return { success: true, data };
  }
}
