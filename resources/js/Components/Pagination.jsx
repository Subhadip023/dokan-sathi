import { Link } from '@inertiajs/react';

const Pagination = ({ links }) => {
    return (
        <div className="flex flex-wrap justify-center mt-6 -mb-1">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="mr-1 mb-1 px-2 py-1.5 text-xs sm:px-4 sm:py-3 sm:text-sm leading-4 text-gray-400 border rounded"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`mr-1 mb-1 px-2 py-1.5 text-xs sm:px-4 sm:py-3 sm:text-sm leading-4 border rounded hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-blue-600 text-white' : ''}`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
};

export default Pagination;