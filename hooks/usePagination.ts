'use client'

import { useState, useCallback } from 'react'

interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
}

interface UsePaginationProps {
  initialItemsPerPage?: number
  onFetch: (page: number, limit: number) => Promise<any>
}

export function usePagination({ initialItemsPerPage = 20, onFetch }: UsePaginationProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: initialItemsPerPage,
    totalPages: 0,
    totalItems: 0
  })
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (page?: number, limit?: number) => {
    const targetPage = page ?? pagination.currentPage
    const targetLimit = limit ?? pagination.itemsPerPage
    
    setLoading(true)
    try {
      const response = await onFetch(targetPage, targetLimit)
      
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage,
          itemsPerPage: response.pagination.itemsPerPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems
        })
      }
      
      return response
    } catch (error) {
      console.error('Pagination fetch error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.itemsPerPage, onFetch])

  const handlePageChange = useCallback((page: number) => {
    fetchData(page, pagination.itemsPerPage)
  }, [fetchData, pagination.itemsPerPage])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    fetchData(1, newItemsPerPage)
  }, [fetchData])

  return {
    ...pagination,
    loading,
    fetchData,
    handlePageChange,
    handleItemsPerPageChange
  }
}