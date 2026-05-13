import { paginationAndSortingDefault } from '../middlewares/validation/query-pagination-sorting.validation-middleware';
import { PaginationAndSorting } from '../types/pagination-and-sorting';

export function setDefaultSortAndPaginationIfNotExist<P = string>(
    query: Partial<PaginationAndSorting<P>>,
): PaginationAndSorting<P> {
    // return {
    //     ...paginationAndSortingDefault,
    //     ...query,
    //     sortBy: (query.sortBy ?? paginationAndSortingDefault.sortBy) as P,
    // };

    // Принудительно приводим к числам, если значения пришли строками из query, либо берем дефолты
    const pageNumber = Number(query.pageNumber) || paginationAndSortingDefault.pageNumber;
    const pageSize = Number(query.pageSize) || paginationAndSortingDefault.pageSize;

    // Используем || вместо ?? чтобы отсечь пустые строки ""
    const sortBy = (query.sortBy || paginationAndSortingDefault.sortBy) as P;
    const sortDirection = query.sortDirection || paginationAndSortingDefault.sortDirection;

    return {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
    };
}