package com.orbitguard.common.response;

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
}