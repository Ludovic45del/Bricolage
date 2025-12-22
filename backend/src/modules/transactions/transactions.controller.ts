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
import { TransactionsService } from './transactions.service';
import { TransactionsQueryDto, CreateTransactionDto, UpdateTransactionDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) { }

    @Get()
    async findAll(@Query() query: TransactionsQueryDto) {
        return this.transactionsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.transactionsService.findOne(id);
    }

    @Post()
    async create(@Body() dto: CreateTransactionDto) {
        return this.transactionsService.create(dto);
    }

    @Patch(':id')
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTransactionDto) {
        return this.transactionsService.update(id, dto);
    }
}
