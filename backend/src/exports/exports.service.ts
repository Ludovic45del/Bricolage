import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import * as PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  userId?: string;
}

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Export rentals to CSV
   */
  async exportRentalsToCSV(options: ExportOptions = {}): Promise<string> {
    const rentals = await this.getRentalsForExport(options);

    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Utilisateur', value: 'user.name' },
      { label: 'Email', value: 'user.email' },
      { label: 'Badge', value: 'user.badgeNumber' },
      { label: 'Outil', value: 'tool.title' },
      { label: 'Catégorie', value: 'tool.category.name' },
      { label: 'Date début', value: 'startDate' },
      { label: 'Date fin', value: 'endDate' },
      { label: 'Date retour', value: 'actualReturnDate' },
      { label: 'Statut', value: 'status' },
      { label: 'Prix total', value: 'totalPrice' },
      { label: 'Commentaire', value: 'returnComment' },
      { label: 'Créé le', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    return parser.parse(rentals);
  }

  /**
   * Export rentals to PDF
   */
  async exportRentalsToPDF(options: ExportOptions = {}): Promise<Buffer> {
    const rentals = await this.getRentalsForExport(options);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Rapport de Locations', { align: 'center' });
      doc.moveDown();

      if (options.startDate || options.endDate) {
        doc.fontSize(10);
        if (options.startDate) {
          doc.text(`Du: ${options.startDate.toLocaleDateString('fr-FR')}`);
        }
        if (options.endDate) {
          doc.text(`Au: ${options.endDate.toLocaleDateString('fr-FR')}`);
        }
        doc.moveDown();
      }

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Utilisateur', 50, tableTop);
      doc.text('Outil', 150, tableTop);
      doc.text('Début', 300, tableTop);
      doc.text('Fin', 380, tableTop);
      doc.text('Statut', 460, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table content
      doc.font('Helvetica');
      let y = tableTop + 20;

      rentals.forEach((rental) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(rental.user.name.substring(0, 15), 50, y);
        doc.text(rental.tool.title.substring(0, 20), 150, y);
        doc.text(new Date(rental.startDate).toLocaleDateString('fr-FR'), 300, y);
        doc.text(new Date(rental.endDate).toLocaleDateString('fr-FR'), 380, y);
        doc.text(rental.status, 460, y);

        y += 20;
      });

      // Footer
      doc.fontSize(8).text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} - Total: ${rentals.length} locations`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );

      doc.end();
    });
  }

  /**
   * Export tools to CSV
   */
  async exportToolsToCSV(): Promise<string> {
    const tools = await this.prisma.tool.findMany({
      include: { category: true },
      orderBy: { title: 'asc' },
    });

    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Titre', value: 'title' },
      { label: 'Description', value: 'description' },
      { label: 'Catégorie', value: 'category.name' },
      { label: 'Prix/semaine', value: 'weeklyPrice' },
      { label: 'Prix achat', value: 'purchasePrice' },
      { label: 'Date achat', value: 'purchaseDate' },
      { label: 'Statut', value: 'status' },
      { label: 'Importance maintenance', value: 'maintenanceImportance' },
      { label: 'Intervalle maintenance', value: 'maintenanceInterval' },
      { label: 'Dernière maintenance', value: 'lastMaintenanceDate' },
      { label: 'Créé le', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    return parser.parse(tools);
  }

  /**
   * Export tools to PDF
   */
  async exportToolsToPDF(): Promise<Buffer> {
    const tools = await this.prisma.tool.findMany({
      include: { category: true },
      orderBy: { title: 'asc' },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Inventaire des Outils', { align: 'center' });
      doc.moveDown(2);

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Titre', 50, tableTop);
      doc.text('Catégorie', 200, tableTop);
      doc.text('Prix/sem', 320, tableTop);
      doc.text('Statut', 400, tableTop);
      doc.text('Maintenance', 470, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table content
      doc.font('Helvetica');
      let y = tableTop + 20;

      tools.forEach((tool) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(tool.title.substring(0, 20), 50, y);
        doc.text(tool.category?.name || 'N/A', 200, y);
        doc.text(`${tool.weeklyPrice}€`, 320, y);
        doc.text(tool.status, 400, y);
        doc.text(tool.maintenanceImportance, 470, y);

        y += 20;
      });

      // Footer
      doc.fontSize(8).text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} - Total: ${tools.length} outils`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );

      doc.end();
    });
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactionsToCSV(options: ExportOptions = {}): Promise<string> {
    const where: any = {};

    if (options.startDate || options.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lte = options.endDate;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'desc' },
    });

    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Utilisateur', value: 'user.name' },
      { label: 'Email', value: 'user.email' },
      { label: 'Montant', value: 'amount' },
      { label: 'Type', value: 'type' },
      { label: 'Méthode', value: 'method' },
      { label: 'Date', value: 'date' },
      { label: 'Description', value: 'description' },
      { label: 'Statut', value: 'status' },
      { label: 'Étape workflow', value: 'workflowStep' },
      { label: 'Créé le', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    return parser.parse(transactions);
  }

  /**
   * Export transactions to PDF
   */
  async exportTransactionsToPDF(options: ExportOptions = {}): Promise<Buffer> {
    const where: any = {};

    if (options.startDate || options.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lte = options.endDate;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'desc' },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Rapport de Transactions', { align: 'center' });
      doc.moveDown();

      if (options.startDate || options.endDate) {
        doc.fontSize(10);
        if (options.startDate) {
          doc.text(`Du: ${options.startDate.toLocaleDateString('fr-FR')}`);
        }
        if (options.endDate) {
          doc.text(`Au: ${options.endDate.toLocaleDateString('fr-FR')}`);
        }
        doc.moveDown();
      }

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Utilisateur', 50, tableTop);
      doc.text('Montant', 180, tableTop);
      doc.text('Type', 250, tableTop);
      doc.text('Date', 350, tableTop);
      doc.text('Statut', 450, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table content
      doc.font('Helvetica');
      let y = tableTop + 20;
      let total = 0;

      transactions.forEach((transaction) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(transaction.user.name.substring(0, 18), 50, y);
        doc.text(`${transaction.amount}€`, 180, y);
        doc.text(transaction.type, 250, y);
        doc.text(new Date(transaction.date).toLocaleDateString('fr-FR'), 350, y);
        doc.text(transaction.status, 450, y);

        total += Number(transaction.amount);
        y += 20;
      });

      // Summary
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total: ${total.toFixed(2)}€`, { align: 'right' });

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} - Total: ${transactions.length} transactions`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );

      doc.end();
    });
  }

  /**
   * Get rentals for export with filters
   */
  private async getRentalsForExport(options: ExportOptions) {
    const where: any = {};

    if (options.startDate || options.endDate) {
      where.startDate = {};
      if (options.startDate) where.startDate.gte = options.startDate;
      if (options.endDate) where.startDate.lte = options.endDate;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    return this.prisma.rental.findMany({
      where,
      include: {
        user: true,
        tool: { include: { category: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }
}
