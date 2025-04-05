import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { CemigPdfExtractor } from './cemig-pdf-extractor';

@Module({
  providers: [PdfParserService, CemigPdfExtractor],
  exports: [PdfParserService, CemigPdfExtractor],
})
export class PdfParserModule {}
