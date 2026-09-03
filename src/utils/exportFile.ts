/**
 * Helpers de exportação client-side.
 * Não há backend de relatórios ainda: o arquivo é montado no browser e
 * entregue via Blob + link temporário.
 */

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    // Remove os acentos combinantes gerados pelo NFD (U+0300–U+036F).
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeCell = (value: unknown) => {
  const cell = value === null || value === undefined ? '' : String(value);
  return `"${cell.replace(/"/g, '""')}"`;
};

/**
 * Gera CSV com separador ";" e BOM para o Excel pt-BR abrir sem quebrar acentos.
 */
export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) => {
  const content = [headers, ...rows]
    .map(line => line.map(escapeCell).join(';'))
    .join('\r\n');

  triggerDownload(new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' }), filename);
};

export const downloadJson = (filename: string, data: unknown) => {
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' }),
    filename
  );
};

/**
 * Parser de CSV simples (aceita ";" ou ","), suficiente para importação de
 * planilhas exportadas pelo próprio sistema.
 */
export const parseCsv = (raw: string): Record<string, string>[] => {
  const text = raw.replace(/^﻿/, '').trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const separator = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ',';

  const splitLine = (line: string) => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells.map(c => c.trim());
  };

  const headers = splitLine(lines[0]).map(h => h.toLowerCase());

  return lines.slice(1).map(line => {
    const cells = splitLine(line);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = cells[index] ?? '';
      return acc;
    }, {});
  });
};

/**
 * Abre a janela de impressão do navegador com um documento HTML isolado —
 * o caminho de "PDF" possível sem biblioteca externa.
 */
export const printHtmlDocument = (title: string, bodyHtml: string) => {
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    document.body.removeChild(frame);
    return;
  }

  doc.open();
  doc.write(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif; color: #111827; margin: 32px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
  th { background: #f9fafb; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; }
  footer { margin-top: 24px; font-size: 10px; color: #9ca3af; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`);
  doc.close();

  const cleanup = () => {
    if (frame.parentNode) document.body.removeChild(frame);
  };

  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    // O print() é modal na maioria dos navegadores; a remoção só ocorre depois.
    setTimeout(cleanup, 1000);
  };
};
