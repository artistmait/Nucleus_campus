import React, { useState } from "react";
import Table from "../../ui/ApprovalsTable";
import { Plus, Trash2 } from "lucide-react";

export default function PrevExamTableWrapper() {
  const [rows, setRows] = useState([
    { no: "1", field1: "", field2: "" },
  ]);

  const reindexRows = (data) =>
    data.map((row, index) => ({
      ...row,
      no: `${index + 1}`,
    }));

  const addRow = () => {
    setRows((prev) =>
      reindexRows([
        ...prev,
        { no: "", field1: "", field2: "" },
      ])
    );
  };

  const deleteRow = (index) => {
    if (rows.length === 1) return; // always keep one row
    setRows((prev) => reindexRows(prev.filter((_, i) => i !== index)));
  };

  const updateCell = (index, key, value) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [key]: value } : row
      )
    );
  };

  const columns = [
    {
      key: "no",
      header: "SEM",
      className: "w-20",
    },
    {
      key: "exam_session",
      header: "Last Appeared Exam with Months and Year",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field1", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
    {
      key: "seat_no",
      header: "Seat Number",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
     {
      key: "num_kt",
      header: "No. of KT's",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
     {
      key: "remarks",
      header: "Remarks",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-16 text-center",
      render: (_, row) => {
        const index = rows.indexOf(row);
        const disabled = rows.length === 1;

        return (
          <button
            onClick={() => deleteRow(index)}
            disabled={disabled}
            className={`p-1 ${
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-red-600 hover:text-red-800"
            }`}
          >
            <Trash2 size={16} />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={addRow}
          className="rounded-full bg-indigo-900 p-2 text-white hover:bg-indigo-800"
        >
          <Plus size={18} />
        </button>
      </div>

      <Table
        data={rows}
        columns={columns}
        searchPlaceholder="Search..."
      />
    </div>
  );
}
