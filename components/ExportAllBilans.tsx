'use client';

import { useState, useCallback } from 'react';
import { useData } from '@/lib/DataContext';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Student } from '@/lib/types';

interface StudentResult {
  id: number;
  value: number;
  criteriaLabel: string;
  criteriaPole: string;
  criteriaCompetence: string;
  criteriaTaskBlock: string;
  sessionLabel: string;
  sessionId: number;
}

function computeStudentData(studentResults: StudentResult[]) {
  // Moyennes par pôle
  const statsByPole: Record<string, { total: number; count: number }> = {};
  studentResults.forEach((res) => {
    const poleName = res.criteriaPole || 'Divers';
    const val = res.value || 0;
    if (!statsByPole[poleName]) statsByPole[poleName] = { total: 0, count: 0 };
    statsByPole[poleName].total += val;
    statsByPole[poleName].count += 1;
  });

  const poleAverages = Object.entries(statsByPole).map(([pole, stats]) => ({
    pole,
    average: Math.round((stats.total / stats.count) * 10) / 10,
  }));

  // Moyennes par bloc de tâche
  const statsByBlock: Record<string, { total: number; count: number; pole: string }> = {};
  studentResults.forEach((res) => {
    const block = res.criteriaTaskBlock || 'Autre';
    const val = res.value || 0;
    if (!statsByBlock[block]) statsByBlock[block] = { total: 0, count: 0, pole: res.criteriaPole || 'Divers' };
    statsByBlock[block].total += val;
    statsByBlock[block].count += 1;
  });

  const blockAverages = Object.entries(statsByBlock).map(([block, stats]) => ({
    block,
    pole: stats.pole,
    average: Math.round((stats.total / stats.count) * 10) / 10,
  }));

  return { poleAverages, blockAverages };
}

