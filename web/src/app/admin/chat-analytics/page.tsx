'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bot, RotateCw } from 'lucide-react';
import { chatService } from '@/services/chatService';
import AnalyticsKpiCards from './components/AnalyticsKpiCards';
import AuditLogTable from './components/AuditLogTable';
import AuditLogDetailModal, { AuditLogItem } from './components/AuditLogDetailModal';
import styles from './chatAnalytics.module.css';

export default function AdminChatAnalyticsPage() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await chatService.getAdminAnalytics();
      setKpiData(data);
    } catch (err) {
      console.error('Failed to load chat analytics KPIs:', err);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (targetPage: number) => {
    setLogsLoading(true);
    try {
      const res = await chatService.getAdminAuditLogs(targetPage, 15);
      if (res && res.content) {
        setLogs(res.content);
        setTotalPages(res.totalPages || 1);
        setPage(targetPage);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpi();
    fetchLogs(0);
  }, [fetchKpi, fetchLogs]);

  const handleRefresh = () => {
    fetchKpi();
    fetchLogs(page);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1>
            <Bot size={26} color="#2563eb" />
            AI Chatbot Analytics & Telemetry
          </h1>
          <p className={styles.subtitle}>
            Giám sát hiệu suất hội thoại, độ trễ công cụ, tỷ lệ giải quyết và nhật ký tương tác của hệ thống Boki AI
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={kpiLoading || logsLoading}
        >
          <RotateCw size={14} className={kpiLoading || logsLoading ? 'animate-spin' : ''} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* KPI Cards */}
      <AnalyticsKpiCards data={kpiData} loading={kpiLoading} />

      {/* Audit Logs Section */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Nhật ký kiểm tra hội thoại (Telemetry & Audit Logs)</h2>
      </div>

      <AuditLogTable
        logs={logs}
        loading={logsLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => fetchLogs(newPage)}
        onSelectLog={(log) => setSelectedLog(log)}
      />

      {/* Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
