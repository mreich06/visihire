'use client';

import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';

import { moveJob } from '@/app/actions/jobs';
import JobCard from '@/components/job-card';
import type { Job, JobStatus } from '@/generated/prisma/client';
import Modal from '../ui/modal';
import AddJobForm from '../add-job-form';

const COLUMNS: { status: JobStatus; label: string }[] = [
  { status: 'WISHLIST', label: 'Wishlist' },
  { status: 'APPLIED', label: 'Applied' },
  { status: 'INTERVIEWING', label: 'Interviewing' },
  { status: 'OFFER', label: 'Offer' },
  { status: 'REJECTED', label: 'Rejected' },
];

interface BoardProps {
  jobs: Record<JobStatus, Job[]>;
}

const Board = ({ jobs }: BoardProps) => {
  const [board, setBoard] = useState(jobs);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDrop = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const from = source.droppableId as JobStatus;
    const to = destination.droppableId as JobStatus;

    if (from === to && source.index === destination.index) return;

    const fromCol = [...board[from]];
    const [moved] = fromCol.splice(source.index, 1);

    const toCol = from === to ? fromCol : [...board[to]];
    toCol.splice(destination.index, 0, { ...moved, status: to });

    setBoard({ ...board, [from]: fromCol, [to]: toCol });

    moveJob(
      draggableId,
      to,
      toCol.map((job) => job.id),
    );
  };

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <div>
        <div className="flex justify-between">
          <h1 className="mb-6 text-xl font-semibold">Application Board</h1>
          <button className="mb-6 text-base font-semibold bg-white rounded border border-gray-200 px-2 py-1" onClick={() => setModalOpen(true)}>
            Add job
          </button>
        </div>

        <div className="flex gap-4 pb-4">
          {COLUMNS.map(({ status, label }) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <section className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</h2>
                    <span className="rounded-full border border-gray-200 bg-white px-1.5 text-xs text-gray-400 tabular-nums">
                      {board[status].length}
                    </span>
                  </div>

                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex min-h-2 flex-col gap-2">
                    {board[status].map((job, index) => (
                      <Draggable draggableId={job.id} index={index} key={job.id}>
                        {(dragProvided) => (
                          <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                            <JobCard job={job} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </section>
              )}
            </Droppable>
          ))}
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <AddJobForm onSuccess={() => setModalOpen(false)} />
      </Modal>
    </DragDropContext>
  );
};

export default Board;
