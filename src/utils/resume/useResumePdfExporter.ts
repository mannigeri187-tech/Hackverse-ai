import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { ResumeData } from '../../types/resumeBuilder';

export function useResumePdfExporter(resumeData: ResumeData | null) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const generateFilename = (name?: string) => {
    if (!name || !name.trim()) return 'Resume';
    // Replace illegal Windows/Unix filename characters and collapse spaces/underscores
    const sanitized = name
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/[\s_]+/g, '_')
      .replace(/^_|_$/g, '');
    return sanitized ? `${sanitized}_Resume` : 'Resume';
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef, // Uses new react-to-print v3 signature
    documentTitle: generateFilename(resumeData?.personal?.name),
    onBeforePrint: () => {
      setIsExporting(true);
      setExportError(null);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsExporting(false);
    },
    onPrintError: (errorLocation: unknown, error: Error) => {
      setIsExporting(false);
      setExportError(`Failed to generate PDF: ${error.message}`);
      console.error(errorLocation, error);
    }
  });

  const exportPdf = () => {
    if (isExporting) return;
    if (!printRef.current) {
      setExportError("Resume preview is not ready.");
      return;
    }
    handlePrint();
  };

  return {
    printRef,
    exportPdf,
    isExporting,
    exportError
  };
}
