import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

interface ReportExporterProps {
  reportName: string;
  data: any[];
  columns: {
    key: string;
    label: string;
  }[];
}

const ReportExporter: React.FC<ReportExporterProps> = ({ reportName, data, columns }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);
  
  const convertToCSV = (data: any[]): string => {
    // Create header row using column labels
    let csvContent = columns.map(col => `"${col.label}"`).join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = columns
        .map(column => {
          // Get the value for this column
          const value = item[column.key];
          
          // Handle different data types
          if (value === null || value === undefined) {
            return '';
          } else if (typeof value === 'string') {
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          } else if (value instanceof Date) {
            // Format date
            return `"${value.toLocaleDateString('fr-FR')}"`;
          } else if (typeof value === 'boolean') {
            return value ? '"Oui"' : '"Non"';
          } else if (typeof value === 'object') {
            // Convert object to JSON string
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          } else {
            // Numbers and other primitive types
            return `"${value}"`;
          }
        })
        .join(',');
        
      csvContent += row + '\n';
    });
    
    return csvContent;
  };

  const downloadCSV = () => {
    try {
      setExportStatus('loading');
      setExportError(null);
      
      // Convert data to CSV format
      const csv = convertToCSV(data);
      
      // Create a Blob with the CSV content
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportName}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setExportStatus('idle');
        setIsOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setExportStatus('error');
      setExportError('Une erreur est survenue lors de l\'export');
    }
  };
  
  const downloadExcel = () => {
    // In a real implementation, you might use a library like xlsx
    // For this example, we'll just use CSV as a placeholder
    setExportStatus('error');
    setExportError('Export Excel non implémenté. Utiliser CSV.');
  };
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Exporter</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-56">
          {exportStatus === 'idle' && (
            <>
              <button
                onClick={downloadCSV}
                className="flex items-center w-full gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50 text-gray-700"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Exporter en CSV</span>
              </button>
              <button
                onClick={downloadExcel}
                className="flex items-center w-full gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50 text-gray-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span>Exporter en Excel</span>
              </button>
            </>
          )}
          
          {exportStatus === 'loading' && (
            <div className="flex items-center justify-center py-4 px-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-sm text-gray-600">Export en cours...</span>
            </div>
          )}
          
          {exportStatus === 'success' && (
            <div className="flex items-center gap-2 py-4 px-3 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Export réussi!</span>
            </div>
          )}
          
          {exportStatus === 'error' && (
            <div className="flex flex-col gap-2 py-4 px-3 text-red-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Erreur d'export</span>
              </div>
              {exportError && <p className="text-xs text-red-500">{exportError}</p>}
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 text-center w-full py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportExporter;