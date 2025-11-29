import React from 'react';
import { FiFileText, FiDownload } from 'react-icons/fi';

const DocumentList = ({ documents = [] }) => {
    if (!documents || documents.length === 0) {
        return <p className="text-sm text-slate-400">No documents uploaded yet.</p>;
    }

    const getFileName = (url) => {
        if (!url) return 'Document';
        const parts = url.split('/');
        return parts[parts.length - 1] || 'Document';
    };

    return (
        <div className="space-y-2">
            {documents.map((doc, idx) => (
                <a
                    key={idx}
                    href={doc}
                    download
                    className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100 group cursor-pointer hover:border-blue-200 transition-colors"
                >
                    <FiFileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="flex-1 truncate font-medium text-slate-700">
                        {getFileName(doc)}
                    </span>
                    <FiDownload className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                </a>
            ))}
        </div>
    );
};

export default DocumentList;
