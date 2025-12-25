import { useState } from "react";

export default function RelatedLinks({ links, loading }) {
    const [copiedIndex, setCopiedIndex] = useState(null);

    async function copyLink(link, i) {
        if (!navigator?.clipboard) {
            console.warn('Clipboard not available');
            return;
        }
        try {
            await navigator.clipboard.writeText(link);
            setCopiedIndex(i);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (e) {
            console.error('Copy failed', e);
        }
    }

    if (loading) {
        return <p className="text-sm text-gray-500 mt-3">🔎 Searching Google for related articles…</p>;
    }

    if (!links || links.length === 0) {
        return <p className="text-sm text-gray-500 mt-3">No related articles found.</p>;
    }

    return (
        <div className="mt-4 grid gap-3">
            {links.map((link, i) => {
                let hostname = '';
                try {
                    hostname = new URL(link).hostname.replace(/^www\./, '');
                } catch (e) {
                    hostname = link;
                }

                return (
                    <div key={i} className="flex items-start justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex-1 pr-4">
                            <a href={link} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
                                {link.length > 90 ? `${link.slice(0, 90)}...` : link}
                            </a>
                            <div className="text-xs text-gray-500 mt-1">{hostname}</div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500">
                                Open
                            </a>
                            <button onClick={() => copyLink(link, i)} className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200">
                                {copiedIndex === i ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
