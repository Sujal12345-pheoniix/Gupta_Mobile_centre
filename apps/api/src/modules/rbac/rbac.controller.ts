import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/guards/permissions.guard';
import { RbacService } from './rbac.service';
import { CreateRoleInput, UpdateRoleInput, AssignRoleInput } from './dto';

@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ============ Roles ============

  @Get('roles')
  @RequirePermissions('roles.manage', 'roles.view')
  async getRoles() {
    const data = await this.rbacService.getRoles();
    return { success: true, data };
  }

  @Get('roles/:id')
  @RequirePermissions('roles.manage', 'roles.view')
  async getRole(@Param('id') id: string) {
    const data = await this.rbacService.getRole(id);
    return { success: true, data };
  }

  @Post('roles')
  @RequirePermissions('roles.manage')
  async createRole(@Body() input: CreateRoleInput) {
    const data = await this.rbacService.createRole('system', input);
    return { success: true, data };
  }

  @Patch('roles/:id')
  @RequirePermissions('roles.manage')
  async updateRole(@Param('id') id: string, @Body() input: UpdateRoleInput) {
    const data = await this.rbacService.updateRole(id, input);
    return { success: true, data };
  }

  // ============ Permissions ============

  @Get('permissions')
  @RequirePermissions('roles.manage', 'roles.view')
  async getPermissions() {
    const data = await this.rbacService.getPermissions();
    return { success: true, data };
  }

  // ============ User Role Assignment ============

  @Get('users/:userId/roles')
  @RequirePermissions('roles.manage', 'users.view')
  async getUserRoles(@Param('userId') userId: string) {
    const data = await this.rbacService.getUserRoles(userId);
    return { success: true, data };
  }

  @Post('users/:userId/roles')
  @RequirePermissions('roles.manage')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() input: AssignRoleInput,
  ) {
    const data = await this.rbacService.assignRoleToUser(userId, input);
    return { success: true, data };
  }

  @Delete('users/:userId/roles/:roleId')
  @RequirePermissions('roles.manage')
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    const data = await this.rbacService.removeRoleFromUser(userId, roleId);
    return { success: true, data };
  }
}
