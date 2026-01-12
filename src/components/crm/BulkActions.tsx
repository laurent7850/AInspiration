import React from 'react';
import { Trash2, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
  entityType?: string;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onDelete,
  onCancel,
  entityType = 'éléments'
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
      <span className="font-medium">
        {selectedCount} {entityType} sélectionné{selectedCount > 1 ? 's' : ''}
      </span>

      <div className="flex gap-2 ml-4">
        <button
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>

        <button
          onClick={onCancel}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
