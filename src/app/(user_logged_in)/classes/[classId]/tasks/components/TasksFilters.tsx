"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FancyCheckboxGroup,
  type CheckboxOption,
} from "~/components/FancyCheckboxGroup";

interface Topic {
  id: string;
  name: string;
}

export type DateFilterMode = "none" | "single" | "range";

interface TasksFilterProps {
  topics: Topic[];
  onFilterChange: (filters: {
    selectedTopicIds: string[];
    dueDateMode: DateFilterMode;
    dueDateStart: Date | undefined;
    dueDateEnd: Date | undefined;
    createdDateMode: DateFilterMode;
    createdDateStart: Date | undefined;
    createdDateEnd: Date | undefined;
    workingDateMode: DateFilterMode;
    workingDateStart: Date | undefined;
    workingDateEnd: Date | undefined;
  }) => void;
}

export function TasksFilter({ topics, onFilterChange }: TasksFilterProps) {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // Due date filters
  const [dueDateMode, setDueDateMode] = useState<DateFilterMode>("none");
  const [dueDateStart, setDueDateStart] = useState<Date | undefined>(undefined);
  const [dueDateEnd, setDueDateEnd] = useState<Date | undefined>(undefined);

  // Created date filters
  const [createdDateMode, setCreatedDateMode] =
    useState<DateFilterMode>("none");
  const [createdDateStart, setCreatedDateStart] = useState<Date | undefined>(
    undefined,
  );
  const [createdDateEnd, setCreatedDateEnd] = useState<Date | undefined>(
    undefined,
  );

  // Working date filters
  const [workingDateMode, setWorkingDateMode] =
    useState<DateFilterMode>("none");
  const [workingDateStart, setWorkingDateStart] = useState<Date | undefined>(
    undefined,
  );
  const [workingDateEnd, setWorkingDateEnd] = useState<Date | undefined>(
    undefined,
  );

  const topicOptions: CheckboxOption[] = topics.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  useEffect(() => {
    onFilterChange({
      selectedTopicIds,
      dueDateMode,
      dueDateStart,
      dueDateEnd,
      createdDateMode,
      createdDateStart,
      createdDateEnd,
      workingDateMode,
      workingDateStart,
      workingDateEnd,
    });
  }, [
    selectedTopicIds,
    dueDateMode,
    dueDateStart,
    dueDateEnd,
    createdDateMode,
    createdDateStart,
    createdDateEnd,
    workingDateMode,
    workingDateStart,
    workingDateEnd,
    onFilterChange,
  ]);

  const renderDateFilterControls = (
    label: string,
    mode: DateFilterMode,
    setMode: (v: DateFilterMode) => void,
    start: Date | undefined,
    setStart: (d: Date | undefined) => void,
    end: Date | undefined,
    setEnd: (d: Date | undefined) => void,
  ) => {
    return (
      <div className="space-y-1">
        <div className="font-semibold">{label}</div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={`${label}-mode`}
              value="none"
              checked={mode === "none"}
              onChange={() => setMode("none")}
            />
            <span>No Filter</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={`${label}-mode`}
              value="single"
              checked={mode === "single"}
              onChange={() => setMode("single")}
            />
            <span>Single Date</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={`${label}-mode`}
              value="range"
              checked={mode === "range"}
              onChange={() => setMode("range")}
            />
            <span>Date Range</span>
          </label>
        </div>

        {mode === "single" && (
          <div>
            <DatePicker
              selected={start}
              onChange={(date) => setStart(date ?? undefined)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a date"
            />
          </div>
        )}

        {mode === "range" && (
          <div className="flex items-center space-x-2">
            <div>
              <span>Start: </span>
              <DatePicker
                selected={start}
                onChange={(date) => setStart(date ?? undefined)}
                selectsStart
                startDate={start}
                endDate={end}
                dateFormat="yyyy-MM-dd"
                placeholderText="Start date"
              />
            </div>
            <div>
              <span>End: </span>
              <DatePicker
                selected={end}
                onChange={(date) => setEnd(date ?? undefined)}
                selectsEnd
                startDate={start}
                endDate={end}
                minDate={start}
                dateFormat="yyyy-MM-dd"
                placeholderText="End date"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-background p-4">
      <FancyCheckboxGroup
        label="Topics"
        options={topicOptions}
        selectedValues={selectedTopicIds}
        onChange={setSelectedTopicIds}
      />

      {/* {renderDateFilterControls(
        "Due Date",
        dueDateMode,
        setDueDateMode,
        dueDateStart,
        setDueDateStart,
        dueDateEnd,
        setDueDateEnd,
      )}

      {renderDateFilterControls(
        "Created Date",
        createdDateMode,
        setCreatedDateMode,
        createdDateStart,
        setCreatedDateStart,
        createdDateEnd,
        setCreatedDateEnd,
      )}

      {renderDateFilterControls(
        "Working Date",
        workingDateMode,
        setWorkingDateMode,
        workingDateStart,
        setWorkingDateStart,
        workingDateEnd,
        setWorkingDateEnd,
      )} */}
    </div>
  );
}
