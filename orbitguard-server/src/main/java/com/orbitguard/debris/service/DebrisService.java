package com.orbitguard.debris.service;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.debris.dto.request.CreateDebrisRequest;
import com.orbitguard.debris.dto.request.UpdateDebrisRequest;
import com.orbitguard.debris.dto.response.DebrisResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing Space Debris.
 *
 * <p>
 * Defines all business operations supported by
 * the Debris Module.
 *
 * Responsibilities:
 * <ul>
 *     <li>Create Debris</li>
 *     <li>Update Debris</li>
 *     <li>Get Debris By ID</li>
 *     <li>Get All Debris</li>
 *     <li>Search Debris</li>
 *     <li>Soft Delete Debris</li>
 * </ul>
 * </p>
 *
 * Business logic must NOT be implemented here.
 * It belongs in DebrisServiceImpl.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface DebrisService {

    /**
     * Creates a new Space Debris.
     *
     * @param request create request
     * @return created debris response
     */
    ApiResponse<DebrisResponse> createDebris(CreateDebrisRequest request);

    /**
     * Updates an existing debris.
     *
     * @param id MongoDB ID
     * @param request update request
     * @return updated debris
     */
    ApiResponse<DebrisResponse> updateDebris(
            String id,
            UpdateDebrisRequest request
    );

    /**
     * Returns a debris by MongoDB ID.
     *
     * @param id MongoDB ID
     * @return debris details
     */
    ApiResponse<DebrisResponse> getDebrisById(String id);

    /**
     * Returns all active debris with:
     * pagination,
     * sorting,
     * searching.
     *
     * @param search search keyword
     * @param pageable pagination & sorting
     * @return paginated debris list
     */
    ApiResponse<PagedResponse<DebrisResponse>> getAllDebris(
            String search,
            Pageable pageable
    );

    /**
     * Performs soft delete.
     *
     * @param id MongoDB ID
     * @return success response
     */
    ApiResponse<Void> deleteDebris(String id);

}