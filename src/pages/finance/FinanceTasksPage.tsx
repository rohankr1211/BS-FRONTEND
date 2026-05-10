import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaSyncAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { financeService } from '../../services/financeService';
import type { FinanceTaskResponse } from '../../services/financeService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: 'warning', label: 'Pending' },
  SUBMITTED: { bg: 'primary', label: 'Submitted' },
  COMPLETED: { bg: 'success', label: 'Completed' },
  REJECTED: { bg: 'danger', label: 'Rejected' }
};

export const FinanceTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<FinanceTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState('');

  const load = async () => { setLoading(true); setTasks(await financeService.getTasks()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    await financeService.submitTask(id);
    await load();
    setSubmitting('');
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Finance Tasks</h3><p className="text-muted mb-0">Assigned tasks requiring financial review or processing.</p></div>
        <Button variant="outline-dark" className="rounded-3 d-flex align-items-center gap-2" onClick={load}><FaSyncAlt /> Sync Tasks</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading tasks...</div> : tasks.length === 0 ? (
        <div className="text-center py-5"><FaClipboardList size={48} className="text-muted opacity-25 mb-3" /><p className="text-muted">No finance tasks assigned.</p></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {tasks.map(task => {
            const sta = STATUS_CONFIG[task.status];
            return (
              <Card key={task.assignedTaskId} className={`border-0 shadow-sm rounded-4 border-start border-4 border-${sta.bg}`}>
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0">{task.taskDescription}</h6>
                        <Badge bg={sta.bg} className={task.status === 'PENDING' ? 'text-dark' : ''}>{sta.label}</Badge>
                      </div>
                      <div className="small text-muted mb-1"><span className="fw-semibold text-dark">{task.projectName}</span> · Assigned by {task.assignedByName} · {new Date(task.assignedAt).toLocaleDateString()}</div>
                    </div>
                    {task.status === 'PENDING' && <Button variant="dark" size="sm" className="rounded-3 px-4" style={{ backgroundColor: '#2c3e50' }} disabled={submitting === task.assignedTaskId} onClick={() => handleSubmit(task.assignedTaskId)}>{submitting === task.assignedTaskId ? '...' : 'Complete Task'}</Button>}
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