function getBarColor(score: number): [number, number, number] {
  if (score >= 70) return [21, 128, 61];    // vert foncé
  if (score >= 50) return [34, 197, 94];    // vert
  if (score >= 30) return [249, 115, 22];   // orange
  return [239, 68, 68];                      // rouge
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AutoTableFn = (pdf: any, options: Record<string, unknown>) => void;
type JsPDFInstance = import('jspdf').jsPDF & { lastAutoTable: { finalY: number } };

function generateStudentPage(
  pdf: JsPDFInstance,
  autoTable: AutoTableFn,
  student: Student,
  studentResults: StudentResult[],
  isFirstPage: boolean
) {
  if (!isFirstPage) pdf.addPage();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const { poleAverages, blockAverages } = computeStudentData(studentResults);

  let y = 15;

  // === EN-TÊTE ===
  pdf.setFillColor(37, 99, 235);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${student.firstName} ${student.lastName}`, 15, y);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${studentResults.length} résultats enregistrés`, 15, y + 7);
  y = 38;

  // === SECTION 1 : Moyenne par Pôle ===
  pdf.setTextColor(55, 65, 81);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Moyenne par Pôle de compétence', 15, y);
  y += 3;

  autoTable(pdf, {
    startY: y,
    head: [['Pôle', 'Moyenne', '']],
    body: poleAverages.map((p) => [
      p.pole,
      `${p.average}%`,
      '',
    ]),
    margin: { left: 15, right: 15 },
    headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [55, 65, 81] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 25, halign: 'right' as const, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
    didDrawCell: (data: { section: string; column: { index: number }; cell: { x: number; y: number; height: number }; row: { index: number } }) => {
      if (data.section === 'body' && data.column.index === 2) {
        const score = poleAverages[data.row.index]?.average || 0;
        const barMaxWidth = pageWidth - 15 - data.cell.x - 5;
        const barWidth = (score / 100) * barMaxWidth;
        const [r, g, b] = getBarColor(score);
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(data.cell.x + 2, data.cell.y + 2, barWidth, data.cell.height - 4, 1.5, 1.5, 'F');
      }
    },
  });

  y = pdf.lastAutoTable.finalY + 10;

  // === SECTION 2 : Moyenne par Bloc de Tâche ===
  pdf.setTextColor(55, 65, 81);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Résultats par Bloc de Tâches', 15, y);
  y += 3;

  autoTable(pdf, {
    startY: y,
    head: [['Bloc de tâche', 'Pôle', 'Moyenne', '']],
    body: blockAverages.map((b) => [
      b.block,
      b.pole,
      `${b.average}%`,
      '',
    ]),
    margin: { left: 15, right: 15 },
    headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 50, fontSize: 7, textColor: [107, 114, 128] },
      2: { cellWidth: 20, halign: 'right' as const, fontStyle: 'bold' },
      3: { cellWidth: 'auto' },
    },
    didDrawCell: (data: { section: string; column: { index: number }; cell: { x: number; y: number; height: number }; row: { index: number } }) => {
      if (data.section === 'body' && data.column.index === 3) {
        const score = blockAverages[data.row.index]?.average || 0;
        const barMaxWidth = pageWidth - 15 - data.cell.x - 5;
        const barWidth = (score / 100) * barMaxWidth;
        const [r, g, b] = getBarColor(score);
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(data.cell.x + 2, data.cell.y + 2, barWidth, data.cell.height - 4, 1.5, 1.5, 'F');
      }
    },
  });

  y = pdf.lastAutoTable.finalY + 10;

  // === SECTION 3 : Détail des résultats ===
  // Vérifier s'il reste assez de place, sinon nouvelle page
  if (y > pdf.internal.pageSize.getHeight() - 40) {
    pdf.addPage();
    y = 15;
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(9);
    pdf.text(`${student.firstName} ${student.lastName} — suite`, 15, y);
    y += 8;
  }

  pdf.setTextColor(55, 65, 81);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Détail des résultats', 15, y);
  y += 3;

  autoTable(pdf, {
    startY: y,
    head: [['Bloc de tâche', 'Compétence', 'Critère', 'Session', 'Résultat']],
    body: studentResults.map((res) => [
      res.criteriaTaskBlock || 'Général',
      res.criteriaCompetence,
      res.criteriaLabel,
      res.sessionLabel,
      `${res.value}%`,
    ]),
    margin: { left: 15, right: 15 },
    headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: [55, 65, 81] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 35 },
      4: { cellWidth: 20, halign: 'right' as const, fontStyle: 'bold' },
    },
    didDrawCell: (data: { section: string; column: { index: number }; cell: { text: string[] }; row: { index: number } }) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = parseFloat(data.cell.text[0]);
        if (!isNaN(val)) {
          if (val < 50) {
            pdf.setTextColor(249, 115, 22);
          } else {
            pdf.setTextColor(22, 163, 74);
          }
        }
      }
    },
  });

  // Pied de page
  const totalPages = pdf.getNumberOfPages();
  pdf.setPage(totalPages);
  pdf.setTextColor(180, 180, 180);
  pdf.setFontSize(7);
  pdf.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} — Suivi des Compétences`,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 5,
    { align: 'center' }
  );
}

export function ExportAllBilans() {
  const { data, getStudentResults } = useData();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState('');

  const handleExport = useCallback(async () => {
    if (data.students.length === 0) return;

    setExporting(true);
    setProgress('Génération du PDF...');

    // Dynamic import pour éviter les erreurs SSR
    const { jsPDF } = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = (autoTableModule.autoTable || autoTableModule.default) as unknown as AutoTableFn;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    for (let i = 0; i < data.students.length; i++) {
      const student = data.students[i];
      setProgress(`${student.firstName} ${student.lastName} (${i + 1}/${data.students.length})`);

      const results = getStudentResults(student.id);
      generateStudentPage(pdf as unknown as JsPDFInstance, autoTable, student, results, i === 0);

      // Laisser l'UI respirer entre chaque élève
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    pdf.save(`bilans_eleves_${new Date().toISOString().slice(0, 10)}.pdf`);

    setExporting(false);
    setProgress('');
  }, [data.students, getStudentResults]);

  if (data.students.length === 0) return null;

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2"
      variant="default"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Exporter tous les bilans (PDF)
        </>
      )}
    </Button>
  );
}
