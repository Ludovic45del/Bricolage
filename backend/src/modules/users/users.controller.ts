import {
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryDto, UpdateUserDto, RenewMembershipDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles('admin')
    async findAll(@Query() query: UsersQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: any,
    ) {
        // Members can only view their own profile
        if (currentUser.role !== 'admin' && currentUser.id !== id) {
            return this.usersService.findOne(currentUser.id);
        }
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateUserDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.usersService.update(id, dto, currentUser);
    }

    @Post(':id/renew')
    @Roles('admin')
    async renewMembership(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RenewMembershipDto,
        @CurrentUser('id') adminId: string,
    ) {
        return this.usersService.renewMembership(id, dto, adminId);
    }

    @Delete(':id')
    @Roles('admin')
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.remove(id);
    }
}
