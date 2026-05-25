"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { EntityListConfig } from "@/types/forms";

interface EntityListProps<T> {
  config: EntityListConfig<T>;
  data: T[] | undefined;
  isLoading: boolean;
  isEmpty?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  headerExtra?: React.ReactNode;
}

export function EntityList<T extends Record<string, any>>({
  config,
  data,
  isLoading,
  searchQuery: externalSearchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyMessage,
  headerExtra,
}: EntityListProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(
    config.defaultSort?.key ?? null,
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    config.defaultSort?.direction ?? "asc",
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = config.itemsPerPage ?? 10;

  const searchQuery = externalSearchQuery ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!searchQuery || !config.searchFields?.length) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) =>
      (config.searchFields as string[]).some((field) => {
        const val = item[field];
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [data, searchQuery, config.searchFields]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey as string];
      const bVal = b[sortKey as string];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginated = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const loadingRows = 5;
  const msg = emptyMessage ?? config.emptyMessage ?? "No data found";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 bg-background"
          />
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((col) => (
                <TableHead
                  key={col.key as string}
                  className={
                    col.sortable
                      ? "cursor-pointer select-none hover:text-foreground"
                      : undefined
                  }
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <>
                        {sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </>
                    )}
                  </span>
                </TableHead>
              ))}
              {config.rowActions && (
                <TableHead className="w-20 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={i}>
                  {config.columns.map((col) => (
                    <TableCell key={col.key as string}>
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                  ))}
                  {config.rowActions && (
                    <TableCell>
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    config.columns.length + (config.rowActions ? 1 : 0)
                  }
                >
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    {msg}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, i) => (
                <TableRow
                  key={(item as any).id ?? i}
                  className={
                    config.onRowClick ? "cursor-pointer" : undefined
                  }
                  onClick={() => config.onRowClick?.(item)}
                >
                  {config.columns.map((col) => (
                    <TableCell key={col.key as string} className={col.className}>
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as string] ?? "")}
                    </TableCell>
                  ))}
                  {config.rowActions && (
                    <TableCell className="text-right">
                      {config.rowActions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * itemsPerPage + 1}–
            {Math.min(page * itemsPerPage, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
