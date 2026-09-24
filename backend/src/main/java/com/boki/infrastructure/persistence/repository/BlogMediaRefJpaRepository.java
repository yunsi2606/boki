package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BlogMediaRefJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlogMediaRefJpaRepository extends JpaRepository<BlogMediaRefJpaEntity, UUID> {

    @Query("SELECT r.mediaUrl FROM BlogMediaRefJpaEntity r WHERE r.blog.id = :blogId")
    List<String> findMediaUrlsByBlogId(@Param("blogId") UUID blogId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BlogMediaRefJpaEntity r WHERE r.blog.id = :blogId")
    void deleteByBlogId(@Param("blogId") UUID blogId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BlogMediaRefJpaEntity r WHERE r.blog.id = :blogId AND r.mediaUrl IN :urls")
    void deleteByBlogIdAndMediaUrlIn(@Param("blogId") UUID blogId, @Param("urls") List<String> urls);
}
