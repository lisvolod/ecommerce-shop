import './TableSkeleton.scss';

function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className="table-skeleton">
            <table>
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}>
                                <div className="skeleton skeleton-text"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex}>
                                    <div className="skeleton skeleton-text"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TableSkeleton;