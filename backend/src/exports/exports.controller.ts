import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}

@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  /**
   * Export rentals
   * Admin only
   */
  @Get('rentals')
  @Roles('admin')
  async exportRentals(
    @Query('format', new ParseEnumPipe(ExportFormat)) format: ExportFormat,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    };

    if (format === ExportFormat.CSV) {
      const csv = await this.exportsService.exportRentalsToCSV(options);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=rentals-${new Date().toISOString()}.csv`,
      );
      return res.send(csv);
    } else {
      const pdf = await this.exportsService.exportRentalsToPDF(options);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=rentals-${new Date().toISOString()}.pdf`,
      );
      return res.send(pdf);
    }
  }

  /**
   * Export tools inventory
   * Admin only
   */
  @Get('tools')
  @Roles('admin')
  async exportTools(
    @Query('format', new ParseEnumPipe(ExportFormat)) format: ExportFormat,
    @Res() res?: Response,
  ) {
    if (format === ExportFormat.CSV) {
      const csv = await this.exportsService.exportToolsToCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=tools-${new Date().toISOString()}.csv`,
      );
      return res.send(csv);
    } else {
      const pdf = await this.exportsService.exportToolsToPDF();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=tools-${new Date().toISOString()}.pdf`,
      );
      return res.send(pdf);
    }
  }

  /**
   * Export transactions
   * Admin only
   */
  @Get('transactions')
  @Roles('admin')
  async exportTransactions(
    @Query('format', new ParseEnumPipe(ExportFormat)) format: ExportFormat,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    if (format === ExportFormat.CSV) {
      const csv = await this.exportsService.exportTransactionsToCSV(options);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=transactions-${new Date().toISOString()}.csv`,
      );
      return res.send(csv);
    } else {
      const pdf = await this.exportsService.exportTransactionsToPDF(options);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=transactions-${new Date().toISOString()}.pdf`,
      );
      return res.send(pdf);
    }
  }
}
