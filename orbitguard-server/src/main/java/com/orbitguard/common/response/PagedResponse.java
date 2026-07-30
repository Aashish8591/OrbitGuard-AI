package com.orbitguard.common.response;
import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    /**
     * Current page content.
     */
    private List<T> content;

    /**
     * Current page number.
     */
    private int page;

    /**
     * Number of records per page.
     */
    private int size;

    /**
     * Total records in database.
     */
    private long totalElements;

    /**
     * Total available pages.
     */
    private int totalPages;

    /**
     * Indicates whether this is the last page.
     */
    private boolean last;

    /**
     * Converts a Spring Page into a PagedResponse.
     *
     * @param page Spring Data Page
     * @param <T> response type
     * @return paged response
     */
    public static <T> PagedResponse<T> from(Page<T> page) {

        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}