import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ToolsService } from './tools.service';
import { ToolsQueryDto, CreateToolDto, UpdateToolDto, CreateConditionDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

// Multer configuration for image uploads
const imageStorage = diskStorage({
    destination: './uploads/tools/images',
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
};

@Controller('tools')
@UseGuards(JwtAuthGuard)
export class ToolsController {
    constructor(private toolsService: ToolsService) { }

    @Get()
    async findAll(@Query() query: ToolsQueryDto) {
        return this.toolsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.toolsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    async create(@Body() dto: CreateToolDto) {
        return this.toolsService.create(dto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateToolDto,
    ) {
        return this.toolsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.toolsService.remove(id);
        return { message: 'Tool deleted' };
    }

    @Post(':id/images')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: imageStorage,
            fileFilter: imageFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
    async uploadImages(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Body('isPrimary') isPrimary?: string,
    ) {
        return this.toolsService.addImages(id, files, isPrimary === 'true');
    }

    @Delete(':id/images/:imageId')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async removeImage(
        @Param('id', ParseUUIDPipe) toolId: string,
        @Param('imageId', ParseUUIDPipe) imageId: string,
    ) {
        return this.toolsService.removeImage(toolId, imageId);
    }

    @Post(':id/conditions')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async addCondition(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreateConditionDto,
        @CurrentUser('id') adminId: string,
    ) {
        return this.toolsService.addCondition(id, dto, adminId);
    }
}
