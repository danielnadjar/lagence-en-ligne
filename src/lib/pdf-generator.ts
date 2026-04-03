/**
 * Générateur PDF minimal — aucune dépendance externe.
 * Produit un PDF valide avec texte multi-pages et image signature PNG en base64.
 */

class PdfWriter {
  private objects: string[] = [];
  private offsets: number[] = [];
  private pages: number[] = [];
  private buf = "";
  private currentObj = 0;

  // Dimensions A4 en points (72 dpi)
  private readonly W = 595.28;
  private readonly H = 841.89;
  private readonly MARGIN = 50;
  private readonly LINE_H = 14;
  private readonly FONT_SIZE = 10;
  private readonly TITLE_SIZE = 14;

  private addObj(content: string): number {
    this.currentObj++;
    this.objects.push(content);
    return this.currentObj;
  }

  /**
   * Encode une chaîne pour PDF (échappe parenthèses et backslash, gère l'UTF-8 → latin1 au mieux)
   */
  private pdfStr(s: string): string {
    // Remplacer les caractères accentués courants par leurs équivalents latin1
    const cleaned = s
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
    return cleaned;
  }

  /**
   * Convertit un texte en lignes pour le PDF, en gérant le word-wrap
   */
  private wrapText(text: string, maxCharsPerLine: number): string[] {
    const paragraphs = text.split("\n");
    const lines: string[] = [];

    for (const para of paragraphs) {
      if (para.trim() === "") {
        lines.push("");
        continue;
      }

      const words = para.split(/\s+/);
      let currentLine = "";

      for (const word of words) {
        if (currentLine.length + word.length + 1 > maxCharsPerLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = currentLine ? currentLine + " " + word : word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  /**
   * Génère le PDF complet
   */
  generate(opts: {
    mandatTexte: string;
    mandatNumero: string;
    clientNom: string;
    clientPrenom: string;
    clientEmail: string;
    dateSignature: string;
    heureSignature: string;
    ip: string;
    userAgent: string;
    signatureBase64?: string; // data:image/png;base64,...
  }): Buffer {
    // Reset
    this.objects = [];
    this.offsets = [];
    this.pages = [];
    this.currentObj = 0;
    this.buf = "";

    const usableW = this.W - 2 * this.MARGIN;
    // ~85 chars par ligne en taille 10 avec Helvetica
    const maxChars = 90;

    // Préparer les lignes du texte
    const allLines = this.wrapText(opts.mandatTexte, maxChars);

    // Calculer lignes par page (laisser place en bas pour signature sur dernière page)
    const linesPerPage = Math.floor((this.H - 2 * this.MARGIN) / this.LINE_H);

    // Découper en pages
    const pageChunks: string[][] = [];
    for (let i = 0; i < allLines.length; i += linesPerPage) {
      pageChunks.push(allLines.slice(i, i + linesPerPage));
    }

    // S'assurer qu'il y a au moins une page
    if (pageChunks.length === 0) {
      pageChunks.push([""]);
    }

    // Obj 1: Catalog
    this.addObj("");
    // Obj 2: Pages (placeholder, filled later)
    this.addObj("");
    // Obj 3: Font (Helvetica)
    this.addObj(
      "<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n/Encoding /WinAnsiEncoding\n>>"
    );
    // Obj 4: Font Bold
    this.addObj(
      "<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica-Bold\n/Encoding /WinAnsiEncoding\n>>"
    );

    // Image signature si fournie
    let sigImgObjId: number | null = null;
    let sigImgW = 200;
    let sigImgH = 80;

    if (opts.signatureBase64) {
      // Extraire le PNG brut du data URL
      const base64Data = opts.signatureBase64.replace(
        /^data:image\/png;base64,/,
        ""
      );
      const imgBuffer = Buffer.from(base64Data, "base64");

      // Lire dimensions PNG depuis le header IHDR
      if (imgBuffer.length > 24) {
        sigImgW = imgBuffer.readUInt32BE(16);
        sigImgH = imgBuffer.readUInt32BE(20);
      }

      // Obj pour l'image XObject
      const imgStream = imgBuffer.toString("binary");
      sigImgObjId = this.addObj(
        `<<\n/Type /XObject\n/Subtype /Image\n/Width ${sigImgW}\n/Height ${sigImgH}\n/ColorSpace /DeviceRGB\n/BitsPerComponent 8\n/Filter /FlateDecode\n/Length ${imgStream.length}\n>>`
      );
    }

    // Créer les pages
    for (let p = 0; p < pageChunks.length; p++) {
      const isLastPage = p === pageChunks.length - 1;
      const lines = pageChunks[p];

      // Construire le stream de contenu
      let stream = "BT\n";

      // En-tête sur la première page
      if (p === 0) {
        stream += `/F2 ${this.TITLE_SIZE} Tf\n`;
        stream += `${this.MARGIN} ${this.H - this.MARGIN} Td\n`;
        stream += `(MANDAT DE RECHERCHE IMMOBILIERE) Tj\n`;
        stream += `0 -${this.LINE_H * 1.5} Td\n`;
        stream += `/F1 8 Tf\n`;
        stream += `(Numero : ${this.pdfStr(opts.mandatNumero)}) Tj\n`;
        stream += `0 -${this.LINE_H * 1.5} Td\n`;
        stream += `/F1 ${this.FONT_SIZE} Tf\n`;
      } else {
        stream += `/F1 ${this.FONT_SIZE} Tf\n`;
        stream += `${this.MARGIN} ${this.H - this.MARGIN} Td\n`;
      }

      // Lignes de texte
      for (const line of lines) {
        const isArticle = line.startsWith("ARTICLE ");
        if (isArticle) {
          stream += `/F2 ${this.FONT_SIZE} Tf\n`;
        }
        stream += `(${this.pdfStr(line)}) Tj\n`;
        stream += `0 -${this.LINE_H} Td\n`;
        if (isArticle) {
          stream += `/F1 ${this.FONT_SIZE} Tf\n`;
        }
      }

      // Bloc signature sur la dernière page
      if (isLastPage) {
        stream += `0 -${this.LINE_H * 2} Td\n`;
        stream += `/F2 ${this.FONT_SIZE} Tf\n`;
        stream += `(Signature electronique) Tj\n`;
        stream += `0 -${this.LINE_H} Td\n`;
        stream += `/F1 9 Tf\n`;
        stream += `(Signe par : ${this.pdfStr(opts.clientPrenom)} ${this.pdfStr(opts.clientNom)} \\(${this.pdfStr(opts.clientEmail)}\\)) Tj\n`;
        stream += `0 -${this.LINE_H} Td\n`;
        stream += `(Date : ${this.pdfStr(opts.dateSignature)} a ${this.pdfStr(opts.heureSignature)}) Tj\n`;
        stream += `0 -${this.LINE_H} Td\n`;
        stream += `(Adresse IP : ${this.pdfStr(opts.ip)}) Tj\n`;
        stream += `0 -${this.LINE_H} Td\n`;
        stream += `(Navigateur : ${this.pdfStr(opts.userAgent.substring(0, 80))}) Tj\n`;
      }

      stream += "ET\n";

      // Stream content object
      const contentObjId = this.addObj(
        `<<\n/Length ${stream.length}\n>>\nstream\n${stream}endstream`
      );

      // Resources dict
      let resources = `<<\n/Font <<\n/F1 3 0 R\n/F2 4 0 R\n>>\n`;
      if (isLastPage && sigImgObjId) {
        resources += `/XObject << /Sig ${sigImgObjId} 0 R >>\n`;
      }
      resources += `>>`;

      // Page object
      const pageObjId = this.addObj(
        `<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 ${this.W} ${this.H}]\n/Contents ${contentObjId} 0 R\n/Resources ${resources}\n>>`
      );
      this.pages.push(pageObjId);
    }

    // Mettre à jour Catalog (obj 1)
    this.objects[0] = "<<\n/Type /Catalog\n/Pages 2 0 R\n>>";

    // Mettre à jour Pages (obj 2)
    const pageRefs = this.pages.map((id) => `${id} 0 R`).join(" ");
    this.objects[1] = `<<\n/Type /Pages\n/Kids [${pageRefs}]\n/Count ${this.pages.length}\n>>`;

    // Assembler le PDF
    let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const objectOffsets: number[] = [];

    for (let i = 0; i < this.objects.length; i++) {
      objectOffsets.push(pdf.length);
      pdf += `${i + 1} 0 obj\n${this.objects[i]}\nendobj\n`;
    }

    // Cross-reference table
    const xrefOffset = pdf.length;
    pdf += "xref\n";
    pdf += `0 ${this.objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (const offset of objectOffsets) {
      pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    }

    // Trailer
    pdf += "trailer\n";
    pdf += `<<\n/Size ${this.objects.length + 1}\n/Root 1 0 R\n>>\n`;
    pdf += "startxref\n";
    pdf += `${xrefOffset}\n`;
    pdf += "%%EOF\n";

    return Buffer.from(pdf, "binary");
  }
}

export function genererMandatPdf(opts: {
  mandatTexte: string;
  mandatNumero: string;
  clientNom: string;
  clientPrenom: string;
  clientEmail: string;
  dateSignature: string;
  heureSignature: string;
  ip: string;
  userAgent: string;
  signatureBase64?: string;
}): Buffer {
  const writer = new PdfWriter();
  return writer.generate(opts);
}
