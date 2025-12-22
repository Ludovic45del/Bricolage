import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsQueryDto, CreateRentalDto, UpdateRentalDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@Controller('rentals')
@UseGuards(JwtAuthGuard)
export class RentalsController {
    constructor(private rentalsService: RentalsService) { }

    @Get()
    async findAll(@Query() query: RentalsQueryDto, @CurrentUser() currentUser: any) {
        return this.rentalsService.findAll(query, currentUser);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: any,
    ) {
        return this.rentalsService.findOne(id, currentUser);
    }

    @Post()
    async create(@Body() dto: CreateRentalDto, @CurrentUser() currentUser: any) {
        return this.rentalsService.create(dto, currentUser);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateRentalDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.rentalsService.update(id, dto, currentUser);
    }

    @Post(':id/return')
    async returnRental(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: { endDate?: string; comment?: string },
        @CurrentUser() currentUser: any,
    ) {
        return this.rentalsService.returnRental(id, dto, currentUser);
    }
}
