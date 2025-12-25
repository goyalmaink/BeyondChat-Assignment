import cleanArticleContent, { extractTextFromHTML } from "./removeicon";
import { useState } from "react";


export default function ArticleCard({ article, onFindLinks }) {
    const [open, setOpen] = useState(false);

    const excerptText = extractTextFromHTML(article.excerpt || article.content || '');
    const preview = excerptText.length > 250 ? excerptText.slice(0, 250).trim() + '...' : excerptText;

    return (
        <article className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left px-7 py-5 focus:outline-none"
            >
                <h2 className="text-xl font-semibold text-gray-900 leading-snug">
                    {article.title}
                </h2>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date(article.created_at).toDateString()}
                    </p>

                    <div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFindLinks && onFindLinks(); }}
                            className="ml-3 px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 text-sm"
                        >
                            Find related links
                        </button>
                    </div>
                </div>

                {!open && preview && (
                    <p className="text-gray-700 mt-3 line-clamp-3">{preview}</p>
                )}

            </button>

            {open && (
                <div className="px-7 pb-7 pt-4 border-t">
                    <div
                        className="prose prose-slate max-w-none
             prose-headings:text-gray-900
             prose-headings:font-semibold
             prose-h2:text-xl
             prose-h2:mt-8
             prose-h2:mb-4
             prose-p:text-gray-700
             prose-p:leading-relaxed
             prose-p:my-4
             prose-blockquote:border-l-4
             prose-blockquote:border-primary
             prose-blockquote:pl-4
             prose-blockquote:italic
             prose-blockquote:text-gray-600
             prose-hr:my-8
             prose-img:rounded-lg
             prose-img:mx-auto
             prose-img:my-6
             prose-img:max-h-[420px]
             prose-img:object-contain
             prose-table:table-auto
             prose-table:w-full
             prose-th:bg-gray-100
             prose-th:font-medium
             prose-th:px-3
             prose-td:px-3
             prose-th:py-2
             prose-td:py-2"
                        dangerouslySetInnerHTML={{
                            __html: cleanArticleContent(article.content),
                        }}
                    />

                </div>
            )}
        </article>
    );
}


